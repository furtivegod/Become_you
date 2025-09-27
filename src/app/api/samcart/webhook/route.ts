import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const isTest = url.searchParams.get('test') === '1'
      || request.headers.get('x-test-webhook') === 'true'
      || process.env.SAMCART_TEST_MODE === 'true'

    const body = await request.text()
    const signature = request.headers.get('x-samcart-signature')
    
    if (!isTest) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
      }

      // Verify SamCart webhook signature
      const webhookSecret = process.env.SAMCART_WEBHOOK_SECRET!
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Parse data (allow empty/minimal body in test mode)
    const parsed = body ? JSON.parse(body) : {}

    const data = {
      status: 'completed',
      customer_email: parsed.customer_email || url.searchParams.get('email') || 'tester@example.com',
      order_id: parsed.order_id || url.searchParams.get('order_id') || `test_${Date.now()}`,
      ...parsed
    }
    
    // Only process successful orders in non-test mode
    if (!isTest && data.status !== 'completed') {
      return NextResponse.json({ message: 'Order not completed, skipping' })
    }

    const { customer_email, order_id } = data

    // Create or get user
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', customer_email)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({ email: customer_email })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      user = newUser
    } else if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }

    // Add null check for user
    if (!user) {
      console.error('User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 500 })
    }

    // Create order record (ignore duplicate provider_ref errors gracefully in test mode)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        provider_ref: order_id,
        status: 'completed'
      })
      .select('id')
      .single()

    if (orderError) {
      const isUniqueViolation = (orderError as unknown as { code?: string }).code === '23505'
      if (!isTest || !isUniqueViolation) {
        console.error('Error creating order:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }
    }

    // Create assessment session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: user.id,
        status: 'active'
      })
      .select('id')
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Send magic link email (skip in test mode if email is clearly fake)
    if (!isTest || (isTest && customer_email !== 'tester@example.com')) {
      await sendMagicLink(customer_email, session.id)
    }

    return NextResponse.json({ 
      message: isTest ? 'Test webhook processed successfully' : 'Webhook processed successfully',
      session_id: session.id,
      test_mode: isTest
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
