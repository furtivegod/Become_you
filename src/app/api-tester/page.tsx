"use client"

import { useState } from "react"

export default function BecomeYou_API_TesterPage() {
  const [email, setEmail] = useState("deondreivory328@gmail.com")
  const [status, setStatus] = useState("completed")
  const [testHeader, setTestHeader] = useState(true)
  const [bodyMode, setBodyMode] = useState<"query" | "json">("json")
  const [loading, setLoading] = useState(false)
  const [responseText, setResponseText] = useState("")

  const [sessionUserId, setSessionUserId] = useState("")
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionResponse, setSessionResponse] = useState("")

  const callWebhook = async () => {
    setLoading(true)
    setResponseText("")

    try {
      const url = new URL("/api/samcart/webhook", window.location.origin)
      url.searchParams.set("test", "1")
      if (bodyMode === "query") {
        url.searchParams.set("email", email)
      }

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          ...(testHeader ? { "x-test-webhook": "true" } : {}),
          ...(bodyMode === "json" ? { "Content-Type": "application/json" } : {}),
        },
        body:
          bodyMode === "json"
            ? JSON.stringify({ status, customer_email: email })
            : undefined,
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
          <p className="text-gray-600 mb-6">Send a simulated purchase event to <code>/api/samcart/webhook</code> (test mode).</p>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status (webhook only)</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="completed">completed</option>
                <option value="failed">failed</option>
              </select>
            </div>
            {/* <div className="flex items-center space-x-2">
              <input id="use-header" type="checkbox" checked={testHeader} onChange={(e) => setTestHeader(e.target.checked)} />
              <label htmlFor="use-header" className="text-sm text-gray-700">Send x-test-webhook header (webhook only)</label>
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payload Mode (webhook only)</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="body-mode"
                    checked={bodyMode === "json"}
                    onChange={() => setBodyMode("json")}
                  />
                  <span>JSON body</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="body-mode"
                    checked={bodyMode === "query"}
                    onChange={() => setBodyMode("query")}
                  />
                  <span>Query params</span>
                </label>
              </div>
            </div> */}

            <div className="flex items-center space-x-3">
              <button
                onClick={callWebhook}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Test Webhook (/api/samcart/webhook)'}
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