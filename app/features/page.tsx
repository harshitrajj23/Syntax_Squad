import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import FeatureCard from "@/components/feature-card"
import { Shield, Clock, Globe, Smartphone } from "lucide-react"

const detailedFeatures = [
  {
    icon: <Shield size={24} />,
    title: "Military-Grade Encryption",
    description:
      "End-to-end encryption for all transactions. Your data is protected with the same technology used by governments.",
    gradient: "from-pink-500 to-red-500",
  },
  {
    icon: <Clock size={24} />,
    title: "Real-Time Processing",
    description:
      "Transactions processed instantly. No waiting periods, no delays. Get your money where it needs to go immediately.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <Globe size={24} />,
    title: "Global Reach",
    description: "Send money to 150+ countries. Low international transfer fees with competitive exchange rates.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: <Smartphone size={24} />,
    title: "Mobile-First Design",
    description: "Full-featured app available on iOS and Android. Manage your finances on the go, anytime, anywhere.",
    gradient: "from-blue-500 to-indigo-500",
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-gradient-primary-subtle to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Packed with <span className="gradient-text">powerful features</span>
            </h1>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Everything you need to take control of your financial life. From security to analytics.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {detailedFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                />
              ))}
            </div>

            {/* Comparison Table */}
            <div className="mt-20">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                Why choose SecurePay+?
              </h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-background-secondary border-b border-border">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">SecurePay+</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground-muted">Competitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["24/7 Live Support", "✓", "✓"],
                      ["Real-Time Analytics", "✓", "Soon"],
                      ["Multi-Currency Support", "✓", "✓"],
                      ["Biometric Security", "✓", "Extra Fee"],
                      ["Team Management", "✓", "Premium"],
                      ["Custom Integrations", "✓", "Extra Fee"],
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-background-secondary transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{row[0]}</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">{row[1]}</td>
                        <td className="px-6 py-4 text-center text-sm text-foreground-muted">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
