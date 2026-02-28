
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

const requirements = [

"We are excited to announce that EtherAuthority is hiring Interns who are enthusiastic, motivated, and eager to learn.",
"\n",
"This internship offers an excellent opportunity to gain hands-on experience, work on real-world projects, and develop professional and ethical work practices under structured guidance.",

"Who Can Apply",

"✔️ Students or freshers passionate about learning",
"✔️ Candidates who are hardworking, professional, and committed",
"✔️ Individuals willing to dedicate time and effort to skill development",

"Internship Details",

"✔️ Internship Start Date: 19th January, 2026",
"✔️ Duration: 1 Month",
"✔️ Mode: Remote",
"✔️ Training: Structured Internship Program",
"✔️ Work Commitment: 20–25 hours per week",
"✔️ Stipend: Details will be communicated to selected candidates",

"📌 Apply Now: https://forms.gle/Pa17hHj9K9xwt4SaA",

"📌 Last Date to Apply: 13th January, 2026",

"Join us and take the first step toward building a strong professional career with EtherAuthority.",
];

export default function RequirementsSection() {
  return (
    <section id="requirements" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-900/10 to-background pointer-events-none" />
      
      {/* Enhanced animated banners */}
      <div className="absolute right-0 top-1/4 w-1/3 h-1/2 opacity-15 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
          alt="Team collaboration" 
          className="w-full h-full object-cover blur-sm animate-float" 
          style={{ animationDelay: '1s' }}
        />
      </div>
      <div className="absolute left-0 bottom-1/4 w-1/4 h-1/3 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80" 
          alt="Professional workspace" 
          className="w-full h-full object-cover blur-sm animate-float" 
          style={{ animationDelay: '2.5s' }}
        />
      </div>
      
      {/* Floating gradient effects */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Requirements
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🌟 Internship Hiring Announcement 🌟
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We welcome passionate individuals eager to learn and grow in the blockchain and Web3 space.
            </p>
            
            <ul className="space-y-4">
              {requirements.map((req, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                 
                  <span className="text-foreground group-hover:text-foreground/90 transition-colors">
                    {req}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-slide-in-right group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-3xl blur-3xl group-hover:blur-2xl transition-all animate-pulse-glow group-hover:scale-105 duration-500" />
            <div className="relative professional-card p-8 rounded-3xl backdrop-blur-sm bg-gradient-to-br from-white/5 to-white/0 border border-white/10 group-hover:border-purple-500/40 transition-all duration-500 overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
              
              {/* Enhanced gradient corner accents */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
                  alt="Professional team" 
                  className="w-full h-auto rounded-2xl shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-500 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 inline-block">Join Our Team</h3>
                  <p className="text-foreground/70 group-hover:text-foreground/95 transition-all duration-300">
                    Be part of a dynamic team working on innovative blockchain solutions that are shaping the future of Web3.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
