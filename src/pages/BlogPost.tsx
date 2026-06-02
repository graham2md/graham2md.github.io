import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ChevronLeft, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { myProjects } from '../data/projects';
import DotField from '../components/DotField';
import TiltedCard from '../components/TiltedCard';
import ShinyText from '../components/ShinyText';

const getAssetUrl = (path?: string) => {
  if (!path) return '';
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\//, '')}`;
};

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [additionalMedia, setAdditionalMedia] = useState<{src: string, title: string}[]>([]);
  const [baseVideoExists, setBaseVideoExists] = useState(false);

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

  const readingTime = useMemo(() => {
    if (!content) return 1;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 225));
  }, [content]);

  // Probe for additional media files (_1, _2, etc.)
  useEffect(() => {
    let isMounted = true;
    if (!project || !id) return;

    if (project.videoPath) {
      fetch(getAssetUrl(project.videoPath), { method: 'HEAD' })
        .then(res => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && !contentType.includes('text/html') && isMounted) {
            setBaseVideoExists(true);
          }
        })
        .catch(() => {});
    }

    const probeMedia = async () => {
      const base = getAssetUrl(`assets/${id}_`);
      const exts = ['.avif', '.png', '.jpg'];
      const found = [];
      
      // Look for up to 5 additional media files
      for (let i = 1; i <= 5; i++) {
        let matched = false;
        for (const ext of exts) {
          try {
            const src = `${base}${i}${ext}`;
            const res = await fetch(src, { method: 'HEAD' });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && !contentType.includes('text/html')) {
              found.push({ src, title: `Exhibit ${i}` });
              matched = true;
              break;
            }
          } catch (e) {
            // ignore
          }
        }
        if (!matched) break;
      }

      if (isMounted) setAdditionalMedia(found);
    };

    probeMedia();

    return () => { isMounted = false; };
  }, [id, project]);

  // Interactive Editorial Media Configuration
  const projectMedia = useMemo(() => {
    if (!project || !id) return [];

    const mediaList = [];
    // 1. Base Image
    mediaList.push({
      id: 'media-base-img',
      src: getAssetUrl(project.imagePath),
      title: project.title,
    });

    // 2. Base Video
    if (project.videoPath && baseVideoExists) {
      mediaList.push({
        id: 'media-base-vid',
        src: getAssetUrl(project.videoPath),
        title: 'Ambient Loop',
      });
    }

    // 3. Dynamic additional media (_1, _2, etc.)
    additionalMedia.forEach((media, index) => {
      mediaList.push({
        id: `media-dyn-${index}`,
        src: media.src,
        title: media.title
      });
    });

    // 4. Assign positions dynamically
    return mediaList.map((m, index) => {
      const isLeft = index % 2 === 0;
      const topOffset = 120 + (index * 300);
      return {
        ...m,
        initialPos: {
          top: `${topOffset}px`,
          [isLeft ? 'left' : 'right']: '-250px'
        }
      };
    });
  }, [id, project, additionalMedia, baseVideoExists]);

  return (
    <div className="bg-black text-white min-h-screen relative overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div 
        style={{ width: `${scrollProgress}%` }} 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-[#B071DF] to-indigo-500 z-50 transition-all duration-75 shadow-[0_0_15px_#B071DF]" 
      />

      {/* Back Button */}
      <Link 
        to="/projects" 
        className="fixed top-8 left-8 z-30 bg-black/30 backdrop-blur-2xl border border-white/10 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/20 active:translate-y-0 transition-all duration-300 no-underline shadow-[0_4px_16px_rgba(0,0,0,0.5)] group"
      >
        <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium tracking-wide">Projects</span>
      </Link>

      {/* Global Fixed Video + Reactive DotField Background */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        {project?.videoPath && (
          <video 
            src={`/${project.videoPath}`}
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-xl scale-110 pointer-events-none"
          />
        )}
        <div className="absolute inset-0 w-full h-full opacity-50">
          <DotField 
            dotRadius={5}
            dotSpacing={25}
            cursorRadius={500}
            cursorForce={0.15}
            bulgeStrength={50}
            waveAmplitude={1}
            gradientFrom="rgba(175, 113, 223, 0.5)"
            gradientTo="rgba(138, 92, 246, 0.5)"
          />
        </div>
      </div>

      {/* Main Blog Content Container */}
      <main className="relative z-20 pt-28 px-4 sm:px-6 pb-32">
        <div className="max-w-[850px] mx-auto relative">
          
          {/* Glass Card */}
          <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 sm:p-12 md:p-16 relative overflow-visible">
            {/* Ambient Glow Orbs */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#B071DF]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-center leading-[1.15] mb-6 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                <ShinyText text={title} speed={3.5} color="#e2e8f0" shineColor="#b071df" spread={90} />
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12 text-neutral-400 text-sm font-medium border-b border-white/5 pb-8">
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-neutral-300 shadow-sm">{formattedDate}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-neutral-300 shadow-sm">{readingTime} Min Read</span>
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
                    p: ({node, ...props}) => <p className="mb-8 leading-relaxed font-light text-neutral-300 text-[1.1rem]" {...props} />,
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
                  <span className="text-sm font-medium tracking-wider text-neutral-400 group-hover:text-white transition-colors">{copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Draggable Media Cards Portal */}
            <div className="absolute inset-0 pointer-events-none z-30">
              {projectMedia.map(media => (
                <motion.div
                  key={media.id}
                  drag
                  dragMomentum={false}
                  onDragStart={() => setDraggingId(media.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className="absolute w-[240px] pointer-events-auto select-none"
                  style={{
                    ...media.initialPos,
                    touchAction: 'none'
                  }}
                  whileHover={{ zIndex: 40 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                >
                  <TiltedCard
                    imageSrc={media.src}
                    altText={media.title}
                    captionText={media.title}
                    containerHeight="auto"
                    containerWidth="100%"
                    imageHeight="auto"
                    imageWidth="100%"
                    scaleOnHover={1.5}
                    rotateAmplitude={15}
                    showTooltip={false}
                    showMobileWarning={false}
                    isDragging={draggingId === media.id}
                  />
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
