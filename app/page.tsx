// app/(public)/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, LayoutDashboard, Wrench, BarChart2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SaasLandingPage() {
  const primaryColorGlow = "shadow-[0_0px_30px_-5px_hsl(var(--primary)/0.3)]";

  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">
      {/* ===== Hero Section ===== */}
      <section className="relative py-28 md:py-40 text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.2),rgba(255,255,255,0))]"
        ></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6">
            The All-in-One Platform to Run Your Detailing Business
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Stop juggling spreadsheets and notebooks. Our powerful SaaS solution provides everything you need to manage clients, services, and jobs, all in one modern dashboard.
          </p>
          <Button
            size="lg"
            className={`rounded-full text-lg px-8 py-6 transition-all duration-300 ${primaryColorGlow} hover:shadow-[0_0px_40px_-5px_hsl(var(--primary)/0.5)]`}
            asChild
          >
            <Link href="/sign-up">Start Your 14-Day Free Trial</Link>
          </Button>
        </motion.div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">A Better Way to Manage Your Detailing Business</h2>
            <p className="mt-4 text-muted-foreground">
              Our platform is built with features specifically designed to solve the biggest headaches for startup and growing auto detailers.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Client Management (CRM)", desc: "Keep a complete history of every client, their vehicles, and past jobs." },
              { icon: Wrench, title: "Custom Service & Pricing", desc: "Define your unique services and pricing structures with our flexible engine." },
              { icon: LayoutDashboard, title: "Job Assessment Workflow", desc: "Streamline your process from initial inquiry to final vehicle handover." },
              { icon: BarChart2, title: "Business Analytics", desc: "Gain insights into your revenue, most popular services, and client growth." },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-gray-900/50 border-gray-800 backdrop-blur-sm transition-all duration-300 hover:border-primary hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-4 w-fit p-3 rounded-lg bg-primary/10 border border-primary/20 ${primaryColorGlow}`}>
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    {feature.desc}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing Section ===== */}
      <section className="py-20 md:py-28 bg-gray-950/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Simple Pricing for Every Stage</h2>
            <p className="mt-4 text-muted-foreground">
              Choose a plan that scales with your detailing business. No hidden fees.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { plan: "Starter", price: "49", features: ["1 User", "Client Management", "Service Management", "50 Assessments/mo"] },
              { plan: "Growth", price: "99", features: ["5 Users", "Everything in Starter", "Team Roles & Permissions", "Unlimited Assessments"], popular: true },
              { plan: "Pro", price: "199", features: ["Unlimited Users", "Everything in Growth", "API Access", "Priority Support"] },
            ].map((tier) => (
              <Card
                key={tier.plan}
                className={`flex flex-col bg-gray-900/50 border-gray-800 transition-all duration-300 ${
                  tier.popular ? `border-2 border-primary ${primaryColorGlow}` : ""
                }`}
              >
                <CardHeader className="text-center">
                  {tier.popular && <div className="text-sm font-bold text-primary mb-2">MOST POPULAR</div>}
                  <CardTitle className="text-2xl">{tier.plan}</CardTitle>
                  <p className="text-4xl font-bold">${tier.price}<span className="text-lg font-medium text-muted-foreground">/mo</span></p>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <ul className="space-y-4 text-muted-foreground flex-grow">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-8 ${tier.popular ? '' : 'bg-gray-700 hover:bg-gray-600'}`}>Choose Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA Section ===== */}
      <section className="text-center py-20 md:py-32">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Elevate Your Detailing Business?</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto mb-10">
            Join the next generation of detailers running their business on a modern, powerful platform.
          </p>
          <Button
            size="lg"
            className={`rounded-full text-lg px-8 py-6 transition-all duration-300 ${primaryColorGlow} hover:shadow-[0_0px_40px_-5px_hsl(var(--primary)/0.5)]`}
            asChild
          >
            <Link href="/sign-up">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-gray-800 py-6">
        <div className="container text-center text-muted-foreground">
          <p>Detailing Co. SaaS Platform</p>
          <p>© {new Date().getFullYear()} All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}