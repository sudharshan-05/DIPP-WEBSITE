const express = require('express');
const cors = require('cors');
const xss = require('xss');
const rateLimit = require('express-rate-limit');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } = require('firebase/firestore');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Adjust origin as needed for production
app.use(express.json());

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 registrations per hour
    message: { error: "Registration limit exceeded. Please try again later." }
});

app.use('/api/', generalLimiter);


// Helper function to sanitize objects
const sanitizeData = (data) => {
    if (typeof data !== 'object' || data === null) return xss(data);
    const sanitized = Array.isArray(data) ? [] : {};
    for (const key in data) {
        if (typeof data[key] === 'object') {
            sanitized[key] = sanitizeData(data[key]);
        } else if (typeof data[key] === 'string') {
            sanitized[key] = xss(data[key]);
        } else {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
};


// --- ROUTES ---

// 1. Events
app.get('/api/events', async (req, res) => {
    try {
        const eventsCol = collection(db, 'events');
        const snapshot = await getDocs(eventsCol);
        const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(eventsList);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

app.post('/api/events', async (req, res) => {
    console.log("POST /api/events - Started", req.body);
    try {
        const cleanData = sanitizeData(req.body);
        console.log("Data sanitized, adding to Firestore...");
        const docRef = await addDoc(collection(db, 'events'), cleanData);
        console.log("Firestore success: id =", docRef.id);
        res.status(201).json({ id: docRef.id, ...cleanData });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'events', req.params.id));
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
});


// 2. Registrations (Events)
app.post('/api/register', registrationLimiter, async (req, res) => {
    try {
        const cleanData = sanitizeData(req.body); // Expects { eventId, user: { email, name... } }
        if (!cleanData.eventId || !cleanData.user) {
            return res.status(400).json({ error: "Missing eventId or user data" });
        }
        
        const docRef = await addDoc(collection(db, 'registrations'), {
            eventId: cleanData.eventId,
            user: cleanData.user,
            timestamp: new Date().toISOString()
        });
        
        res.status(201).json({ message: "Registered successfully", id: docRef.id });
    } catch (error) {
        console.error("Error registering:", error);
        res.status(500).json({ error: "Failed to register" });
    }
});


// 3. Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projectsCol = collection(db, 'projects');
        const snapshot = await getDocs(projectsCol);
        const projectsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(projectsList);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

app.post('/api/projects', async (req, res) => {
    console.log("POST /api/projects - Started");
    try {
        const cleanData = sanitizeData(req.body);
        const docRef = await addDoc(collection(db, 'projects'), cleanData);
        console.log("Firestore Project success: id =", docRef.id);
        res.status(201).json({ id: docRef.id, ...cleanData });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'projects', req.params.id));
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
});


// 4. Team
app.get('/api/team', async (req, res) => {
    try {
        const teamCol = collection(db, 'team');
        const snapshot = await getDocs(teamCol);
        const teamList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(teamList);
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ error: "Failed to fetch team" });
    }
});

app.post('/api/team', async (req, res) => {
    try {
        const cleanData = sanitizeData(req.body);
        const docRef = await addDoc(collection(db, 'team'), cleanData);
        res.status(201).json({ id: docRef.id, ...cleanData });
    } catch (error) {
        console.error("Error adding team member:", error);
        res.status(500).json({ error: "Failed to add team member" });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'team', req.params.id));
        res.json({ message: "Team member deleted successfully" });
    } catch (error) {
        console.error("Error deleting team member:", error);
        res.status(500).json({ error: "Failed to delete team member" });
    }
});


// 5. Gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const galleryCol = collection(db, 'gallery');
        const snapshot = await getDocs(galleryCol);
        const galleryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(galleryList);
    } catch (error) {
        console.error("Error fetching gallery:", error);
        res.status(500).json({ error: "Failed to fetch gallery albums" });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        const cleanData = sanitizeData(req.body);
        const docRef = await addDoc(collection(db, 'gallery'), cleanData);
        res.status(201).json({ id: docRef.id, ...cleanData });
    } catch (error) {
        console.error("Error creating gallery album:", error);
        res.status(500).json({ error: "Failed to create gallery album" });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'gallery', req.params.id));
        res.json({ message: "Gallery album deleted successfully" });
    } catch (error) {
        console.error("Error deleting gallery album:", error);
        res.status(500).json({ error: "Failed to delete gallery album" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
