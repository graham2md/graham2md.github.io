import projectsData from './projects.json';

export interface Project {
    id: string;
    title: string;
    description: string;
    imagePath: string; 
    videoPath?: string; // Optional
    url: string; 
    hasGithubRepo: boolean;
    isFavorite: boolean;
    datePosted: Date;
    filters: string[];
}

export const myProjects: Project[] = projectsData.map((project: any) => ({
    ...project,
    datePosted: new Date(project.datePosted)
}));