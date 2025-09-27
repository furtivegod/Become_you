"use client"

import { useState } from "react"

export default function BecomeYou_API_TesterPage() {
  const [email, setEmail] = useState("deondreivory328@gmail.com")
  const [status, setStatus] = useState("completed")
  const [bodyMode, setBodyMode] = useState<"query" | "json">("json")
  const [loading, setLoading] = useState(false)
  const [responseText, setResponseText] = useState("")

  const [sessionUserId, setSessionUserId] = useState("")
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionResponse, setSessionResponse] = useState("")

  async function hmacSHA256Hex(secret: string, message: string): Promise<string> {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    )
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(message))
    const bytes = new Uint8Array(sigBuf)
    let hex = ""
    for (let i = 0; i < bytes.length; i++) {
      const h = bytes[i].toString(16).padStart(2, "0")
      hex += h
    }
    return hex
  }

  const callWebhook = async () => {
    setLoading(true)
    setResponseText("")
    const webhookSecret = process.env.SAMCART_WEBHOOK_SECRET!

    console.log(process.env.SAMCART_WEBHOOK_SECRET)
    try {
      if (!webhookSecret) {
        setResponseText("1234567890")
        setLoading(false)
        return
      }

      const url = new URL("/api/samcart/webhook", window.location.origin)

      const bodyObj = { status, customer_email: email }
      const bodyStr = JSON.stringify(bodyObj)
      const signature = await hmacSHA256Hex(webhookSecret, bodyStr)

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-samcart-signature": signature
        },
        body: bodyStr
      })

      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setResponseText(JSON.stringify(json, null, 2))
      } catch {
        setResponseText(text)
      }
    } catch (e: any) {
      setResponseText("Request failed: " + (e?.message || String(e)))
    } finally {
      setLoading(false)
    }
  }

  const createSession = async () => {
    setSessionLoading(true)
    setSessionResponse("")
    try {
      const res = await fetch("/api/assessment/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: sessionUserId })
      })
      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setSessionResponse(JSON.stringify(json, null, 2))
      } catch {
        setSessionResponse(text)
      }
    } catch (e: any) {
      setSessionResponse("Request failed: " + (e?.message || String(e)))
    } finally {
      setSessionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">SamCart Webhook Tester</h1>
          <p className="text-gray-600 mb-6">Send a signed purchase event to <code>/api/samcart/webhook</code>.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={callWebhook}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Signed Webhook'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Response</label>
              <pre className="w-full bg-gray-100 rounded p-3 overflow-auto text-sm whitespace-pre-wrap">{responseText}</pre>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Assessment Session Tester</h2>
          <p className="text-gray-600 mb-6">Create an assessment session via <code>/api/assessment/session</code>.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supabase User ID</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={sessionUserId}
                onChange={(e) => setSessionUserId(e.target.value)}
                placeholder="uuid-of-existing-user"
              />
            </div>

            <button
              onClick={createSession}
              disabled={sessionLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {sessionLoading ? 'Creating…' : 'Create Session'}
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Response</label>
              <pre className="w-full bg-gray-100 rounded p-3 overflow-auto text-sm whitespace-pre-wrap">{sessionResponse}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 