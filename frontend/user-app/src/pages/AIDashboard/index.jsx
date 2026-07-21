import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiHome, FiDroplet, FiMessageSquare, FiCpu, FiCheckCircle,
  FiZap, FiCompass, FiShield, FiArrowRight, FiLayers, FiCamera
} from 'react-icons/fi';
import FeatureCard from '../../components/AI/FeatureCard';

export default function AIDashboard() {
  const tools = [
    {
      title: "Smart Space Architect",
      subtitle: "AI Spatial Vision & Layout Planner",
      description: "Upload a snapshot of your room. Our vision algorithm parses spatial volume, detects wall boundaries, and recommends ideal smart furniture arrangements.",
      icon: FiHome,
      path: "/ai-decor/room-recommendation",
      badge: "Spatial Vision AI",
      bannerImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Parse room dimensions & floor boundaries",
        "12+ Room style presets (Modern, Luxury, Minimal)",
        "Automated 3D furniture placement catalog"
      ],
      buttonText: "Launch Space Architect"
    },
    {
      title: "Chroma & Palette Matcher",
      subtitle: "Wall Tone & Finish Visualizer",
      description: "Extract color tones directly from your walls or wallpaper. Preview coordinated wood finishes, fabric upholstery, and custom interior color themes.",
      icon: FiDroplet,
      path: "/ai-decor/color-matching",
      badge: "Color Harmony Engine",
      bannerImage: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Extract wall & wallpaper RGB tones",
        "Match teak, oak & fabric finish palettes",
        "Real-time budget balance & item swapper"
      ],
      buttonText: "Open Palette Matcher"
    },
    {
      title: "Virtual Interior Concierge",
      subtitle: "24/7 AI Furniture & Style Advisor",
      description: "Consult our interactive AI assistant to receive personalized furniture suggestions, curated room packages, and instant budget recommendations.",
      icon: FiMessageSquare,
      path: "/ai-decor/interior-assistant",
      badge: "Personal Design AI",
      bannerImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Natural language chat consultation",
        "Instant room budget bundle packages",
        "1-Click send complete room set to cart"
      ],
      buttonText: "Consult Concierge"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Room Snapshot",
      desc: "Snap or drop a photo of your living room, bedroom, or office space.",
      icon: FiCamera
    },
    {
      step: "02",
      title: "Vision AI Scanning",
      desc: "Our machine learning engine scans spatial volume, lighting & wall tones.",
      icon: FiCpu
    },
    {
      step: "03",
      title: "Match & Customize",
      desc: "Explore 12+ tailored furniture items matched to your room coordinates.",
      icon: FiLayers
    },
    {
      step: "04",
      title: "One-Click Shopping",
      desc: "Save your layout blueprint PDF or send matched items directly to cart.",
      icon: FiCheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HERO BANNER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-large overflow-hidden shadow-2xl p-8 sm:p-12 lg:p-16 border border-amber-950/20"
          style={{
            background: 'linear-gradient(135deg, #1A130E 0%, #2A1F17 50%, #120E0B 100%)',
          }}
        >
          {/* Blueprint scanning grid background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(166, 106, 44, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(166, 106, 44, 0.25) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Glow lights */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-amber-700/15 blur-3xl pointer-events-none -mb-20" />

          {/* Scanning line glow animation */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-pulse pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-white">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-extrabold uppercase tracking-widest backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                ✨ Mahaveer Smart Studio 1.5
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wide leading-tight font-sans">
                Transform Your Space With <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary to-amber-200">
                  Smart AI Design Suite
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed max-w-xl">
                Experience next-generation interior planning. Upload photos of your home, extract wall color palettes, coordinate furniture layouts, and consult our interactive AI concierge in real time.
              </p>

              {/* Stat Pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-large bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                  <FiZap className="text-amber-400" />
                  <span>&lt; 10s Vision Analysis</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-large bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                  <FiDroplet className="text-primary" />
                  <span>100% Palette Accuracy</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-large bg-white/5 border border-white/10 text-xs font-bold text-gray-200">
                  <FiHome className="text-amber-300" />
                  <span>Live Furniture Catalog</span>
                </div>
              </div>

            </div>

            {/* Right Visual Interactive Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-large overflow-hidden border border-amber-900/40 bg-gray-900/90 shadow-2xl p-4 backdrop-blur-md">
                
                {/* Room Mockup Image */}
                <div className="relative h-56 rounded-large overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
                    alt="AI Visualizer Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Floating Match Score Tag */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-400 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    98.4% Match Score
                  </div>

                  {/* Floating Spatial Pin 1 */}
                  <div className="absolute top-1/2 left-1/3 bg-white/90 backdrop-blur-md text-gray-900 px-2 py-1 rounded-md text-[10px] font-extrabold shadow-lg border border-white flex items-center gap-1 animate-bounce">
                    <span>🛋️ Sofa Placement</span>
                  </div>

                  {/* Floating Spatial Pin 2 */}
                  <div className="absolute bottom-6 right-1/4 bg-white/90 backdrop-blur-md text-gray-900 px-2 py-1 rounded-md text-[10px] font-extrabold shadow-lg border border-white flex items-center gap-1">
                    <span>☕ Coffee Table</span>
                  </div>
                </div>

                {/* Bottom Color Swatches Bar */}
                <div className="mt-3 bg-black/50 p-3 rounded-large border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Extracted Palette:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#A66A2C] border border-white/40 shadow-sm" title="Teak Warm" />
                      <span className="w-4 h-4 rounded-full bg-[#FAF5EF] border border-white/40 shadow-sm" title="Cream Alabaster" />
                      <span className="w-4 h-4 rounded-full bg-[#3D2314] border border-white/40 shadow-sm" title="Dark Walnut" />
                      <span className="w-4 h-4 rounded-full bg-[#708090] border border-white/40 shadow-sm" title="Slate Gray" />
                    </div>
                  </div>
                  <Link
                    to="/ai-decor/room-recommendation"
                    className="text-[10px] font-extrabold text-primary hover:text-amber-400 uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    Try Scan <FiArrowRight size={10} />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </motion.div>


        {/* FEATURE TOOLS SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-2 pt-4">
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block">
            Core AI Experience
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-wide font-sans">
            Choose Your AI Design Tool
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
            Select an intelligent assistant tailored to your specific room scanning, color matching, or furniture consultation needs.
          </p>
        </div>


        {/* FEATURE CARDS GRID (3 Tools) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {tools.map((tool, idx) => (
            <FeatureCard
              key={idx}
              title={tool.title}
              subtitle={tool.subtitle}
              description={tool.description}
              icon={tool.icon}
              path={tool.path}
              badge={tool.badge}
              bannerImage={tool.bannerImage}
              highlights={tool.highlights}
              buttonText={tool.buttonText}
            />
          ))}
        </motion.div>


        {/* HOW IT WORKS SECTION */}
        <div className="bg-white rounded-large border border-gray-100 p-8 sm:p-12 shadow-premium space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-wider font-sans">
              How Smart Studio Works
            </h3>
            <p className="text-xs text-gray-400 font-semibold">Four simple steps to transform your interior</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50/70 border border-gray-100 p-6 rounded-large flex flex-col items-center text-center relative group hover:border-primary/40 hover:bg-white transition-all duration-300 shadow-sm"
                >
                  <span className="absolute top-3 right-4 text-2xl font-black text-gray-200 group-hover:text-primary/20 transition-colors">
                    {item.step}
                  </span>
                  
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                    <IconComp size={20} />
                  </div>

                  <h4 className="text-sm font-extrabold text-gray-800 mb-1 tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>


        {/* STATS & ASSURANCE BANNER */}
        <div className="bg-secondary rounded-large p-8 text-white grid grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-premium border border-gray-800">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">10,000+</div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Room Scans Analyzed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">99.4%</div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Palette Match Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">100+</div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Smart Furniture Items</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">&lt; 10s</div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Instant AI Output</div>
          </div>
        </div>

      </div>
    </div>
  );
}
