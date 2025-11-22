import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProfileCard from "@/components/profile-card"

const team = [
  {
    name: "Harshit Raj",
    role: "Frontend developer and Leader",
    image: "SA",
    bio: "First year student and Passionate about financial accessibility.",
  },
  {
    name: "Poorvik A",
    role: "Backend Developer",
    image: "MC",
    bio: "First Year Student and Backend developer.",
  },
  {
    name: "Rudrarajsinh Attadoriya",
    role: "Full Stack developer",
    image: "ER",
    bio: "First year Student . Learning Finance in Smart ways",
  },
  {
    name: "Anish Madhyastha",
    role: "Fronted Developer",
    image: "JW",
    bio: "First Year Student and skilled in react.js.",
  },
  {
    name: "Aanya Vishwakarma",
    role: "Backend Developer and marketing expert",
    image: "PP",
    bio: "First Year Student and highly interested in marketing and coding.",
  },
  {
    name: "Siddhi vinayak",
    role: "Database manager.",
    image: "DK",
    bio: "First year Student and Interested in DBS SQL and MONGO DB.",
  },
]

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-gradient-primary-subtle to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Meet the <span className="gradient-text">team</span>
            </h1>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Experienced leaders building the future of secure payments.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member) => (
                <ProfileCard
                  key={member.name}
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  bio={member.bio}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-32 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-foreground text-center mb-16">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Security First",
                  description: "Your security is never negotiable. Every decision is made with your safety in mind.",
                },
                {
                  title: "Transparency",
                  description: "No hidden fees, no surprises. We believe in clear communication and honest pricing.",
                },
                {
                  title: "Innovation",
                  description:
                    "Always pushing boundaries. We invest heavily in R&D to bring you cutting-edge features.",
                },
              ].map((value, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-foreground-muted">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
