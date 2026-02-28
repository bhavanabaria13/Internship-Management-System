
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Briefcase, Users, Rocket, Award, Globe, Code, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Code,
    title: "Blockchain Development",
    description: "Work on real DeFi smart contracts, debug live testnet issues, and deploy production-grade code.",
    gradient: "from-purple-500 via-purple-600 to-blue-500",
    accentColor: "purple",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description: "Weekly sessions with senior blockchain developers and security auditors.",
    gradient: "from-blue-500 via-blue-600 to-cyan-500",
    accentColor: "blue",
  },
  {
    icon: Award,
    title: "Certification & Portfolio",
    description: "Earn internship certificates and build verifiable projects you can confidently showcase.",
    gradient: "from-cyan-500 via-cyan-600 to-teal-500",
    accentColor: "cyan",
  },
  {
    icon: Briefcase,
    title: "Professional Workflow",
    description: "Hands-on exposure to Git, PR reviews, CI/CD pipelines, audits, and industry best practices.",
    gradient: "from-teal-500 via-teal-600 to-green-500",
    accentColor: "teal",
  },
  {
    icon: GraduationCap,
    title: "Web3 Career Boost",
    description: "Opportunities to connect with partner companies, clients, and real Web3 job roles.",
    gradient: "from-green-500 via-emerald-500 to-yellow-500",
    accentColor: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Remote & Collaborative",
    description: "Work remotely with flexible schedules while collaborating in an active developer cohort.",
    gradient: "from-yellow-500 via-orange-500 to-orange-600",
    accentColor: "orange",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 md:py-32 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-blue-500/5" />
      
      {/* Multiple animated banners */}
      <div className="absolute left-0 top-1/4 w-1/3 h-1/2 opacity-15 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80" 
          alt="Blockchain technology" 
          className="w-full h-full object-cover blur-sm animate-float"
        />
      </div>
      <div className="absolute right-0 bottom-1/4 w-1/4 h-1/3 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80" 
          alt="Team collaboration" 
          className="w-full h-full object-cover blur-sm animate-float"
          style={{ animationDelay: '3s' }}
        />
      </div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Program Benefits
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Why Choose{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              EtherAuthority?
            </span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            A career-focused internship built around real blockchain engineering, security-first development, and professional exposure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="professional-card group relative p-8 rounded-3xl backdrop-blur-sm bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/0 border border-white/10 hover:border-white/20 animate-fade-in-up overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-[0.12] transition-all duration-700 blur-2xl scale-90 group-hover:scale-110`} />

              {/* Radial glow effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-radial from-${benefit.accentColor}-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700`} />

              {/* Border glow animation */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 -z-10`} />

              {/* Shimmer overlay */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1500 ease-in-out" />
              </div>

              {/* Top corner accent */}
              <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-all duration-700 scale-50 group-hover:scale-100`} />

              {/* Bottom corner accent */}
              <div className={`absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr ${benefit.gradient} opacity-0 group-hover:opacity-15 rounded-full blur-3xl transition-all duration-700 delay-100`} />

              <div className="relative z-10">
                {/* Icon container with enhanced effects */}
                <div className="relative mb-6 group/icon">
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 rounded-2xl scale-75 group-hover:scale-100`} />
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${benefit.gradient} p-[2px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-${benefit.accentColor}-500/50`}>
                    <div className="w-full h-full rounded-2xl bg-background/90 backdrop-blur-sm flex items-center justify-center group-hover:bg-background/70 transition-all duration-500">
                      <benefit.icon className={`w-10 h-10 text-${benefit.accentColor}-400 group-hover:text-white group-hover:scale-110 transition-all duration-500 drop-shadow-lg`} />
                    </div>
                  </div>
                </div>

                {/* Title with gradient on hover */}
                <h3 className={`text-xl font-bold mb-4 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:${benefit.gradient} group-hover:bg-clip-text group-hover:text-transparent group-hover:translate-x-1`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {benefit.title}
                </h3>

                {/* Description with better readability */}
                <p className="text-foreground/70 leading-relaxed group-hover:text-foreground/95 transition-all duration-500 text-[15px]">
                  {benefit.description}
                </p>

                {/* Animated bottom border accent */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${benefit.gradient} group-hover:w-full transition-all duration-700 ease-out rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
