import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    if (error) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
