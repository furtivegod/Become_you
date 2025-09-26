export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            BECOME YOU
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your life with personalized 30-day protocols. 
            Complete our AI-powered assessment and receive your custom roadmap to growth.
          </p>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                How It Works
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <span className="text-gray-700">Complete our assessment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <span className="text-gray-700">AI analyzes your responses</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <span className="text-gray-700">Receive your 30-day protocol</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <a 
                href="https://your-samcart-checkout-url.com" 
                className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg"
              >
                Start Your Assessment - $97
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Secure payment • Instant access • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
