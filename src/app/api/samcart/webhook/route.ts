import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-samcart-signature')
    
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

    const data = JSON.parse(body)
    
    // Only process successful orders
    if (data.status !== 'completed') {
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

    // Create order record
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
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
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

    // Send magic link email
    await sendMagicLink(customer_email, session.id)

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      session_id: session.id 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
