import type React from "react"
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  gradient = "from-pink-500 to-purple-500",
}: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-2xl bg-background border border-border hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 cursor-pointer">
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-3 text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-foreground-muted leading-relaxed">{description}</p>

      {/* Bottom accent */}
      <div className="mt-4 h-1 w-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full group-hover:w-12 transition-all duration-300"></div>
    </div>
  )
}
