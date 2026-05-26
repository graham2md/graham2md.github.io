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

export const myProjects: Project[] = [
    {
        id: "black_crown",
        title: "Black Crown Game Console",
        description: "Custom gaming console powered by the BC-250 (PS5) APU Board and CachyOS (Arch Linux Fork).",
        imagePath: "assets/blackcrown.avif",
        videoPath: "assets/blackcrown.av1",
        url: "/blog/black_crown",
        hasGithubRepo: false,
        isFavorite: true,
        datePosted: new Date("2026-03-31"),
        filters: ["Hardware", "Linux", "3D Modeling", "Quickshell", "UI/UX"]
    },
    {
        id: "emotion_game",
        title: "Emotion Game",
        description: "A speedrunning game to type sentences that have a sense of the target emotion. An emotion classifying AI decides if you win or lose!",
        imagePath: "assets/emotion_game.avif",
        videoPath: "assets/emotion_game.av1",
        url: "https://github.com/Lambent7/Emotion-Game",
        hasGithubRepo: true,
        isFavorite: false,
        datePosted: new Date("2026-03-31"),
        filters: ["NLP", "AI", "UI/UX", "Python", "Qt"]
    },
    {
        id: "steam_review_classifier",
        title: "Steam Review Classifier",
        description: "Natural language classifier trained on a subset of the SirSkandrani/steam_reviews_clean dataset. Classifies reviews as positive or negative",
        imagePath: "assets/steam_review_classifier.avif",
        videoPath: "assets/steam_review_classifier.av1",
        url: "https://github.com/Lambent7/SteamReviewClassifier",
        hasGithubRepo: true,
        isFavorite: false,
        datePosted: new Date("2026-03-31"),
        filters: ["NLP", "AI", "Python"]
    },
    // Template
    // {
    //     id: "",
    //     title: "",
    //     description: "",
    //     imagePath: "assets/.avif",
    //     videoPath: "assets/.av1",
    //     url: "blog/",
    //     hasGithubRepo: true,
    //     isFavorite: false,
    //     datePosted: new Date("2026-03-31"),
    //     filters: [""]
    // },
];