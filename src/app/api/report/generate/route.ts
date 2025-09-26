import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateStructuredPlan } from '@/lib/claude'
import { generatePDF } from '@/lib/pdf'
import { sendReportEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
    }

    // Generate conversation history string
    const conversationHistory = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')

    // Generate structured plan
    const planData = await generateStructuredPlan(conversationHistory)

    // Save plan to database
    const { error: planError } = await supabase
      .from('plan_outputs')
      .insert({
        session_id: sessionId,
        plan_data: planData
      })

    if (planError) {
      console.error('Error saving plan:', planError)
      return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 })
    }

    // Generate PDF
    const pdfUrl = await generatePDF(planData, sessionId)

    // Update PDF job status
    const { error: pdfJobError } = await supabase
      .from('pdf_jobs')
      .insert({
        session_id: sessionId,
        status: 'completed',
        pdf_url: pdfUrl
      })

    if (pdfJobError) {
      console.error('Error updating PDF job:', pdfJobError)
    }

    // Get user email
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        users!inner(email)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('Error fetching session:', sessionError)
      return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
    }

    // Send report email
    await sendReportEmail(session.users[0].email, pdfUrl)

    return NextResponse.json({ 
      success: true,
      pdfUrl,
      message: 'Report generated and sent successfully'
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
