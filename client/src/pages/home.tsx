import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, PlayCircle, X, CheckCircle2, Mail, MapPin, Phone,
  Bot, TrendingUp, BarChart3, MessageCircle,
  Target, Crosshair, CalendarDays, Receipt, Heart, Scale, Clock, BookOpen,
  Settings, FileText, ClipboardList, Shield, Users, Brain,
  Sparkles, Globe, Lock, Zap
} from "lucide-react";
import heroBg from "@assets/generated_images/abstract_tech_network_visualization.png";
import demoVideo from "@/assets/videos/ahc-explainer.mp4";

const platformModules = [
  {
    category: "INTELLIGENCE",
    color: "from-blue-500 to-cyan-500",
    items: [
      { icon: Bot, name: "HRM-GPT", description: "AI-powered workforce intelligence. Ask questions about your people data in natural language.", color: "text-blue-500" },
      { icon: TrendingUp, name: "Executive Dashboard", description: "Real-time metrics, KPI tracking, and visual analytics for leadership decision-making.", color: "text-cyan-500" },
      { icon: BarChart3, name: "AI Reports", description: "AI-generated recommendations and predictive analytics across all HR functions.", color: "text-indigo-500" },
      { icon: MessageCircle, name: "WhatsApp Monitor", description: "Employee communication tracking and sentiment analysis via WhatsApp integration.", color: "text-green-500" },
    ]
  },
  {
    category: "HR MANAGEMENT",
    color: "from-purple-500 to-pink-500",
    items: [
      { icon: Target, name: "KPI Management", description: "Templates, review cycles, assignments, self-assessment and 360-degree feedback workflows.", color: "text-blue-600" },
      { icon: Crosshair, name: "OKR Tracking", description: "Objectives & Key Results with weekly monitoring, project linking, and progress tracking.", color: "text-purple-500" },
      { icon: CalendarDays, name: "Leave Management", description: "Applications, approvals, and payroll sync for 8 leave types per BCEA requirements.", color: "text-teal-500" },
      { icon: Receipt, name: "Claims Management", description: "Expense submissions with receipt uploads, approval workflows, and payroll integration.", color: "text-orange-500" },
      { icon: Heart, name: "Pulse Survey", description: "eNPS scoring, well-being checks, relationship assessments, and AI-powered recommendations.", color: "text-pink-500" },
      { icon: Scale, name: "Compliance", description: "SA labour legislation (BCEA, LRA, EEA, OHSA), POPIA consent management, and RAG Q&A.", color: "text-indigo-500" },
      { icon: Clock, name: "Time & Attendance", description: "Clock in/out, timesheets, attendance tracking, overtime monitoring, and shift scheduling.", color: "text-cyan-500" },
      { icon: BookOpen, name: "LMS", description: "Learning management with courses, assessments, certificates, and gamification.", color: "text-amber-500" },
    ]
  },
];

const keyCapabilities = [
  { icon: Brain, title: "AI-Powered Analytics", description: "Groq-powered AI delivers instant workforce insights, sentiment analysis, and predictive recommendations across every module." },
  { icon: Shield, title: "SA Labour Compliance", description: "Built for South African law - BCEA, LRA, EEA, OHSA compliance with automated Government Gazette monitoring." },
  { icon: Users, title: "Multi-Tenant Architecture", description: "Securely serve multiple organizations with complete data isolation, custom branding, and per-tenant configuration." },
  { icon: Lock, title: "POPIA Ready", description: "Full consent management for data processing, storage, and destruction with audit trails and status tracking." },
  { icon: Globe, title: "WhatsApp Integration", description: "Notify employees of reviews, approvals, and surveys via WhatsApp for higher engagement rates." },
  { icon: Zap, title: "Payroll Sync", description: "Approved leave, claims, timesheets, and overtime automatically sync with payroll for accurate salary calculations." },
];

