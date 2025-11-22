interface ProfileCardProps {
  name: string
  role: string
  image: string
  bio: string
}

export default function ProfileCard({ name, role, image, bio }: ProfileCardProps) {
  return (
    <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-background-secondary to-background border border-border hover:border-purple-200 transition-all duration-300">
      {/* Avatar */}
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
        {name.charAt(0)}
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
      <p className="text-sm font-medium gradient-text mb-4">{role}</p>
      <p className="text-sm text-foreground-muted leading-relaxed">{bio}</p>
    </div>
  )
}
