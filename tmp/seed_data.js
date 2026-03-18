const API_BASE = 'http://127.0.0.1:3000/api';

const sampleEvents = [
    {
        title: "MemoryTrix 2026",
        date: "March 15, 2026",
        isoDate: "2026-03-15T10:00:00",
        venue: "Electronics Lab, Block A",
        category: "Competition",
        about: "MemoryTrix is a high-intensity memory challenge that fuses electronics puzzles with lightning-fast recall. Participants navigate through rounds of increasingly complex circuit identification, component matching, and schematic memorisation tasks.",
        conducted: false
    }
];

const sampleProjects = [
    {
        title: "Smart Traffic Controller",
        description: "AI-powered traffic management using computer vision to optimize signal timings.",
        tags: ["OpenCV", "Raspberry Pi", "Python"],
        imgSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
        githubUrl: "#",
        demoUrl: "#",
        starUrl: "#"
    },
    {
        title: "Gesture-Controlled Drone",
        description: "Control a quadcopter using hand gestures detected through image processing.",
        tags: ["MediaPipe", "Arduino", "C++"],
        imgSrc: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
        githubUrl: "#",
        demoUrl: "#",
        starUrl: "#"
    },
    {
        title: "IoT Weather Station",
        description: "ESP32-based weather sensors feeding data to a real-time cloud dashboard.",
        tags: ["ESP32", "MQTT", "React"],
        imgSrc: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&h=400&fit=crop",
        githubUrl: "#",
        demoUrl: "#",
        starUrl: "#"
    }
];

const sampleTeam = [
    {
        name: "VISHAL .M",
        role: "President",
        bio: "Leading embedded systems innovation and steering the club's technical vision as its founding President.",
        imgSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop",
        linkedinUrl: "#",
        githubUrl: "#"
    },
    {
        name: "Priya R.",
        role: "Vice President",
        bio: "Driving club operations and member engagement with a passion for robotics, AI, and community building.",
        imgSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop",
        linkedinUrl: "#",
        githubUrl: "#"
    },
    {
        name: "Arjun K.",
        role: "Technical Lead",
        bio: "Full-stack IoT developer who architects the club's technical projects — from ESP32 firmware to React dashboards.",
        imgSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop",
        linkedinUrl: "#",
        githubUrl: "#"
    },
    {
        name: "Sneha T.",
        role: "Events Coordinator",
        bio: "Organizes every workshop and competition with precision — from venue booking to live event coordination.",
        imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop",
        linkedinUrl: "#",
        githubUrl: "#"
    },
    {
        name: "Rohan V.",
        role: "Projects Manager",
        bio: "Turns ideas into working prototypes — managing project timelines, component sourcing, and cross-team delivery.",
        imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        linkedinUrl: "#",
        githubUrl: "#"
    }
];

const sampleGallery = [
    {
        name: "Hackathon 2025",
        summary: "48 hours of non-stop building, collaboration, and innovation.",
        images: [
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=350&fit=crop",
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&h=350&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=350&fit=crop"
        ]
    }
];

async function seed() {
    console.log("Starting seeding to " + API_BASE);
    
    try {
        console.log("Sending events...");
        for (const data of sampleEvents) {
            console.log(`Adding event: ${data.title}...`);
            const res = await fetch(`${API_BASE}/events`, { 
                method: 'POST', 
                body: JSON.stringify(data), 
                headers: {'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            if (res.ok) console.log(`✅ Added event: ${data.title}`);
            else console.log(`❌ Failed to add event: ${data.title} - ${res.status}`);
        }

        console.log("Sending projects...");
        for (const data of sampleProjects) {
            console.log(`Adding project: ${data.title}...`);
            const res = await fetch(`${API_BASE}/projects`, { 
                method: 'POST', 
                body: JSON.stringify(data), 
                headers: {'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            if (res.ok) console.log(`✅ Added project: ${data.title}`);
        }

        console.log("Sending team members...");
        for (const data of sampleTeam) {
            console.log(`Adding team: ${data.name}...`);
            const res = await fetch(`${API_BASE}/team`, { 
                method: 'POST', 
                body: JSON.stringify(data), 
                headers: {'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            if (res.ok) console.log(`✅ Added team member: ${data.name}`);
        }

        console.log("Sending gallery albums...");
        for (const data of sampleGallery) {
            console.log(`Adding gallery: ${data.name}...`);
            const res = await fetch(`${API_BASE}/gallery`, { 
                method: 'POST', 
                body: JSON.stringify(data), 
                headers: {'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            if (res.ok) console.log(`✅ Added gallery album: ${data.name}`);
        }

        console.log("Seeding complete!");
    } catch (err) {
        console.error("Critical seeding error:", err);
    }
}

seed().catch(console.error);
