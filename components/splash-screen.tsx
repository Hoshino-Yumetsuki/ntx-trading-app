"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Zap } from "lucide-react"

export function SplashScreen() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div className="min-h-screen diffused-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Logo and Brand */}
      <div
        className={`text-center transition-all duration-1000 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto glass-card-strong rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl font-bold gradient-text">NTX</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 glass-card rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 gradient-text">NTX</h1>

        <div className="space-y-3 mb-8">
          <p className="text-xl font-semibold text-slate-700">专业投资互动社区</p>
          <p className="text-lg text-slate-600 max-w-xs mx-auto leading-relaxed">为Web3交易而生</p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <TrendingUp className="w-5 h-5 animate-bounce" />
          <span className="text-sm">正在加载...</span>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}
