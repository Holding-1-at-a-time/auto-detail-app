// app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Car, ShieldCheck, Sparkles, Wand2, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <div className="bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="container px-4 py-24 md:py-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                            Pristine Perfection, Effortlessly Quoted.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                            Experience the pinnacle of auto detailing. Our modern assessment process provides a transparent, no-hassle quote for your vehicle in minutes.
                        </p>
                        <Button size="lg" className="animate-glow rounded-full text-lg px-8 py-6" asChild>
                            <Link href="/assessment/new">Reveal Your Car&apos;s Potential</Link>
                        </Button>
                    </motion.div>
                </div>
                {/* Subtle background grid */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
                {/* Radial gradient glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 h-3/4 w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.3),rgba(255,255,255,0))]"></div>
            </section>

            {/* Services Section */}
            <section className="py-24">
                <div className="container px-4">
                    <h2 className="text-3xl font-bold text-center mb-4">Our Signature Services</h2>
                    <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
                        We use industry-leading products and techniques to deliver unparalleled results.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Sparkles, title: "Interior Rejuvenation", desc: "Vacuuming, steam cleaning, and conditioning to restore a factory-fresh feel." },
                            { icon: Car, title: "Flawless Exterior Wash", desc: "Gentle hand wash, decontamination, and sealant for a durable, glossy finish." },
                            { icon: Wand2, title: "Gloss Paint Correction", desc: "Multi-stage polishing to eliminate swirls and scratches, revealing true paint depth." },
                            { icon: ShieldCheck, title: "Graphene Ceramic Coating", desc: "The ultimate in long-term protection, providing unmatched gloss and hydrophobicity." },
                        ].map((service, i) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative"
                            >
                                <Card className="h-full bg-background/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary">
                                    <CardHeader className="items-center text-center">
                                        <div className="p-4 rounded-full bg-primary/10 mb-4 border border-primary/20">
                                            <service.icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <CardTitle>{service.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center text-sm text-muted-foreground">
                                        {service.desc}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white/5">
                <div className="container px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Your Frictionless Journey</h2>
                    <div className="relative flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
                        {/* Connecting line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>

                        {[
                            { step: 1, title: "Submit Online", desc: "Fill our intuitive form with your vehicle's details." },
                            { step: 2, title: "Receive Quote", desc: "We review and send a detailed, transparent quote." },
                            { step: 3, title: "Schedule & Shine", desc: "Approve and book your service. We handle the rest." },
                        ].map((item) => (
                            <div key={item.step} className="relative z-10 flex flex-col items-center text-center p-4 w-full md:w-1/3">
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
            <section className="py-24">
                <div className="container px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Trusted by Car Enthusiasts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card className="bg-background/50 border-border/50">
                            <CardContent className="pt-6">
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="text-primary fill-primary" />)}
                                </div>
                                <p className="italic mb-4">&quot;The attention to detail was insane. My car looks better than the day I bought it. The online quote process was so easy.&quot;</p>
                                <p className="font-bold">- Alex R. <span className="text-muted-foreground font-normal">/ Tesla Model 3</span></p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background/50 border-border/50">
                            <CardContent className="pt-6">
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="text-primary fill-primary" />)}
                                </div>
                                <p className="italic mb-4">&quot;Finally, a detailing service that respects my time. The quote was fair, the work was flawless. Highly recommend the ceramic coating.&quot;</p>
                                <p className="font-bold">- Sarah J. <span className="text-muted-foreground font-normal">/ Porsche 911</span></p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24">
                <div className="container px-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How long does a typical service take?</AccordionTrigger>
                            <AccordionContent>A standard interior/exterior detail can take 4-6 hours. Paint correction and ceramic coatings are more intensive and may require 1-3 days.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Do I need to bring my car to you?</AccordionTrigger>
                            <AccordionContent>Yes, all services are performed at our secure, fully-equipped facility to ensure the highest quality results in a controlled environment.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What&apos;s the benefit of a ceramic coating?</AccordionTrigger>
                            <AccordionContent>Ceramic coatings provide a hard, sacrificial layer of protection against minor scratches, UV rays, and chemical contaminants. It also offers incredible gloss and makes cleaning your vehicle significantly easier.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How is my quote determined?</AccordionTrigger>
                            <AccordionContent>Our quotes are based on your vehicle&apos;s size, its current condition, and the specific services you select. Our online assessment helps us provide a fair and accurate estimate upfront.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10">
                <div className="container px-4 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Detailing Co. All Rights Reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}