const stats = [
  { value: "65+", label: "Database Tables" },
  { value: "8", label: "HR Modules" },
  { value: "4", label: "AI Intelligence Tools" },
  { value: "100%", label: "SA Compliant" },
];

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main>
        {/* ====== HERO ====== */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
          <div className="absolute inset-0 z-0">
            <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)]" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
                <img src="/logos/main-logo.png" alt="AHC" className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto object-contain mb-8" />
                <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide mb-6">
                  AI-POWERED HR MANAGEMENT PLATFORM
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-foreground">
                The Complete HR Platform <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-700">Built for South Africa</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Manage KPIs, OKRs, leave, claims, compliance, time tracking, and employee wellness - all powered by AI intelligence and built for SA labour law.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border hover:bg-accent" onClick={() => setShowDemo(true)}>
                  <PlayCircle className="mr-2 w-4 h-4" /> Watch Demo
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <Dialog open={showDemo} onOpenChange={setShowDemo}>
            <DialogContent className="max-w-4xl p-0 bg-black border-0 overflow-hidden">
              <DialogTitle className="sr-only">AHC Platform Demo Video</DialogTitle>
              <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <video src={demoVideo} controls autoPlay className="w-full h-auto max-h-[80vh]">
                Your browser does not support the video tag.
              </video>
            </DialogContent>
          </Dialog>
        </section>

        {/* ====== STATS BAR ====== */}
        <section className="py-8 bg-muted/50 dark:bg-zinc-900/50 border-y border-border">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== PLATFORM MODULES ====== */}
        {platformModules.map((section, sIdx) => (
          <section key={section.category} className={`py-24 ${sIdx % 2 === 0 ? 'bg-background' : 'bg-muted/50 dark:bg-zinc-900/50'} relative`}>
            <div className="container mx-auto px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{section.category}</Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                  {section.category === "INTELLIGENCE" ? (
                    <>AI-Powered <span className={`text-transparent bg-clip-text bg-gradient-to-r ${section.color}`}>Workforce Intelligence</span></>
                  ) : (
                    <>Complete <span className={`text-transparent bg-clip-text bg-gradient-to-r ${section.color}`}>HR Management Suite</span></>
                  )}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {section.category === "INTELLIGENCE"
                    ? "Leverage AI to gain deep insights into your workforce, predict trends, and make data-driven decisions."
                    : "Every HR function your organization needs - from performance management to compliance - in one integrated platform."
                  }
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {section.items.map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                    <Card className="h-full bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-border">
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ====== KEY CAPABILITIES ====== */}
        <section className="py-24 bg-gray-100 dark:bg-zinc-900 border-y border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.05)_0%,rgba(0,0,0,0)_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_60%)]" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-700">AHC Platform</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Purpose-built for South African businesses with AI at its core and compliance in its DNA.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyCapabilities.map((cap, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full bg-card border-border hover:border-primary/30 transition-all hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                        <cap.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{cap.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{cap.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== PLATFORM MENU PREVIEW ====== */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-foreground">
                    Everything You Need <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-700">In One Platform</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    From KPI templates and review cycles to POPIA consent management and automated timesheets - every HR workflow is covered with full audit trails and payroll integration.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Performance Management with KPIs & OKRs",
                      "Leave, Claims & Time Tracking with Payroll Sync",
                      "Pulse Surveys with AI-Powered Sentiment Analysis",
                      "SA Labour Law Compliance & POPIA Consent Management",
                      "Wellness Partner Integrations & Document Automation",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <div className="lg:w-1/2">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                  className="rounded-2xl overflow-hidden border border-border shadow-2xl bg-card p-6"
                >
                  {/* Mini sidebar mockup */}
                  <div className="space-y-6">
                    {[
                      { title: "INTELLIGENCE", items: [
                        { icon: Bot, name: "HRM-GPT" },
                        { icon: TrendingUp, name: "Executive Dashboard" },
                        { icon: BarChart3, name: "Reports" },
                        { icon: MessageCircle, name: "WhatsApp Monitor" },
                      ]},
                      { title: "HR MANAGEMENT", items: [
                        { icon: Target, name: "KPI's" },
                        { icon: Crosshair, name: "OKR's" },
                        { icon: CalendarDays, name: "Leave" },
                        { icon: Receipt, name: "Claims" },
                        { icon: Heart, name: "Pulse Survey" },
                        { icon: Scale, name: "Compliance" },
                        { icon: Clock, name: "Time & Attendance" },
                        { icon: BookOpen, name: "LMS" },
                      ]},
                      { title: "SETUP", items: [
                        { icon: Settings, name: "KPI Setup" },
                        { icon: ClipboardList, name: "Leave Setup" },
                        { icon: FileText, name: "Claims Setup" },
                        { icon: Heart, name: "Wellness Setup" },
                        { icon: FileText, name: "Document Automation" },
                        { icon: ClipboardList, name: "Document Library" },
                      ]},
                    ].map((section, sIdx) => (
                      <div key={sIdx}>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2">{section.title}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {section.items.map((item, iIdx) => (
                            <motion.div
                              key={iIdx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: (sIdx * section.items.length + iIdx) * 0.03 }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-primary/10 transition-colors group cursor-default"
                            >
                              <item.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span className="text-xs text-foreground">{item.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== CTA ====== */}
        <section className="py-24 border-t border-border bg-gradient-to-b from-background to-muted/50 dark:to-zinc-900">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Transform Your HR?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
                Join South African businesses using AHC to manage their entire employee lifecycle with AI-powered intelligence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                    Start Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button size="lg" variant="outline" className="h-12 px-8 border-border hover:bg-accent">
                    Request a Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ====== FOOTER ====== */}
      <footer className="bg-gray-100 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6 py-6 px-6">
                <img src="/logos/light-logo.png" alt="AHC" className="h-16 w-auto object-contain" />
              </div>
              <p className="text-gray-400 max-w-xs">
                AHC - AI-Powered HR Management Platform.<br />
                Built for the future of HR in South Africa.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-foreground">Platform</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><span className="hover:text-primary transition-colors cursor-default">KPI & OKR Management</span></li>
                <li><span className="hover:text-primary transition-colors cursor-default">Leave & Claims</span></li>
                <li><span className="hover:text-primary transition-colors cursor-default">Pulse Survey & Wellness</span></li>
                <li><span className="hover:text-primary transition-colors cursor-default">Compliance & POPIA</span></li>
                <li><span className="hover:text-primary transition-colors cursor-default">Time & Attendance</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-foreground">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@ahc.ai</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +27 (0) 11 000 0000</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Johannesburg, South Africa</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-800 mt-12 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AHC - HR Management Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
