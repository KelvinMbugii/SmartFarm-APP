import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Tractor, 
  ShieldCheck, 
  BarChart3, 
  Leaf, 
  Bot, 
  Users,
  ShoppingCart,
  CloudSun,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Menu,
  X
} from "lucide-react";

const heroImage = "/images/hero landing page.png";
const monitorFieldsImg = "/images/Farmers image.png";
const expertGuidanceImg = "/images/Specialist assisting farmer.png";
const aiDiseaseImg = "/images/Ai assisted farming.png";
const marketplaceImg = "/images/Buyer agriprenuer.png";
const smartToolsImg = "/images/Farmer connnecting 2.jpeg";
const communityImg = "/images/farmers collaborating.jpeg";

const features = [
  {
    title: "Monitor Your Fields",
    description: "Real-time insights and crop monitoring for better yields.",
    image: monitorFieldsImg,
    icon: BarChart3,
  },
  {
    title: "Expert Guidance",
    description: "Get advisory support from agricultural officers.",
    image: expertGuidanceImg,
    icon: ShieldCheck,
  },
  {
    title: "AI Disease Detection",
    description: "Instant diagnostics for your crops using AI technology.",
    image: aiDiseaseImg,
    icon: Bot,
  },
  {
    title: "Marketplace Access",
    description: "Connect buyers and farmers seamlessly.",
    image: marketplaceImg,
    icon: ShoppingCart,
  },
  {
    title: "Smart Farming Tools",
    description: "Planning and monitoring for irrigation and tech systems.",
    image: smartToolsImg,
    icon: Leaf,
  },
  {
    title: "Community Collaboration",
    description: "Networking and peer learning with fellow farmers.",
    image: communityImg,
    icon: Users,
  },
];

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 rounded-full p-2">
                <Tractor className="h-8 w-8 text-secondary" />
              </div>
              <span className="text-xl font-bold font-heading text-white">SmartFarm</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 font-heading">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-accent hover:bg-accent-hover text-white font-heading">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20">
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10 font-heading justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full bg-accent hover:bg-accent-hover text-white font-heading justify-start">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center pt-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Smart Farming" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        
        <div className="relative z-10 max-w-container mx-auto px-3 md:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-8 items-center">
            <div className="max-w-full">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-heading text-white mb-3 md:mb-6 animate-fade-in-up">
                Smart Farming for a Better Tomorrow
              </h1>
              <p className="text-sm md:text-lg lg:text-xl text-white/90 font-body mb-4 md:mb-8 animate-fade-in-up delay-100">
                Connect with agricultural experts, access real-time market prices, 
                get AI-powered disease detection, and grow your farming business.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-4 animate-fade-in-up delay-200">
                <Link to="/register">
                  <Button className="bg-accent hover:bg-accent-hover text-white text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 font-heading shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Free Trial
                    <ArrowRight className="ml-1 md:ml-2 h-4 md:h-5 w-4 md:w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary text-sm md:text-lg px-4 md:px-8 py-3 md:py-6 font-heading">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Images Grid - Overlapping Pattern */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute top-0 left-0 w-40 h-40 rounded-xl overflow-hidden shadow-xl border-4 border-white z-30">
                  <img src={communityImg} alt="Farmers Collaborating" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-4 right-0 w-40 h-40 rounded-xl overflow-hidden shadow-xl border-4 border-white z-20 translate-x-8 bg-white">
                  <img src="/images/smartfarm logo.png" alt="SmartFarm Logo" className="w-full h-full object-contain p-2" />
                </div>
                <div className="absolute bottom-0 left-12 w-40 h-40 rounded-xl overflow-hidden shadow-xl border-4 border-white z-10 -translate-x-4">
                  <img src={marketplaceImg} alt="Buyer Agripreneur" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-4 right-8 w-40 h-40 rounded-xl overflow-hidden shadow-xl border-4 border-white z-0">
                  <img src={expertGuidanceImg} alt="Specialist Assisting Farmers" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Hero Images - Smaller overlapping */}
      <section className="lg:hidden py-3 md:py-6 px-3 md:px-4 bg-primary">
        <div className="max-w-container mx-auto">
          <div className="relative h-48 md:h-64">
            <div className="absolute top-0 left-2 md:left-4 w-20 md:w-28 h-20 md:h-28 rounded-lg overflow-hidden shadow-md border-2 border-white z-30">
              <img src={communityImg} alt="Farmers Collaborating" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1 md:top-2 right-4 md:right-8 w-20 md:w-28 h-20 md:h-28 rounded-lg overflow-hidden shadow-md border-2 border-white z-20 bg-white">
              <img src="/images/smartfarm logo.png" alt="SmartFarm Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="absolute bottom-0 left-10 md:left-16 w-20 md:w-28 h-20 md:h-28 rounded-lg overflow-hidden shadow-md border-2 border-white z-10">
              <img src={marketplaceImg} alt="Buyer Agripreneur" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 md:bottom-2 right-2 md:right-4 w-20 md:w-28 h-20 md:h-28 rounded-lg overflow-hidden shadow-md border-2 border-white z-0">
              <img src={expertGuidanceImg} alt="Specialist Assisting Farmers" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-3 md:px-4 lg:px-8 bg-background">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              Powerful tools and features designed specifically for modern farmers and agricultural professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card animate-fade-in-up rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover img-safe-zone"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2">
                      <feature.icon className="h-5 w-5 text-white" />
                      <h3 className="text-lg font-bold font-heading text-white drop-shadow-md">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-card">
                  <p className="text-muted-foreground font-body text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 lg:px-8 bg-muted">
        <div className="max-w-container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-6">
                Why Choose SmartFarm Hub?
              </h2>
              <div className="space-y-4">
                {[
                  "Real-time weather and market data",
                  "AI-powered disease detection",
                  "Direct connection with agricultural experts",
                  "Easy marketplace for buying and selling",
                  "Community forums for peer learning",
                  "Comprehensive farming tools"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0" />
                    <span className="font-body text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/register">
                  <Button className="bg-accent hover:bg-accent-hover text-white font-heading px-8 py-6">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={aiDiseaseImg}
                alt="Smart Farming Technology"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8 bg-primary">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-white/80 font-body mb-8 max-w-2xl mx-auto">
            Join thousands of farmers already using SmartFarm Hub to grow their businesses.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="bg-accent hover:bg-accent-hover text-white text-lg px-10 py-7 font-heading shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="bg-white text-black border-white hover:bg-gray-100 hover:text-black hover:shadow-lg text-lg px-10 py-7 font-heading transition-all">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 lg:px-8 bg-card border-t">
        <div className="max-w-container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Tractor className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-bold font-heading text-foreground">SmartFarm Hub</span>
            </div>
            <p className="text-muted-foreground font-body text-sm">
              © 2024 SmartFarm Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
