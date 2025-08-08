import React, { useEffect, useState } from 'react';
import PigmyProLogo from '../../assets/PigmyPro.png';
import TechyVerveLogo from '../../assets/Techy_Verve.png';




const LoadingScreen = ({ onAnimationComplete }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [glowVisible, setGlowVisible] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const startAnimation = () => {
    // Phase 1: Logo entrance
    setLogoVisible(true);
    
    setTimeout(() => {
      setGlowVisible(true);
    }, 300);

    // Phase 2: Text animation
    setTimeout(() => {
      setTextVisible(true);
    }, 800);

    // Phase 3: Pulse effect
    setTimeout(() => {
      setPulseActive(true);
    }, 1400);

    // Phase 4: Completion
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onAnimationComplete && onAnimationComplete();
      }, 500);
    }, 2200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #6739B7 0%, #9333EA 100%)',
        fontFamily: '"DM Sans", sans-serif'
      }}
    >
      {/* Floating geometric elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-24 h-24 rounded-full opacity-5 bg-white animate-pulse"
          style={{ top: '15%', right: '15%' }}
        />
        <div 
          className="absolute w-16 h-16 rounded-full opacity-5 bg-purple-300 animate-pulse"
          style={{ top: '65%', left: '20%', animationDelay: '1s' }}
        />
        <div 
          className="absolute w-20 h-20 rounded-full opacity-5 bg-white animate-pulse"
          style={{ bottom: '25%', right: '25%', animationDelay: '2s' }}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center text-center relative">
        {/* Logo section */}
        <div className="relative mb-12">
          {/* Glow effect */}
          <div 
            className={`absolute inset-0 w-56 h-56 rounded-full border-2 border-white/20 transition-all duration-500 ${
              glowVisible ? 'opacity-60 scale-110' : 'opacity-0 scale-90'
            }`}
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          />
          
          {/* Logo placeholder - replace with your actual logo */}
          <div 
            className={`relative w-48 h-48 flex items-center justify-center transition-all duration-600 ${
              logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            } ${pulseActive ? 'animate-pulse' : ''}`}
            style={{ 
              filter: 'drop-shadow(0 8px 20px rgba(255, 255, 255, 0.3))',
              transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}
          >     
            
            <img 
              src={PigmyProLogo} 
              alt="PigmyPro Logo"
              className="w-full h-full object-contain filter brightness-0 invert"
            />
           
          </div>
        </div>

        {/* App branding */}
        <div 
          className={`transition-all duration-500 ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-lg text-white/90 font-medium mb-5 tracking-wide">
            Agent Management
          </h2>
          
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-6 h-px bg-white/50" />
            <span className="text-sm text-white/80 font-normal tracking-wide">
              Secure & Simple
            </span>
            <div className="w-6 h-px bg-white/50" />
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div 
        className={`absolute bottom-12 flex flex-col items-center transition-all duration-500 ${
          textVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-xs text-white/60 mb-2 font-normal">Powered by</p>
        
        <div className="flex items-center mb-1">
          {/* Company logo placeholder - replace with your actual logo */}
          <img 
            src={TechyVerveLogo}
            alt="Techy Verve"
            className="w-16 h-16 object-contain filter brightness-0 invert"
          />
        </div>
        
        <p className="text-xs text-white/40 font-normal">© 2024 All Rights Reserved</p>
      </div>
    </div>
  );
};

export default LoadingScreen;