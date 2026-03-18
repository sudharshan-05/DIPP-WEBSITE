async function addSampleData() {
    const apiBase = 'http://localhost:3000/api';

    // Add Team Member
    try {
        const res = await fetch(`${apiBase}/team`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "David S.",
                role: "President",
                bio: "Passionate about robotics and AI.",
                imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop"
            })
        });
        if (res.ok) console.log("Added Team Member");
        else console.error("Failed to add team member", await res.text());
    } catch (e) { console.error("Error adding team member", e); }

    // Add Gallery Album
    try {
        const res = await fetch(`${apiBase}/gallery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Hackathon 2025",
                description: "Our biggest event yet! 48 hours of building.",
                images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&h=350&fit=crop"]
            })
        });
        if (res.ok) console.log("Added Gallery Album");
        else console.error("Failed to add gallery album", await res.text());
    } catch (e) { console.error("Error adding gallery album", e); }

    // Add Event
    try {
        const res = await fetch(`${apiBase}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "RoboWars 2026",
                date: "2026-05-15",
                category: "Competition",
                description: "Battle of the bots. Unleash your inner warrior.",
                imgSrc: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=500&fit=crop",
                status: "upcoming"
            })
        });
        if (res.ok) console.log("Added Event");
        else console.error("Failed to add event", await res.text());
    } catch (e) { console.error("Error adding event", e); }
}

addSampleData();
