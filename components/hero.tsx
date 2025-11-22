"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import PhoneMockup from "./phone-mockup"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 md:pt-32 pb-16 md:pb-24">
      {/* Background gradient blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <span className="text-sm font-medium gradient-text">Now live for early access</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                <span className="gradient-text">Secure Payments</span> <span>Made Simple</span>
              </h1>
              <p className="text-lg text-foreground-muted max-w-lg leading-relaxed">
                SecurePay+ combines enterprise-grade payment security with an intuitive expense tracker. Control your
                finances with confidence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/auth/signup"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-xl hover:shadow-pink-200 transition-shadow duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/features"
                className="px-8 py-3 rounded-full border-2 border-purple-200 text-foreground hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                Learn More
              </Link>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4">
              {["Bank-level security encryption", "Real-time expense tracking", "Instant payment notifications"].map(
                (feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <span className="text-foreground-muted">{feature}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Right - Phone Mockup */}
          <div className="hidden md:flex justify-center items-center">
            <PhoneMockup />
          </div>
        </div>

        {/* Mobile Phone Mockup */}
        <div className="md:hidden flex justify-center items-center mt-12">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}
