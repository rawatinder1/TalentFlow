"use client";
//@ts-ignore
import { Users, Briefcase, FileText, Search, Clock, Target, TrendingUp, Award, Brain, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

  const redirectTomain=()=>{
        router.push("/dashboard"); // Navigate to /dashboard

  }
  const goToDemo = () => {
    // Replace with your actual demo link
    window.location.href = "https://www.loom.com/share/0bf20eff27f2444ab84e37696ae205f6?sid=26a16864-07dd-4c2e-95b4-6c6e3b7b6d23";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800/30 bg-black/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl ">
              <img
                src="/logo.svg"
                alt="TalentFlow Logo"
                className="h-9 w-9 "
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">TalentFlow</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Benefits</a>
           
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300 mb-8 border border-blue-700/30 shadow-lg backdrop-blur-sm">
            HR Platform
          </span>
          
          <div className="relative mb-12">
            <h1 className="text-1xl lg:text-7xl font-bold mb-8 text-white relative z-20 leading-tight">
              Streamline Your Hiring with{" "}
              <div className="relative flex flex-col items-center">
                <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-green-400 relative z-20">
                  TalentFlow
                </span>

                {/* Torch lines directly under text */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-64 h-8 z-20">
                  <div className="absolute inset-x-8 top-6 bg-gradient-to-r from-transparent via-blue-400 to-transparent h-[2px] w-3/4 blur-sm" />
                  <div className="absolute inset-x-8 top-5 bg-gradient-to-r from-transparent via-blue-400 to-transparent h-px w-3/4" />
                  <div className="absolute inset-x-16 top-6 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[3px] w-1/2 blur-sm" />
                  <div className="absolute inset-x-16 top-5 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px w-1/2" />
                  <div className="absolute inset-x-20 top-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent h-[2px] w-1/3 blur-sm" />
                </div>

                {/* Sparkles — pushed further down */}
                <div
                  className="absolute top-8 mt-8 left-1/2 transform -translate-x-1/2 w-80 h-10 z-5"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 0, 97% 24%, 85% 44%, 77% 55%, 53% 63%, 27% 55%, 8% 32%, 0 4%, 0 0)", // keeps trapezoid funnel
                  }}
                >
                 
                </div>
              </div>
            </h1>
          </div>
          
          <div className="px-8 py-15"/>
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto relative z-20 leading-relaxed">
            Complete HR management platform that transforms how you hire. 
            <br className="hidden lg:block" />
            Manage jobs, track candidates, and conduct assessments all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
            <button onClick={redirectTomain}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105">
              Get Started Free
            </button>
            <button
              onClick={goToDemo}
              className="px-8 py-4 border border-gray-600/50 text-gray-300 hover:bg-white/5 hover:border-gray-500 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm"
            >
              View Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* AI Power Section */}
      <section id="ai-power" className="container mx-auto px-6 py-24">
        <div className="relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100/10 text-gray-300 mb-6 border border-gray-600/20 backdrop-blur-sm">
              <Brain className="w-4 h-4 mr-2" />
              Powered by AI
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Meet Kiko AI: Your Assessment Architect</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform how you create evaluations with conversational AI that understands your hiring needs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gray-900/40 rounded-2xl border border-gray-700/30 p-8 backdrop-blur-sm">
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-12 h-12 bg-gray-100/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-600/20">
                <Brain className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-6">How Kiko AI Works</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-gray-100/10 rounded-lg flex items-center justify-center text-gray-300 font-medium text-sm flex-shrink-0 border border-gray-600/20">1</div>
                    <p className="text-gray-300 leading-relaxed pt-1"><span className="text-white font-medium">Describe Your Needs:</span> "I need a technical assessment for senior React developers"</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-gray-100/10 rounded-lg flex items-center justify-center text-gray-300 font-medium text-sm flex-shrink-0 border border-gray-600/20">2</div>
                    <p className="text-gray-300 leading-relaxed pt-1"><span className="text-white font-medium">AI Generates:</span> Comprehensive questions covering hooks, performance, testing, and architecture</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-gray-100/10 rounded-lg flex items-center justify-center text-gray-300 font-medium text-sm flex-shrink-0 border border-gray-600/20">3</div>
                    <p className="text-gray-300 leading-relaxed pt-1"><span className="text-white font-medium">Review & Deploy:</span> Fine-tune and launch your assessment in minutes, not hours</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-6 h-6 bg-gray-100/10 rounded-lg flex items-center justify-center border border-gray-600/20">
                  <Sparkles className="w-4 h-4 text-gray-300" />
                </div>
                <span className="text-gray-200 font-medium">AI in Action</span>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                "Kiko, create an assessment for a marketing manager role focusing on campaign strategy and analytics"
              </p>
              <div className="p-4 bg-gray-100/5 rounded-lg border border-gray-600/10">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Generated 15 targeted questions covering campaign planning, ROI analysis, A/B testing, and team leadership in under 30 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Everything You Need for Hiring</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools to manage your entire hiring process from job posting to candidate onboarding.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-blue-500/20 p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 backdrop-blur-sm hover:border-blue-400/30">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">Job Management</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Create and manage job postings that attract the right candidates with intelligent templates and automation.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Smart filtering and advanced search capabilities</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Quick job creation with customizable templates</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span>Archive and organize completed positions</span>
              </li>
            </ul>
          </div>

          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-green-500/20 p-8 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 backdrop-blur-sm hover:border-green-400/30">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/30">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-300 transition-colors">Candidate Pipeline</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Track every candidate through your hiring process with intuitive visual management and team collaboration.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <span>Visual pipeline with drag-and-drop stages</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <span>Instant candidate search with powerful filters</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <span>Team notes and real-time collaboration</span>
              </li>
            </ul>
          </div>

          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-purple-500/20 p-8 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 backdrop-blur-sm hover:border-purple-400/30">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">Smart Assessments</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Evaluate candidates with custom assessments tailored to your needs and industry requirements.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Multiple question types for comprehensive testing</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Live preview and real-time validation</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span>Kiko AI bot that auto generates assessments as you describe it to him</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative py-24 border-y border-gray-800/30">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-900/40 to-gray-950/80"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Why Teams Choose TalentFlow</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform your hiring process with tools designed for modern HR teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/60 rounded-2xl p-8 border border-gray-700/30 hover:border-blue-500/40 transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all">
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Save Time</h3>
                <p className="text-gray-400 leading-relaxed">
                  Reduce hiring time by 50% with streamlined workflows and intelligent automation
                </p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/60 rounded-2xl p-8 border border-gray-700/30 hover:border-green-500/40 transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-to-br group-hover:from-green-500/30 group-hover:to-emerald-600/30 transition-all">
                  <Target className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Better Hires</h3>
                <p className="text-gray-400 leading-relaxed">
                  Make data-driven decisions with comprehensive candidate tracking and analytics
                </p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/60 rounded-2xl p-8 border border-gray-700/30 hover:border-purple-500/40 transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-to-br group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Scale Easily</h3>
                <p className="text-gray-400 leading-relaxed">
                  Handle hundreds of candidates without losing track or compromising quality
                </p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/60 rounded-2xl p-8 border border-gray-700/30 hover:border-orange-500/40 transition-all duration-500 backdrop-blur-sm hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gradient-to-br group-hover:from-orange-500/30 group-hover:to-orange-600/30 transition-all">
                  <Award className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">Stay Organized</h3>
                <p className="text-gray-400 leading-relaxed">
                  Never lose important information with centralized candidate data management
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Hiring?</h2>
          <p className="text-xl lg:text-2xl text-gray-400 mb-12 leading-relaxed">
            Join companies that are already hiring faster and smarter with TalentFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button onClick={redirectTomain}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105">
              Dive in  
            </button>
            <button
              onClick={goToDemo}
              className="px-10 py-5 border border-gray-600/50 text-gray-300 hover:bg-white/5 hover:border-gray-500 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-sm"
            >
              See It In Action
            </button>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-8 text-gray-500">
            <span className="text-sm">No credit card required</span>
           
            <span className="text-sm">Setup in minutes</span>
          </div>
        </div>
      </section>
    </main>
  );
}