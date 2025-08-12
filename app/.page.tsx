// app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { orgSchema } from "@/lib/jsonLd";
import { CheckCircle, ShieldCheck, Sparkles, Star, Timer } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Page-specific SEO Metadata
export const metadata: Metadata = {
  title: "Detailing Co. | Premium Auto Detailing & Frictionless Assessments",
  description:
    "Experience the best in auto detailing. Get a fast, free, and transparent online assessment for your vehicle. We specialize in ceramic coatings, paint correction, and more.",
  keywords: ["auto detailing", "car wash", "ceramic coating", "paint correction", "vehicle assessment", "San Antonio"],
};


export default function HomePage() {
  return (
    <>
      {/* Inject SEO Structured Data into the page's <head> */}
      <JsonLd data={orgSchema} />

      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Your Car's Second Chance at a First Impression.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
                Forget phone calls and waiting. Our modern platform provides a
                frictionless assessment for premium detailing services, tailored just
                for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/assessment/new">Get My Free Assessment</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#services">View Our Services</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=2070&auto=format&fit=crop" // Replace with your own high-quality image
                alt="A beautifully detailed luxury car with a glossy finish"
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/5 py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Why We're Different</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">We combine master craftsmanship with modern technology to deliver unparalleled results and convenience.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6">
                <Timer size={40} className="text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                <p className="text-muted-foreground">Our online assessment takes minutes, not hours. Get a quote without ever leaving your home.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <CheckCircle size={40} className="text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transparent Process</h3>
                <p className="text-muted-foreground">No hidden fees. You'll see the full scope and cost of the service before you commit.</p>
              </div>
              <div className="flex flex-col items-center p-6">
                <Sparkles size={40} className="text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Expert Quality</h3>
                <p className="text-muted-foreground">Our detailers are certified professionals who treat every vehicle like their own.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="container mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Signature Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From deep cleaning to long-term protection, we have a solution for every need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Interior Revival", desc: "Full steam cleaning, leather conditioning, and odor elimination." },
              { title: "Exterior Hand Polish", desc: "Meticulous hand wash, clay bar, and a high-gloss wax finish." },
              { title: "Paint Correction", desc: "Multi-stage process to remove swirls and restore mirror-like clarity." },
              { title: "Ceramic Shield", desc: "9H ceramic coating for years of hydrophobic protection and shine." },
            ].map((service) => (
              <Card key={service.title} className="bg-white/5 border-secondary/20 hover:border-primary transition-colors duration-300">
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white/5">
          <div className="container px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Your Frictionless Journey</h2>
            <div className="relative flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>

              {[
                { step: 1, title: "Submit Online", desc: "Fill our intuitive form with your vehicle's details." },
                { step: 2, title: "Receive Quote", desc: "We review and send a detailed, transparent quote." },
                { step: 3, title: "Schedule & Shine", desc: "Approve and book your service. We handle the rest." },
              ].map((item) => (
                <div key={item.step} className="relative z-10 flex flex-col items-center text-center p-4 w-full md:w-1/3">
                  {/* Note: v4 requires explicit border color like border-primary */}
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-primary text-primary font-bold text-2xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="bg-white/5 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Don't Just Take Our Word For It</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-transparent border-secondary/20">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <blockquote className="italic text-lg mb-4">"The professionalism and quality are unmatched. My car looks better than when I bought it. The online system was so easy to use."</blockquote>
                  <p className="font-semibold">- Sarah J.</p>
                </CardContent>
              </Card>
              <Card className="bg-transparent border-secondary/20">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <blockquote className="italic text-lg mb-4">"I was skeptical about the online assessment, but it was incredibly accurate and convenient. Highly recommend Detailing Co.!"</blockquote>
                  <p className="font-semibold">- Mike R.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-secondary/20 mt-24">
          <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-bold text-lg mb-2">Detailing Co.</h3>
              <p className="text-sm text-muted-foreground">The Modern Standard in Automotive Care.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Navigate</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Home</Link></li>
                <li><Link href="#services" className="text-muted-foreground hover:text-primary">Services</Link></li>
                <li><Link href={`/${organizationId}/dashboard`} className="text-muted-foreground hover:text-primary">My Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">Ready for a transformation?</p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <Link href="/assessment/new">Request an Assessment</Link>
              </Button>
            </div>
          </div>
          <div className="container mx-auto px-6 py-4 text-center text-xs text-muted-foreground border-t border-secondary/20">
            <p>&copy; {new Date().getFullYear()} Detailing Co. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}