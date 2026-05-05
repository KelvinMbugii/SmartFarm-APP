import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tractor, 
  ShieldCheck, 
  BarChart3, 
  Leaf, 
  Bot, 
  Users,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  ChevronRight,
  Star,
  Sprout,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Sprout as PlantIcon,
  Wheat,
  CloudSun,
  TrendingUp as MarketIcon,
  MessageSquare,
  Calendar,
  BookOpen,
} from "lucide-react";

const heroImage = "/images/hero landing page.png";
const monitorFieldsImg = "/images/Farmers image.png";
const expertGuidanceImg = "/images/Specialist assisting farmer.png";
const aiDiseaseImg = "/images/Ai assisted farming.png";
const marketplaceImg = "/images/Buyer agriprenuer.png";
const smartToolsImg = "/images/Farmer connnecting 2.jpeg";
const communityImg = "/images/farmers collaborating.jpeg";

const stats = [
  { value: "10K+", label: "Active Farmers" },
  { value: "50+", label: "Expert Officers" },
  { value: "100K+", label: "Products Sold" },
  { value: "98%", label: "Satisfaction" },
];

const features = [
  {
    title: "Field Monitoring",
    description: "Real-time insights and crop monitoring with AI-powered analytics for better yields.",
    image: monitorFieldsImg,
    icon: BarChart3,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Expert Advisory",
    description: "Connect with certified agricultural officers for personalized guidance.",
    image: expertGuidanceImg,
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "AI Disease Detection",
    description: "Instant crop disease identification using advanced machine learning.",
    image: aiDiseaseImg,
    icon: Bot,
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "Smart Marketplace",
    description: "Direct connections between farmers and buyers with secure payments.",
    image: marketplaceImg,
    icon: ShoppingCart,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Farming Tools",
    description: "Planning and monitoring tools for irrigation and smart systems.",
    image: smartToolsImg,
    icon: Leaf,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Community Network",
    description: "Connect with fellow farmers for peer learning and support.",
    image: communityImg,
    icon: Users,
    color: "from-cyan-500 to-blue-600",
  },
];

const testimonials = [
  {
    name: "Wanjiru Kamau",
    role: "Smallholder Farmer, Nakuru",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop",
    text: "SmartFarm transformed how I manage my tomato farm. The AI disease detection saved my entire crop last season!",
    rating: 5,
  },
  {
    name: "John Ochieng",
    role: "Agripreneur, Kisumu",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    text: "The marketplace feature helped me reach customers I never knew existed. My sales increased by 300% in just 6 months.",
    rating: 5,
  },
  {
    name: "Grace Muthoni",
    role: "Agricultural Officer, Kiambu",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    text: "Managing farmer consultations has never been easier. The platform streamlines everything from booking to follow-ups.",
    rating: 5,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Create Account",
    description: "Sign up in seconds and choose your profile - farmer, buyer, or agricultural officer.",
  },
  {
    step: "02",
    title: "Connect & Learn",
    description: "Access expert knowledge, marketplace insights, and AI-powered tools tailored to your needs.",
  },
  {
    step: "03",
    title: "Grow & Succeed",
    description: "Monitor your farm, sell produce, consult experts, and watch your agribusiness thrive.",
  },
];

const aiCapabilities = {
  farmer: {
    title: "For Farmers",
    description: "Your AI-powered farming assistant",
    features: [
      { icon: PlantIcon, text: "Crop disease detection from photos" },
      { icon: CloudSun, text: "Weather-based planting recommendations" },
      { icon: TrendingUp, text: "Market price predictions" },
      { icon: Sprout, text: "Soil health analysis" },
      { icon: BookOpen, text: "Pest control guidance" },
    ],
  },
  officer: {
    title: "For Agricultural Officers",
    description: "Streamline your advisory work",
    features: [
      { icon: Users, text: "Farmer consultation summaries" },
      { icon: Calendar, text: "Schedule management assistance" },
      { icon: BookOpen, text: "Research-backed answers" },
      { icon: MessageSquare, text: "Draft advisory articles" },
      { icon: ShieldCheck, text: "Compliance guidance" },
    ],
  },
  agripreneur: {
    title: "For Agripreneurs",
    description: "Grow your agribusiness",
    features: [
      { icon: MarketIcon, text: "Market trend analysis" },
      { icon: TrendingUp, text: "Pricing strategy suggestions" },
      { icon: ShoppingCart, text: "Inventory management tips" },
      { icon: Users, text: "Customer behavior insights" },
      { icon: Wheat, text: "Supply chain optimization" },
    ],
  },
};

const AIChatModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("farmer");
  const [showChat, setShowChat] = useState(false);

  const chatMessages = {
    initial: {
      bot: "Hi! I'm SmartFarm AI 👋\n\nI can help you with farming advice, market prices, disease detection, and much more.\n\nTo get started, please register or log in to your account.",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/20">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/90 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-sm">SmartFarm AI</h3>
                    <p className="text-white/70 text-xs">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-64 bg-[#F8F5F2] p-4 overflow-y-auto">
                <div className="flex gap-2 mb-3">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 shadow-sm max-w-[85%]">
                    <p className="text-sm font-body text-foreground whitespace-pre-line">
                      Hi! I'm SmartFarm AI 👋
                    </p>
                    <p className="text-sm font-body text-foreground mt-2 whitespace-pre-line">
                      I can help you with farming advice, market prices, disease detection, and much more.
                    </p>
                    <p className="text-sm font-body text-foreground mt-2">
                      To get started, please{" "}
                      <Link to="/register" onClick={onClose} className="text-secondary font-semibold hover:underline">
                        register
                      </Link>{" "}
                      or{" "}
                      <Link to="/login" onClick={onClose} className="text-secondary font-semibold hover:underline">
                        log in
                      </Link>{" "}
                      to your account.
                    </p>
                  </div>
                </div>

                {/* Capabilities Preview */}
                <div className="bg-white rounded-xl px-3 py-2 shadow-sm mb-3">
                  <p className="text-xs font-heading font-semibold text-muted-foreground mb-2 uppercase">I can help with:</p>
                  
                  <div className="flex gap-1 mb-2">
                    {["farmer", "officer", "agripreneur"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`py-1 px-2 rounded-full text-xs font-heading font-semibold transition-all ${
                          activeTab === type
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {type === "farmer" && "Farmer"}
                        {type === "officer" && "Officer"}
                        {type === "agripreneur" && "Agripreneur"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    {aiCapabilities[activeTab].features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <feature.icon className="h-3 w-3 text-secondary flex-shrink-0" />
                        <span className="text-xs font-body text-foreground/80">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input & Actions */}
              <div className="p-3 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    disabled
                    className="flex-1 px-3 py-2 bg-muted rounded-full text-sm font-body text-muted-foreground cursor-not-allowed"
                  />
                  <button className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground cursor-not-allowed">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link to="/register" onClick={onClose} className="flex-1">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 font-heading text-xs">
                      Register
                    </Button>
                  </Link>
                  <Link to="/login" onClick={onClose} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full font-heading text-xs">
                      Log In
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={onClose}
                    className="text-muted-foreground hover:text-destructive font-heading text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary/98 backdrop-blur-md shadow-xl py-2" : "bg-transparent py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 group-hover:bg-white/30 transition-all duration-300">
                <Tractor className="h-8 w-8 text-secondary" />
              </div>
              <span className="text-xl font-bold font-heading text-white tracking-tight">SmartFarm</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollToSection("features")} className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection("how-it-works")} className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection("testimonials")} className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors">
                Testimonials
              </button>
              <Link to="/login" className="ml-4">
                <Button variant="ghost" className="text-white hover:bg-white/20 font-heading px-6">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-secondary hover:bg-secondary/90 text-primary font-heading shadow-lg shadow-secondary/25">
                  Get Started
                </Button>
              </Link>
            </div>

            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20 mt-2">
              <div className="flex flex-col gap-1">
                <button onClick={() => scrollToSection("features")} className="px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg text-left font-medium">
                  Features
                </button>
                <button onClick={() => scrollToSection("how-it-works")} className="px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg text-left font-medium">
                  How It Works
                </button>
                <button onClick={() => scrollToSection("testimonials")} className="px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg text-left font-medium">
                  Testimonials
                </button>
                <div className="flex gap-2 mt-2 px-4">
                  <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary font-heading">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-secondary hover:bg-secondary/90 text-primary font-heading">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Smart Farming" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/85" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sprout className="h-4 w-4 text-secondary" />
                <span className="text-white/90 text-sm font-medium">Empowering Farmers</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white leading-tight mb-6">
                The Future of 
                <span className="text-secondary"> Smart Farming</span>
                <br />Starts Here
              </h1>
              
              <p className="text-lg sm:text-xl text-white/80 font-body mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with agricultural experts, access real-time market prices, 
                get AI-powered disease detection, and transform your farming business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-primary font-heading text-lg px-8 py-6 shadow-xl shadow-secondary/30 hover:shadow-secondary/50 hover:scale-105 transition-all duration-300">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAIChat(true)}
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary font-heading text-lg px-8 py-6 transition-all duration-300"
                >
                  Talk to SmartFarm AI
                  <Bot className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold font-heading text-secondary">{stat.value}</div>
                    <div className="text-sm text-white/70 font-body">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Images - Desktop Only */}
            <div className="hidden lg:block relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -top-4 -left-4 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 z-40 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src={communityImg} alt="Farmers Collaborating" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 z-30 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <img src="/images/smartfarm logo.png" alt="SmartFarm Logo" className="w-full h-full object-contain p-4 bg-white" />
                </div>
                <div className="absolute bottom-8 -left-8 w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 z-20 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <img src={marketplaceImg} alt="Marketplace" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src={expertGuidanceImg} alt="Expert Guidance" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Hero Images - Compact */}
          <div className="lg:hidden mt-10">
            <div className="relative max-w-xs mx-auto">
              <div className="flex justify-center gap-2">
                <img src={communityImg} alt="Farmers" className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-white/30" />
                <img src="/images/smartfarm logo.png" alt="Logo" className="w-24 h-24 rounded-xl object-contain p-2 bg-white shadow-lg border-2 border-white/30" />
              </div>
              <div className="flex justify-center gap-2 mt-2 -translate-x-4">
                <img src={marketplaceImg} alt="Market" className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-white/30" />
                <img src={expertGuidanceImg} alt="Expert" className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-white/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-4">Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-6">
              Everything You Need to 
              <span className="text-primary"> Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              Powerful tools designed by agricultural experts for modern farmers and agribusiness professionals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-60`} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`bg-gradient-to-r ${feature.color} p-2 rounded-lg`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground font-body leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-4">Process</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-6">
              How It Works
            </h2>
            <p className="text-lg text-white/80 font-body">
              Get started in three simple steps and transform your farming journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {processSteps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-6xl font-bold font-heading text-secondary/30 mb-4">{step.step}</div>
                  <h3 className="text-2xl font-bold font-heading text-white mb-4">{step.title}</h3>
                  <p className="text-white/80 font-body leading-relaxed">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ChevronRight className="h-8 w-8 text-secondary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-secondary font-heading font-semibold uppercase tracking-wider text-sm mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-6">
              Trusted by 
              <span className="text-primary"> Thousands</span>
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              Hear from farmers and professionals who transformed their operations with SmartFarm.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-card rounded-3xl shadow-2xl p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <img 
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex gap-1 mb-4 justify-center lg:justify-start">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-secondary fill-secondary" />
                    ))}
                  </div>
                  <p className="text-lg lg:text-xl text-foreground font-body leading-relaxed mb-6">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div>
                    <p className="font-heading font-bold text-foreground">{testimonials[activeTestimonial].name}</p>
                    <p className="text-muted-foreground font-body text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDR2LTJoMzJ2MjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-white/90 font-body mb-10 max-w-2xl mx-auto">
            Join over 10,000 farmers and agribusiness professionals who are already growing with SmartFarm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-heading text-lg px-10 py-6 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary font-heading text-lg px-10 py-6 transition-all duration-300">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 rounded-xl p-2">
                  <Tractor className="h-8 w-8 text-primary" />
                </div>
                <span className="text-xl font-bold font-heading text-foreground">SmartFarm</span>
              </div>
              <p className="text-muted-foreground font-body mb-6 max-w-md">
                Empowering farmers with technology, expert knowledge, and market access for a sustainable agricultural future.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold text-foreground mb-4">Platform</h4>
              <ul className="space-y-3 font-body text-muted-foreground">
                <li><button onClick={() => scrollToSection("features")} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-primary transition-colors">How It Works</button></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-bold text-foreground mb-4">Support</h4>
              <ul className="space-y-3 font-body text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground font-body text-sm">
              © 2024 SmartFarm. All rights reserved.
            </p>
            <p className="text-muted-foreground font-body text-sm">
              Made with <span className="text-red-500">♥</span> for Farmers
            </p>
          </div>
        </div>
      </footer>

      <AIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>
  );
};

export default Landing;
