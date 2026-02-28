
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onApplyClick: () => void;
}

export default function HeroSection({ onApplyClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-background to-blue-900/30 animate-gradient" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Enhanced floating orbs with glow */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Enhanced hero banner with multiple images */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/60 to-background z-10" />
        <div className="relative w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80" 
            alt="Blockchain technology" 
            className="absolute inset-0 w-full h-full object-cover animate-scale-in opacity-70"
          />
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80" 
            alt="Data analytics" 
            className="absolute inset-0 w-full h-full object-cover animate-scale-in opacity-30 mix-blend-screen"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
        {/* Animated border effect */}
        <div className="absolute inset-0 border-l-2 border-purple-500/20 animate-glow z-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 z-20">
        <div className="max-w-3xl">
          <div className="animate-fade-in-up">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              <a onClick={onApplyClick} target="_blank">Now Hiring Interns</a>
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 animate-fade-in-up" style={{ fontFamily: 'Space Grotesk, sans-serif', animationDelay: '0.1s' }}>
            Launch Your {" "}Blockchain Career{" "} with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              EtherAuthority Internship
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
			Gain real-world experience in smart contracts, DeFi, Web3 development, and security — guided by industry experts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              onClick={onApplyClick}
              className="group relative px-10 py-7 text-lg rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-2xl shadow-purple-500/30 hover:shadow-3xl hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-0 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center">
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
            
          </div>

          {/* Enhanced stats with glassmorphism */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 group-hover:border-purple-500/30 transition-all">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  50+
                </div>
                <div className="text-sm text-foreground/60">Successful Interns</div>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 group-hover:border-blue-500/30 transition-all">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  1000+
                </div>
                <div className="text-sm text-foreground/60">Completed Projects</div>
              </div>
            </div>
            <div className="text-center group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 group-hover:border-pink-500/30 transition-all">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  95%
                </div>
                <div className="text-sm text-foreground/60">Placement Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
