import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import Silk from '../components/Silk';
import ScrollReveal from '../components/ScrollReveal';
import BlurText from '../components/BlurText';
import GradientText from '../components/GradientText';
import RotatingText from '../components/RotatingText';
import Dock from '../components/Dock';
import type { DockItemData } from '../components/Dock';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

export default function Home() {
  const navigate = useNavigate();
  const [showLinkedInAlert, setShowLinkedInAlert] = useState(false);
  const { scrollYProgress } = useScroll();
  const fadeOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]); // Fade in dynamically only at the very bottom of the page

  const shuffledTexts = useMemo(() => {
    const arr = [
      'AI Developer', 'Hardware Enthusiast', 'Computer Vision Engineer', 
      'Product Designer', 'AI Consultant', 'Game Developer', 
      'Robotics Engineer', 'Vector Graphics Artist', 
      'Cybersecurity Consultant', 'Natural Language Processing Engineer'
    ];
    return arr.sort(() => Math.random() - 0.5);
  }, []);

  const navItems: DockItemData[] = [
    {
      icon: <img src="/assets/projects.svg" alt="Projects" className="w-[80%] h-[80%] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] drop-shadow-[0_8px_10px_rgba(0,0,0,0.9)]" />,
      label: 'Projects',
      onClick: () => navigate('/projects'),
    },
    {
      icon: <img src="/assets/resume.svg" alt="Resume" className="w-[80%] h-[80%] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] drop-shadow-[0_8px_10px_rgba(0,0,0,0.9)]" />,
      label: 'Resume',
      onClick: () => {
        const link = document.createElement('a');
        link.href = '/assets/Mitchell%20Resume.pdf';
        link.download = 'Mitchell_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      icon: <img src="/assets/briefcase.svg" alt="LinkedIn" className="w-[80%] h-[80%] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] drop-shadow-[0_8px_10px_rgba(0,0,0,0.9)]" />,
      label: 'LinkedIn',
      onClick: () => setShowLinkedInAlert(true),
    },
    {
      icon: <img src="/assets/computer.svg" alt="GitHub" className="w-[80%] h-[80%] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] drop-shadow-[0_8px_10px_rgba(0,0,0,0.9)]" />,
      label: 'GitHub',
      onClick: () => window.open('https://github.com/Lambent7', '_blank'),
    },
  ];

  return (
    <div className="bg-black text-white relative min-h-screen w-full">
      {/* Fixed Dock Safely Bound outside filters on viewport floor */}
      <div className="fixed bottom-0 left-0 w-full h-[180px] flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto relative w-full h-full">
           <Dock 
             items={navItems} 
             panelHeight={95} 
             baseItemSize={75} 
             magnification={120} 
             dockHeight={150} 
             className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
           />
        </div>
      </div>

      {/* Global Fixed Silk Background */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        <Silk speed={10} scale={0.75} color="#B071DF" noiseIntensity={1.5} rotation={0} />
        {/* Soft fade to black at the bottom tied to scroll physics */}
        <motion.div 
          style={{ opacity: fadeOpacity }}
          className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-black to-transparent z-10"
        />
      </div>

      {/* Top Header Section overlapping Silk directly */}
      <header className="relative w-full min-h-screen flex flex-col items-center justify-center z-10 px-4 drop-shadow-[0_0_50px_rgba(0,0,0,1)] drop-shadow-[0_10px_20px_rgba(0,0,0,1)] drop-shadow-[0_0_10px_rgba(0,0,0,1)]">
        <div className="text-center w-full flex flex-col items-center justify-center">
          <div className="text-6xl sm:text-[7rem] sm:leading-tight mb-2 font-medium flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
            <BlurText 
              text=""
              delay={50}
              initialDelay={800}
              animateBy="words"
              direction="bottom" 
            />
            <GradientText colors={['#FFFB78', '#CCF470', '#FFE373']} animationSpeed={6} className="!mb-0 !pb-0 text-6xl sm:text-[7rem]">
              <BlurText 
                text="Mitchell Graham"
                delay={50}
                initialDelay={1200}
                animateBy="words"
                direction="bottom" 
              />
            </GradientText>
          </div>
          
          <motion.div 
             className="mt-8 flex justify-center w-full"
             initial={{ filter: 'blur(10px)', opacity: 0, y: 10 }}
             animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 1.8 }}
          >
             <RotatingText 
              texts={shuffledTexts}
              rotationInterval={3000}
              staggerDuration={0.03}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-120%', opacity: 0 }}
              mainClassName="text-2xl sm:text-[2rem] text-purple-200 font-light tracking-widest drop-shadow-lg overflow-hidden py-2"
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-[185px] flex flex-col items-center justify-center gap-2 opacity-60 cursor-pointer pointer-events-auto hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 2.5 }}
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        >
          <span className="text-sm font-medium tracking-[0.2em] text-white/70 uppercase">Read Bio</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-[#B071DF]" />
          </motion.div>
        </motion.div>
      </header>

      {/* Main Content with Frost Glass Backdrop */}
      <main 
        className="relative z-30 -mt-[15vh] pt-[45vh] px-5 pb-[15vh] flex justify-center w-full bg-black/30 backdrop-blur-3xl"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 10vh, rgba(0,0,0,0.3) 20vh, black 30vh)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 10vh, rgba(0,0,0,0.3) 20vh, black 30vh)'
        }}
      >
        <div className="w-full px-4 sm:px-12 md:px-24">
          <div className="w-full max-w-4xl mx-auto mb-20">
            <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-8 sm:p-12 md:p-16 relative overflow-hidden text-left">
              {/* Ambient Glow Orbs */}
              <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-[#B071DF]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 text-neutral-300 font-light">
                <ScrollReveal
                  baseOpacity={0.1}
                  baseRotation={1}
                  blurStrength={2}
                  containerClassName="!my-0"
                  textClassName="text-[1.1rem] sm:text-[1.2rem] leading-relaxed m-0 text-center sm:text-left drop-shadow-md"
                >
                  I am a recent Drake University graduate with a dual degree in Artificial Intelligence and Computer Science, with a minor in Japanese. My technical expertise spans across Python, Rust, and TypeScript, combined with a deep passion for Computer Vision, Natural Language Processing, and 3D modeling. I thrive at the intersection of logical problem solving and creative design—whether I'm prototyping product experiences in Blender or designing machine learning models using TensorFlow. Ultimately, my goal is to innovate on human-computer interaction to make advanced computing and robotics as accessible and intuitive as possible.
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* LinkedIn Privacy Modal */}
      <AlertDialog open={showLinkedInAlert} onOpenChange={setShowLinkedInAlert}>
        <AlertDialogContent className="bg-black/30 backdrop-blur-3xl border border-white/10 text-white rounded-3xl p-8 sm:max-w-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-bold tracking-wide text-neutral-100 flex items-center gap-4">
              <span className="bg-white/5 w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 shrink-0">
                <img src="/assets/briefcase.svg" alt="" className="w-6 h-6 opacity-90 mix-blend-screen brightness-200" />
              </span>
              Privacy Notice
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-neutral-200 leading-relaxed mt-4">
              As an advocate for digital privacy, I have significant concerns regarding LinkedIn's data collection policies and ongoing privacy litigation. While I maintain a profile strictly for indexing and discoverability, I limit my direct engagement on the platform.
              <br/><br/>
              For more information regarding these privacy concerns: <a href="https://browsergate.eu/" target="_blank" rel="noopener noreferrer" className="text-[#b071df] hover:opacity-80 underline font-medium transition-colors">https://browsergate.eu/</a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 sm:justify-start gap-3 !bg-transparent !border-0 !m-0 !p-0 flex-row">
            <AlertDialogCancel className="bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors h-10 flex items-center justify-center">Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.open('https://linkedin.com/in/graham2md', '_blank')} className="bg-[#b071df] hover:opacity-90 text-white rounded-lg px-4 py-2 text-sm font-medium outline-none border-none transition-colors h-10 flex items-center justify-center">              Continue to LinkedIn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
