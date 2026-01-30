
import { motion } from 'framer-motion';
import React from 'react';

const Loader: React.FC = () => {
  // Luxury bezier for smooth easing
  const luxuryBezier: [number, number, number, number] = [0.4, 0, 0.2, 1];

  // Colors for the floating orbs
  const orbs = [
    { color: 'bg-[#D4AF37]', size: 'w-[50vw] h-[50vw]', initial: { x: '-20%', y: '10%' }, animate: { x: '20%', y: '40%' } },
    { color: 'bg-[#FFB6C1]', size: 'w-[45vw] h-[45vw]', initial: { x: '70%', y: '50%' }, animate: { x: '30%', y: '10%' } },
    { color: 'bg-[#000080]', size: 'w-[55vw] h-[55vw]', initial: { x: '10%', y: '80%' }, animate: { x: '60%', y: '30%' } },
    { color: 'bg-[#D4AF37]', size: 'w-[40vw] h-[40vw]', initial: { x: '60%', y: '80%' }, animate: { x: '10%', y: '50%' } },
  ];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.1,
        filter: 'blur(20px)',
        transition: { duration: 1.5, ease: luxuryBezier } 
      }}
      className="fixed inset-0 z-[250] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Dynamic Background Orbs Layer */}
      <div className="absolute inset-0 z-0">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            initial={orb.initial}
            animate={{
              ...orb.animate,
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 7 + i * 2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
            className={`absolute rounded-full blur-[100px] opacity-30 ${orb.color} ${orb.size}`}
          />
        ))}
      </div>

      {/* High-End Frosted Glass Overlay */}
      <div className="absolute inset-0 z-10 backdrop-blur-[60px] bg-white/50" />

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-[95vw] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            y: [0, -8, 0]
          }}
          transition={{
            opacity: { duration: 1.8, ease: luxuryBezier },
            scale: { duration: 2, ease: luxuryBezier },
            filter: { duration: 2, ease: luxuryBezier },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative px-6 py-14 md:px-20 md:py-20 w-full flex flex-col items-center"
        >
          {/* Glass Border */}
          <div className="absolute inset-0 rounded-[3rem] border border-white/60 shadow-[0_0_60px_rgba(255,255,255,0.5)] pointer-events-none bg-white/10" />
          
          <h1 
            className="cinzel font-bold tracking-[0.1em] md:tracking-[0.2em] leading-[1.1] gold-text-glow"
            style={{ 
              fontSize: 'clamp(2rem, 10vw, 5.5rem)',
              width: '100%',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word'
            }}
          >
            SS CREATIONS
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="mt-8 flex flex-col items-center gap-4 w-full"
          >
            <div className="flex items-center justify-center gap-6 w-full">
              <div className="h-[1px] flex-grow max-w-[80px] bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
              <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.5em] cinzel">
                Curated Elegance
              </span>
              <div className="h-[1px] flex-grow max-w-[80px] bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
            </div>
            
            {/* Loading Status Text */}
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[9px] md:text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.8em] mt-2 block"
            >
              LOADING...
            </motion.span>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .cinzel { font-family: 'Cinzel', serif; }

        .gold-text-glow {
          background: linear-gradient(
            90deg,
            #1C1917 0%,
            #D4AF37 25%,
            #1C1917 50%,
            #D4AF37 75%,
            #1C1917 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 6s linear infinite;
          text-shadow: 0 0 40px rgba(212, 175, 55, 0.2);
          display: inline-block;
        }

        @keyframes goldShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        html, body {
          max-width: 100%;
          overflow-x: hidden;
        }
      `}</style>
    </motion.div>
  );
};

export default Loader;
