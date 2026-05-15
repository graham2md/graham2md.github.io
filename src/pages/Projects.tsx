import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, ListFilter, Star } from 'lucide-react';
import { myProjects } from '../data/projects';
import type { Project } from '../data/projects';
import Silk from '../components/Silk';
import SpotlightCard from '../components/SpotlightCard';


function ProjectTile({ project }: { project: Project }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={project.url} className="no-underline text-inherit group outline-none">
        <SpotlightCard 
          spotlightColor="#b071dfff"
          className="w-full h-full !p-0 border border-white/10 bg-black/20 backdrop-blur-2xl flex flex-col overflow-hidden rounded-3xl shadow-2xl"
        >
          <div 
            className="relative w-full aspect-video bg-black/50 overflow-hidden border-b border-white/5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
        {project.videoPath && (
          <video 
            src={project.videoPath} 
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
          />
        )}
        <img 
          src={project.imagePath} 
          alt={project.title} 
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${isHovered && project.videoPath ? 'opacity-0' : 'opacity-100'}`} 
        />
      </div>
        <div className="p-5 flex flex-col grow bg-black/30 backdrop-blur-xl shrink-0 z-10 transition-colors group-hover:bg-black/20">
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
  const [isDateDescending, setIsDateDescending] = useState(true);

  // Generate unique tags
  const allTags = useMemo(() => {
    const tags = myProjects.flatMap(p => p.filters).filter(t => t.trim() !== '');
    return Array.from(new Set(tags)).sort();
  }, []);

  // Filter and sort projects
  const displayProjects = useMemo(() => {
    let filtered = myProjects;
    if (activeFilters.length > 0) {
      filtered = myProjects.filter(project => 
        project.filters.some(f => activeFilters.includes(f))
      );
    }
    return [...filtered].sort((a, b) => {
      const timeA = a.datePosted.getTime();
      const timeB = b.datePosted.getTime();
      return isDateDescending ? timeB - timeA : timeA - timeB;
    });
  }, [activeFilters, isDateDescending]);

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex min-h-screen bg-transparent text-[#e0e0e0] relative overflow-hidden">
      
      {/* Global Fixed Silk Background */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        <Silk speed={10} scale={0.75} color="#B071DF" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 w-[300px] h-screen bg-black/40 backdrop-blur-3xl border-l border-white/10 p-6 shadow-[-4px_0_25px_rgba(0,0,0,0.8)] transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[320px]'}`}>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <h3 className="text-lg font-medium m-0">Filters</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveFilters([])} className="bg-none border-none text-[#a0a0a0] px-3 py-1.5 pt-2 rounded-md font-medium text-sm hover:text-white hover:bg-white/10 cursor-pointer transition-colors">Clear All</button>
            <button onClick={() => setIsSidebarOpen(false)} className="bg-none border-none text-[#a0a0a0] p-2 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
              <X size={20} />
            </button>
          </div>
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
        <header className="relative flex flex-wrap gap-4 justify-between items-center bg-black/40 backdrop-blur-2xl p-4 sm:px-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-white/10 z-20">
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

          <button onClick={() => setIsSidebarOpen(true)} className="bg-white/5 text-[#e0e0e0] border border-white/10 px-4 py-2 rounded-lg font-medium text-[0.95rem] flex items-center gap-2 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] active:translate-y-0 cursor-pointer transition-all">
            <ListFilter size={18} /> Filter
          </button>
        </header>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mt-8">
          {displayProjects.map(project => (
            <ProjectTile key={project.id} project={project} />
          ))}
        </div>
      </main>
    </div>
  );
}
