
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, TrendingUp, Award, ArrowRight } from "lucide-react";

export default function Career() {
  const [, setLocation] = useLocation();
  const positions = [
    {
      title: "Blockchain Developer",
      type: "Full-time",
      location: "Remote",
      description: "Build cutting-edge blockchain solutions and smart contracts for enterprise clients.",
      skills: ["Solidity", "Web3.js", "Node.js", "React"]
    },
    {
      title: "Security Auditor",
      type: "Full-time",
      location: "Remote",
      description: "Conduct comprehensive security audits of smart contracts and blockchain protocols.",
      skills: ["Smart Contract Auditing", "Solidity", "Security Best Practices"]
    },
    {
      title: "Frontend Developer",
      type: "Full-time",
      location: "Remote",
      description: "Create beautiful and responsive Web3 applications using modern frontend technologies.",
      skills: ["React", "TypeScript", "TailwindCSS", "Web3 Integration"]
    }
  ];

  const benefits = [
    { icon: Users, title: "Remote Work", description: "Work from anywhere in the world" },
    { icon: TrendingUp, title: "Career Growth", description: "Continuous learning and advancement opportunities" },
    { icon: Award, title: "Competitive Pay", description: "Industry-leading compensation packages" },
    { icon: Briefcase, title: "Exciting Projects", description: "Work on cutting-edge blockchain technology" }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-blue-900/10 pointer-events-none" />
      <Header onApplyClick={() => setLocation('/career')} onAdminClick={() => setLocation('/admin/login')} onInternClick={() => setLocation('/intern/login')} />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center" style={{ marginTop: "22px"}}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <Briefcase className="w-4 h-4 mr-2 inline" />
              Join Our Team
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Build the Future of Web3
            </h1>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-8">
              Join EtherAuthority and work with a talented team building innovative blockchain solutions that are transforming industries worldwide.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-purple-500/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Work With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-white/10 bg-gradient-to-br from-purple-500/5 to-blue-500/5 hover:border-purple-500/30 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/60">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Open Positions</h2>
            <div className="grid gap-6">
              {positions.map((position, index) => (
                <Card key={index} className="border-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{position.title}</h3>
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {position.type}
                          </Badge>
                        </div>
                        <p className="text-foreground/60 mb-4">{position.location}</p>
                        <p className="text-foreground/80 mb-4">{position.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {position.skills.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="border-purple-500/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group-hover:scale-105 transition-transform">
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Don't See the Right Position?</h2>
            <p className="text-xl text-foreground/70 mb-8">
              We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
             
            >
			<a href="https://forms.gle/Pa17hHj9K9xwt4SaA" target="_blank">
              Submit Your Application 
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer 
        onCareerClick={() => setLocation('/')}
      />
    </div>
  );
}
