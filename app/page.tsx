import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Footer from "@/components/footer"
import FeatureCard from "@/components/feature-card"
import { Shield, BarChart3, Zap, Lock, Bell, Users } from "lucide-react"

const features = [
  {
    icon: <Shield size={24} />,
    title: "Enterprise Security",
    description:
      "Bank-level encryption and compliance with international security standards. Your data is always protected.",
    gradient: "from-pink-500 to-red-500",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Smart Analytics",
    description:
      "Detailed insights into your spending patterns. Visual reports help you understand where your money goes.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <Zap size={24} />,
    title: "Instant Payments",
    description:
      "Send and receive payments in seconds. Real-time notifications keep you informed of every transaction.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: <Lock size={24} />,
    title: "Biometric Security",
    description: "Multi-factor authentication and biometric login for maximum account security and peace of mind.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: <Bell size={24} />,
    title: "Smart Alerts",
    description: "Get notified of suspicious activity instantly. Customize alerts based on your preferences and needs.",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    icon: <Users size={24} />,
    title: "Team Management",
    description: "Manage team expenses and approvals. Built-in collaboration tools for businesses of any size.",
    gradient: "from-green-500 to-emerald-500",
  },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background via-gradient-primary-subtle to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Everything you need to <span className="gradient-text">manage payments</span>
              </h2>
              <p className="text-lg text-foreground-muted">
                Powerful tools designed to make your financial life simpler, more secure, and more transparent.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-12 md:p-16 text-white text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">Ready to secure your payments?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join thousands of users who trust SecurePay+ with their financial security.
              </p>
              <button className="px-8 py-3 rounded-full bg-white text-purple-600 font-semibold hover:shadow-xl transition-shadow duration-300">
                Get Started Now
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}


