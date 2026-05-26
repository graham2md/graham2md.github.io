import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ChevronLeft, Share2 } from 'lucide-react';
import { myProjects } from '../data/projects';
import Silk from '../components/Silk';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Match the project metadata
  const project = myProjects.find(p => p.id === id) || 
                  myProjects.find(p => p.url.includes(id || ''));

  useEffect(() => {
    if (id) {
      // Assuming posts are named identical to the project id
      fetch(`/posts/${id}.md`)
        .then(res => res.text())
        .then(text => {
          // Fallback if not found
          if (text.startsWith('<!DOCTYPE html>')) {
             setContent('**Post not found or still being written.**');
          } else {
             setContent(text);
          }
        })
        .catch(() => setContent('Failed to load markdown details.'));
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentPercent = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentPercent);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = project ? new Date(project.datePosted).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  }) : 'Unknown Date';

  const title = project ? project.title.replace('(EXAMPLE) ', '') : 'Blog Post';
  const heroImage = project ? `/${project.imagePath}` : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1920';

  return (
    <div className="bg-black text-white min-h-screen relative overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div 
        style={{ width: `${scrollProgress}%` }} 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-[#B071DF] to-indigo-500 z-50 transition-all duration-75 shadow-[0_0_15px_#B071DF]" 
      />

      {/* Hero Header */}
      <header className="relative w-full h-[55vh] flex items-center justify-center overflow-hidden bg-black/80 z-10 border-b border-white/5">
        {/* Atmospheric Blurred Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-xl scale-110 transition-opacity duration-1000"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        {/* Dynamic Video Loop in Background */}
        {project?.videoPath && (
          <video 
            src={`/${project.videoPath}`}
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-md mix-blend-screen pointer-events-none"
          />
        )}

        {/* Depth Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

        {/* Back Button */}
        <Link 
          to="/projects" 
          className="absolute top-8 left-8 z-30 bg-black/40 border border-white/10 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/20 active:translate-y-0 transition-all duration-300 no-underline shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md group"
        >
          <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium tracking-wide">Projects</span>
        </Link>

        {/* Floating Mockup Card */}
        <div className="relative z-20 max-w-lg w-full px-6 flex flex-col items-center">
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-black/40 backdrop-blur-md relative group">
            {project?.videoPath ? (
              <video 
                src={`/${project.videoPath}`}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={heroImage} 
                alt={title} 
                className="w-full h-full object-cover" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Global Fixed Silk Background */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        <Silk speed={6} scale={0.7} color="#B071DF" noiseIntensity={1.2} rotation={0} />
      </div>

      {/* Main Blog Content Container */}
      <main className="relative z-20 -mt-24 px-4 sm:px-6 pb-32">
        <div className="max-w-[850px] mx-auto">
          {/* Glass Card */}
          <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.7)] p-6 sm:p-12 md:p-16 relative overflow-hidden">
            {/* Ambient Glow Orbs */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#B071DF]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-center leading-[1.15] mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-purple-300 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12 text-neutral-400 text-sm font-medium border-b border-white/5 pb-8">
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-neutral-300 shadow-sm">{formattedDate}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-neutral-300 shadow-sm">5 Min Read</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                <div className="flex gap-1.5 flex-wrap">
                  {project?.filters.map(filter => (
                    <span key={filter} className="bg-purple-950/20 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md text-xs shadow-sm">
                      {filter}
                    </span>
                  ))}
                </div>
              </div>

              {/* Markdown Content */}
              <div className="text-neutral-300 text-[1.05rem] leading-[1.85] font-light Markdown-Container">
                <Markdown
                  components={{
                    h2: ({node, ...props}) => <h2 className="text-white text-2xl sm:text-3xl mt-12 mb-6 font-semibold tracking-wide border-b border-white/5 pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-white text-xl sm:text-2xl mt-10 mb-4 font-semibold tracking-wide" {...props} />,
                    p: ({node, ...props}) => <p className="mb-6 leading-relaxed font-light text-neutral-300" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-8 text-neutral-300 space-y-3" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-8 text-neutral-300 space-y-3" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1 leading-relaxed" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-purple-500/80 pl-6 py-3 my-8 italic text-purple-200/90 bg-purple-950/10 rounded-r-2xl border-t border-r border-b border-white/5 shadow-inner" {...props} />
                    ),
                    hr: ({node, ...props}) => <hr className="my-10 border-t border-white/10" {...props} />,
                    code: ({node, ...props}) => <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-mono text-sm text-purple-300" {...props} />
                  }}
                >
                  {content}
                </Markdown>
              </div>

              {/* Share section */}
              <div className="mt-16 pt-10 border-t border-white/5 flex flex-col items-center">
                <button 
                  onClick={handleShare} 
                  className="bg-transparent border-none outline-none flex flex-col items-center text-white cursor-pointer group hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="bg-white/5 border border-white/10 p-4 rounded-full group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 mb-3 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
                    <Share2 size={22} className="text-neutral-300 group-hover:text-white" />
                  </span>
                  <span className="text-sm font-medium tracking-wider text-neutral-400 group-hover:text-white transition-colors">{copied ? 'Copied!' : 'Share Article'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
