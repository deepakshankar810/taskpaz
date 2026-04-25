'use client';

import { Github, Linkedin, Globe, Mail, Sparkles, Zap, Shield, Heart, Code2, Microscope, LineChart, CheckSquare, Focus, Wallet, BookOpen, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white px-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative text-center space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic">Taskpaz.</h1>
          <p className="text-xl md:text-2xl text-blue-100 font-medium">Elevating productivity through intuition and design.</p>
          <div className="flex justify-center gap-2 pt-4">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">v1.2.0 Premium</span>
            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs font-semibold backdrop-blur-md border border-green-500/20">System Live</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10 space-y-12">
        {/* Core Mission Card */}
        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Our Mission</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Our mission is to empower everyone with a beautifully intuitive workspace that harmonizes task management, financial tracking, and distraction-free focus—all within a single, high-performance interface.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <h4 className="font-bold">Aesthetics</h4>
                <p className="text-xs text-slate-500">Premium design for a premium mind.</p>
              </div>
              <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 space-y-3">
                <Zap className="h-8 w-8 text-purple-600" />
                <h4 className="font-bold">Performance</h4>
                <p className="text-xs text-slate-500">Fast, fluid, and real-time sync.</p>
              </div>
              <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 space-y-3">
                <Shield className="h-8 w-8 text-orange-600" />
                <h4 className="font-bold">Privacy</h4>
                <p className="text-xs text-slate-500">Your data, your rules. Fully secured.</p>
              </div>
              <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 space-y-3">
                <Heart className="h-8 w-8 text-green-600" />
                <h4 className="font-bold">Flow</h4>
                <p className="text-xs text-slate-500">Built-in radio & Pomodoro timer.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Functions and Uses Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Powerful Functions. Simple Utility.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to manage your day, your money, and your mind in one place.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Intelligent Task Management</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Organize your life with our dynamic Kanban boards. Set priorities, track due dates, and watch your productivity soar as you move cards from 'To Do' to 'Done'.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Focus className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">The Focus Sanctuary</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter your flow state with an integrated Pomodoro timer and a persistent YouTube Radio. Switch between Lofi, Jazz, or search your own tracks without interruption.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Financial Intelligence</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Take control of your economy. Track every expense, manage recurring subscriptions, and set savings goals with real-time progress visualizations.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Digital Mindfulness</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Clear your mind with our minimal Journaling module. Record your daily thoughts, reflections, and ideas in a secure, private digital diary.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Advanced Analytics</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gain insights into your habits. View detailed charts of your task completion rates and spending patterns to make better decisions for your future.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Real-time Cloud Sync</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Built on top of industry-standard security, your data is synced instantly across all devices. Work on your desktop and check progress on your phone effortlessly.
              </p>
            </div>
          </div>
        </section>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight px-2">The Creator</h2>
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="flex-1 p-8 md:p-10 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">Deepak S P</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Associate STEM Content Analyst & Biotechnologist</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Microscope className="h-5 w-5 text-indigo-500 mt-1" />
                      <div>
                        <p className="text-sm font-bold">Scientific Background</p>
                        <p className="text-xs text-slate-500">M.Sc in Biotechnology from Sri Ramachandra Institute of Higher Education and Research.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Code2 className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm font-bold">Technical Contributions</p>
                        <p className="text-xs text-slate-500">Proficient in Julia, AI assisted coding, and Data Science. Co-creator of juProt, published in Springer Nature.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <LineChart className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-bold">Professional Role</p>
                        <p className="text-xs text-slate-500">Currently at Clarivate, focusing on biological sequence indexing and STEM content analysis.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href="https://www.linkedin.com/in/deepak-s-p-rs7176005/" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href="https://github.com/deepakshankar810" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" /> GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <a href="https://deepakshankar810.github.io/portfolio/" target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" /> Portfolio
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 pt-12 lg:pt-20">
            <h3 className="font-bold text-lg px-2">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Next.js 15', 'Tailwind v4', 'Supabase', 'TypeScript', 'Lucide Icons', 'Vercel'].map(tech => (
                <div key={tech} className="p-3 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold shadow-sm">
                  {tech}
                </div>
              ))}
            </div>
            
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white overflow-hidden relative">
              <CardContent className="p-6 space-y-4">
                <Sparkles className="absolute -top-4 -right-4 h-24 w-24 opacity-10" />
                <h4 className="font-bold text-lg">Contact Deepak</h4>
                <p className="text-xs text-blue-100">Interested in collaborating on Biotechnology or AI projects?</p>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold" asChild>
                  <a href="mailto:deepakshankar810@gmail.com">
                    <Mail className="h-4 w-4 mr-2" /> Send an Email
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Closing Footer */}
        <footer className="text-center py-10 space-y-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 text-sm">© 2026 Taskpaz. Built with ❤️ by Deepak S P.</p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
