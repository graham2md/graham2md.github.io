import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, ListFilter, Star, ChevronsUp } from 'lucide-react';
import { myProjects } from '../data/projects';
import type { Project } from '../data/projects';
import Grainient from '../components/Grainient';
import SpotlightCard from '../components/SpotlightCard';

const getAssetUrl = (path?: string) => {
  if (!path) return '';
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\//, '')}`;
};

function ProjectTile({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <Link to={project.url} className="no-underline text-inherit group outline-none">
        <SpotlightCard 
          spotlightColor="#b071dfff"
          className="w-full h-full !p-0 border border-white/10 bg-black/30 backdrop-blur-3xl flex flex-col overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
        >
          <div 
            className="relative w-full aspect-video bg-black/50 overflow-hidden border-b border-white/5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
        {project.videoPath && !videoError && (
          <video 
            src={getAssetUrl(project.videoPath)} 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
            ref={(el) => {
              if (el) {
                if (isHovered) el.play().catch(() => {});
                else { el.pause(); el.currentTime = 0; }
              }
            }}
            onError={() => setVideoError(true)}
          />
        )}
        <img 
          src={getAssetUrl(project.imagePath)} 
          alt={project.title} 
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${isHovered && project.videoPath && !videoError ? 'opacity-0' : 'opacity-100'}`} 
        />
      </div>
        <div className="p-5 flex flex-col grow bg-black/30 backdrop-blur-3xl shrink-0 z-10 transition-colors group-hover:bg-black/40">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-2xl font-medium text-white m-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] tracking-wide">{project.title}</h3>
            {project.isFavorite && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />}
          </div>
          <p className="text-neutral-300 m-0 leading-relaxed text-[0.95rem]">{project.description}</p>
          <div className="mt-auto flex gap-2 flex-wrap pt-5">
            {project.filters.map((tag) => (
              <span key={tag} className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-xs text-neutral-300 drop-shadow-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
        </SpotlightCard>
  </Link>
  );
}

export default function Projects() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDateDescending, setIsDateDescending] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('#filter-btn')) {
          setIsSidebarOpen(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Generate unique tags
  const allTags = useMemo(() => {
    const tags = myProjects.flatMap(p => p.filters).filter(t => t.trim() !== '');
    return Array.from(new Set(tags)).sort();
  }, []);

  // Filter and sort projects
  const displayProjects = useMemo(() => {
    let filtered = myProjects;
    
    if (showFavoritesOnly) {
      filtered = filtered.filter(p => p.isFavorite);
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter(project => 
        project.filters.some(f => activeFilters.includes(f))
      );
    }
    return [...filtered].sort((a, b) => {
      const timeA = a.datePosted.getTime();
      const timeB = b.datePosted.getTime();
      return isDateDescending ? timeB - timeA : timeA - timeB;
    });
  }, [activeFilters, showFavoritesOnly, isDateDescending]);

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#e0e0e0] relative overflow-hidden">
      
      {/* Unified Single-Canvas Dynamic Grainient & Particles Background */}
      <div className="fixed inset-0 z-0 bg-[#0a0516] pointer-events-none">
        <Grainient 
          timeSpeed={1} 
          warpStrength={2.5}
          rotationAmount={360}
          noiseScale={1.8}
          grainAmount={0.05}
          zoom={1.0}
          color1="#6c4589"
          color2="#2a182f"
          color3="#4f366c"
          className="absolute inset-0 w-full h-full opacity-90"
          showParticles={true}
          particleCount={1000}
          particleSpread={10}
          particleSpeed={0.04}
          particleBaseSize={50}
          cameraDistance={30}
          particleColors={["#B071DF", "#d8b4fe", "#ffffff"]}
        />
      </div>

      {/* Sidebar */}
      <aside ref={sidebarRef} className={`fixed top-0 right-0 w-[300px] h-screen bg-black/30 backdrop-blur-3xl border-l border-white/10 p-6 shadow-[-8px_0_32px_rgba(0,0,0,0.8)] transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[320px]'}`}>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h3 className="text-lg font-medium m-0">Filters</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveFilters([]); setShowFavoritesOnly(false); }} className="bg-none border-none text-[#a0a0a0] px-3 py-1.5 pt-2 rounded-md font-medium text-sm hover:text-white hover:bg-white/10 cursor-pointer transition-colors">Clear All</button>
            <button onClick={() => setIsSidebarOpen(false)} className="bg-none border-none text-[#a0a0a0] p-2 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="mb-8 border-b border-white/5 pb-6">
          <label className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors select-none shadow-sm">
            <div className="flex items-center gap-2.5 font-medium text-yellow-400">
              <Star size={18} className="fill-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" /> 
              Favorites Only
            </div>
            <input 
              type="checkbox" 
              checked={showFavoritesOnly}
              onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="accent-purple-500 w-4 h-4 cursor-pointer m-0"
            />
          </label>
        </div>

        <div className="mb-6">
          <h4 className="text-[#a0a0a0] mb-3 text-xs uppercase tracking-wider font-semibold m-0">All Tags</h4>
          <div className="flex flex-wrap gap-2.5">
            {allTags.map(tag => (
              <label key={tag} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-sm text-gray-300 hover:bg-white/10 hover:border-white/15 select-none">
                <input 
                  type="checkbox" 
                  value={tag} 
                  checked={activeFilters.includes(tag)}
                  onChange={() => toggleFilter(tag)}
                  className="accent-purple-500 w-3.5 h-3.5 cursor-pointer m-0" 
                />
                <span className={activeFilters.includes(tag) ? 'text-white font-semibold' : ''}>{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 w-full max-w-7xl mx-auto relative z-10">
        <header className="relative flex flex-wrap gap-4 justify-between items-center bg-black/30 backdrop-blur-3xl p-4 sm:px-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-white/10 z-20">
          <div className="flex items-center">
            <button onClick={() => setIsDateDescending(!isDateDescending)} className="bg-white/5 text-[#e0e0e0] border border-white/10 px-4 py-2 rounded-lg font-medium text-[0.95rem] flex items-center gap-2 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] active:translate-y-0 cursor-pointer transition-all">
              Date {isDateDescending ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          <Link 
            to="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:scale-125 active:scale-90 transition-all duration-300 z-30 no-underline"
          >
            <img 
              src="/assets/mg_logo.svg" 
              alt="MG Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(176,113,223,0.4)]" 
            />
          </Link>

          <button id="filter-btn" onClick={() => setIsSidebarOpen(true)} className="bg-white/5 text-[#e0e0e0] border border-white/10 px-4 py-2 rounded-lg font-medium text-[0.95rem] flex items-center gap-2 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] active:translate-y-0 cursor-pointer transition-all">
            <ListFilter size={18} /> Filter
          </button>
        </header>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mt-8">
          {displayProjects.map(project => (
            <ProjectTile key={project.id} project={project} />
          ))}
        </div>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 bg-black/30 backdrop-blur-3xl border border-white/10 p-3.5 rounded-full text-white shadow-[0_4px_24px_rgba(0,0,0,0.8)] hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(176,113,223,0.4)] active:translate-y-0 active:scale-95 transition-all duration-500 ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <ChevronsUp size={24} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </button>
    </div>
  );
}
