
import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  const luxuryBezier = [0.4, 0, 0.2, 1];

  // Colors for the floating orbs - Made movement faster for more energy
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
        scale: 1.05,
        filter: 'blur(15px)',
        transition: { duration: 1.4, ease: luxuryBezier } 
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
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 1.5, // Faster movement as requested
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
            className={`absolute rounded-full blur-[90px] opacity-40 ${orb.color} ${orb.size}`}
          />
        ))}
      </div>

      {/* High-End Frosted Glass Overlay */}
      <div className="absolute inset-0 z-10 backdrop-blur-[50px] bg-white/40" />

      {/* Main Content Area - Fixed width issues for mobile */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-[95vw] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(30px)' }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            filter: 'blur(0px)',
            y: [0, -6, 0]
          }}
          transition={{
            opacity: { duration: 2.2, ease: luxuryBezier },
            scale: { duration: 2.5, ease: luxuryBezier },
            filter: { duration: 2.5, ease: luxuryBezier },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative px-6 py-12 md:px-16 md:py-16 w-full flex flex-col items-center"
        >
          {/* Edge Glow Glass Border */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/50 shadow-[0_0_50px_rgba(255,255,255,0.4)] pointer-events-none bg-white/5" />
          
          <h1 
            className="cinzel font-bold tracking-[0.1em] md:tracking-[0.2em] leading-[1.1] gold-text-glow"
            style={{ 
              fontSize: 'clamp(1.8rem, 9vw, 5rem)', // Responsive typography
              width: '100%',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word'
            }}
          >
            SS CREATIONS
          </h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: 1.8, duration: 1.5 }}
            className="mt-6 flex items-center justify-center gap-3 md:gap-6 w-full"
          >
            <div className="h-[1px] flex-grow max-w-[60px] bg-gradient-to-r from-transparent to-white" />
            <span className="text-[10px] md:text-xs text-slate-800 font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] whitespace-nowrap cinzel">
              Curated Elegance
            </span>
            <div className="h-[1px] flex-grow max-w-[60px] bg-gradient-to-l from-transparent to-white" />
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .cinzel { font-family: 'Cinzel', serif; }

        /* Premium Gold Leaf Shimmer Effect */
        .gold-text-glow {
          background: linear-gradient(
            90deg,
            #FFFFFF 0%,
            #FBF5B7 25%,
            #FFFFFF 50%,
            #D4AF37 75%,
            #FFFFFF 100%
          );
          background-size: 200% auto;
          color: #FFF; /* Fallback */
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 5s linear infinite;
          text-shadow: 0 0 30px rgba(255,255,255,0.4);
          display: inline-block;
        }

        @keyframes goldShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* Prevent unwanted horizontal scroll on tiny devices */
        html, body {
          max-width: 100%;
          overflow-x: hidden;
        }
      `}</style>
    </motion.div>
  );
};

export default Loader;
