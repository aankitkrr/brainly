import React, { useState, useEffect, useRef } from 'react';
import { Brain, Search, Share, Youtube, MessageCircle, FileText, ArrowRight, CheckCircle, Star, Sparkles, ChevronDown, Menu, X} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Mouse tracking for cursor effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Youtube,
      title: "YouTube Videos",
      description: "Extract and organize insights from educational videos automatically",
      color: "text-red-500"
    },
    {
      icon: MessageCircle,
      title: "Twitter Threads", 
      description: "Save and categorize valuable Twitter threads and insights",
      color: "text-blue-500"
    },
    {
      icon: FileText,
      title: "Personal Notes",
      description: "Create and manage your own knowledge with rich text notes",
      color: "text-green-500"
    },
    {
      icon: Search,
      title: "AI-Powered Search",
      description: "Find information using semantic search across all your content",
      color: "text-purple-500"
    },
    {
      icon: Share,
      title: "Easy Sharing",
      description: "Share your knowledge base publicly with custom URLs",
      color: "text-orange-500"
    },
    {
      icon: Brain,
      title: "Smart Organization",
      description: "Automatic tagging and categorization of all your content",
      color: "text-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content: "This app revolutionized how I organize my learning resources. The AI search is incredibly accurate!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez", 
      role: "Product Manager",
      content: "Finally, a tool that understands context. I can find that specific video I watched months ago instantly.",
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Designer",
      content: "The sharing feature is perfect for team knowledge bases. Clean, fast, and intuitive interface.",
      avatar: "EW"
    }
  ];

  const stats = [
    { number: "50K+", label: "Content Items Processed" },
    { number: "99.9%", label: "Search Accuracy" },
    { number: "10K+", label: "Active Users" },
    { number: "4.9/5", label: "User Rating" }
  ];

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleAuth = (type: 'login' | 'signup') => {
    // Navigate to auth page
    window.location.href = `/${type}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Custom Cursor Effect */}
      <div 
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="w-full h-full bg-white rounded-full opacity-80 animate-pulse"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => scrollToSection('hero')}>
              <div className="relative">
                <Brain className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
                SHAREPORT
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className=" hover:cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className=" hover:cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200">
                How it Works
              </button>
              <button onClick={() => scrollToSection('testimonials')} className=" hover:cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200">
                Reviews
              </button>
              <Button onClick={() => handleAuth('signup')} className=" hover:cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border">
              <div className="flex flex-col space-y-4 pt-4">
                <button onClick={() => scrollToSection('features')} className="text-left text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-left text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="text-left text-muted-foreground hover:text-foreground transition-colors">
                  Reviews
                </button>
                <Button variant="ghost" onClick={() => handleAuth('login')} className="justify-start">
                  Login
                </Button>
                <Button onClick={() => handleAuth('signup')} className="justify-start bg-gradient-to-r from-primary to-purple-600">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Knowledge Management
            </Badge>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-red-400 to-purple-600 bg-clip-text text-transparent animate-pulse">
                Your Second Brain
              </span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                for Everything You Learn
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Capture, organize, and discover insights from YouTube videos, Twitter threads, and personal notes with AI-powered search.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={() => handleAuth('signup')}
                className="bg-gradient-to-r from-purple-400 to-purple-700 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg font-semibold group transform hover:scale-105 transition-all duration-300 hover:cursor-pointer "
              >
                Start Building Your Brain
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-default">
                  <div className="text-2xl md:text-3xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent"> Organize Knowledge</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make knowledge management effortless and intelligent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-full bg-muted/50 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple Yet
              <span className="bg-gradient-to-r from-purple-900 to-purple-500 bg-clip-text text-transparent"> Powerful</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and watch your knowledge base grow automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Add Content",
                description: "Simply paste YouTube URLs, Twitter links, or create notes directly in the app.",
                icon: FileText
              },
              {
                step: "02", 
                title: "AI Processing",
                description: "Our AI automatically extracts, categorizes, and tags your content for easy discovery.",
                icon: Brain
              },
              {
                step: "03",
                title: "Search & Share",
                description: "Find anything instantly with semantic search and share your knowledge with others.",
                icon: Search
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <step.icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by
              <span className="bg-gradient-to-r from-purple-900 to-purple-500 bg-clip-text text-transparent"> Knowledge Workers</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users are saying about BrainSpace.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 bg-background/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-foreground mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
                
                {/* Testimonial Indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === currentTestimonial ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Build Your
              <span className="bg-gradient-to-r from-purple-900 to-purple-500 bg-clip-text text-transparent"> Second Brain?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of learners who have transformed how they organize and discover knowledge.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => handleAuth('signup')}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg font-semibold group transform hover:scale-105 transition-all duration-300 hover:cursor-pointer "
              >
                Get Started
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
              </Button>
            </div>

            <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Easy to Understand</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold hover:cursor-pointer text-2xl " onClick={() => {scrollToSection('hero')}}>SHAREPORT</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2025 SharePort. All rights reserved.</span>
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;