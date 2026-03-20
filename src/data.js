// src/data.js — Static showcase data for Events, Team, and Projects

export const INITIAL_EVENTS = [
    {
        id: "event-1",
        title: "Robowars 2026",
        category: "Competition",
        date: "March 25, 2026",
        time: "10:00 AM",
        venue: "Main Auditorium",
        img: "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?w=800&q=80",
        about: "The ultimate battle of machines. Teams from across the state compete for the title.",
        conducted: false
    },
    {
        id: "event-2",
        title: "AI & ML Workshop",
        category: "Workshop",
        date: "February 10, 2026",
        time: "02:30 PM",
        venue: "Virtual",
        img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
        about: "Introduction to Neural Networks and Deep Learning basics.",
        conducted: true
    }
];

export const INITIAL_TEAM = [
    {
        id: "team-1",
        name: "VISHAL .M",
        role: "President",
        bio: "Leading the DIPP Club with a vision for innovation and robotics excellence.",
        imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        linkedinUrl: "#",
        githubUrl: "#"
    },
    {
        id: "team-2",
        name: "Sara M.",
        role: "Vice President",
        bio: "Passionate about electronics and team management.",
        imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
        linkedinUrl: "#",
        githubUrl: "#"
    }
];

export const INITIAL_PROJECTS = [
    {
        id: "project-1",
        title: "Smart Greenhouse",
        description: "IoT based monitoring system for plants.",
        tags: ["IoT", "Arduino", "Sensors"],
        imgSrc: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80",
        githubUrl: "#",
        demoUrl: "#"
    }
];

export const INITIAL_GALLERY = [
    {
        id: "album-1",
        title: "Workshop 2025 Highlights",
        images: [
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
        ]
    }
];
