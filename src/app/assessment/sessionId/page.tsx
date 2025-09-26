"use client"

import { useState } from "react"
import ChatInterface from "@/components/ChatInterface"
import ConsentScreen from "@/components/ConsentScreen"
import { verifyToken } from "@/lib/auth"

interface AssessmentPageProps {
  params: { sessionId: string }
  searchParams: { token?: string }
}

export default function AssessmentPage({ params, searchParams }: AssessmentPageProps) {
  const { sessionId } = params
  const { token } = searchParams
  const [hasConsented, setHasConsented] = useState(false)

  // Verify token and session
  const isValid = verifyToken(token, sessionId)

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Access</h1>
          <p className="text-gray-600">This assessment link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (!hasConsented) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsentScreen onConsent={() => setHasConsented(true)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            <div className="border-b p-4">
              <h1 className="text-2xl font-bold text-gray-800">BECOME YOU Assessment</h1>
              <p className="text-gray-600">Let&apos;s discover your path to transformation</p>
            </div>
            
            <ChatInterface 
              sessionId={sessionId} 
              onComplete={() => {
                // Handle completion
                console.log('Assessment completed')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}