const express = require('express');
const cors = require('cors');
const xss = require('xss');
const rateLimit = require('express-rate-limit');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, query, where } = require('firebase/firestore');
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
try {
    const firebaseApp = initializeApp(firebaseConfig);
    var db = getFirestore(firebaseApp);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
}

// Middleware
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Adjust origin as needed for production
// Increase request size limit for large base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

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
    if (typeof data !== 'object' || data === null) {
        // Don't sanitize data URLs
        if (typeof data === 'string' && data.startsWith('data:')) {
            return data;
        }
        return xss(data);
    }
    
    const sanitized = Array.isArray(data) ? [] : {};
    for (const key in data) {
        const value = data[key];
        
        // Skip sanitization for image fields and arrays (to preserve base64 data)
        if (key === 'imgSrc' || key === 'images') {
            if (Array.isArray(value)) {
                // For image arrays, just keep the data URLs as-is
                sanitized[key] = value;
            } else if (typeof value === 'string' && value.startsWith('data:')) {
                // For single image data URLs
                sanitized[key] = value;
            } else {
                sanitized[key] = value;
            }
        } else if (value === null || value === undefined) {
            sanitized[key] = value;
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeData(value);
        } else if (typeof value === 'string') {
            // Only sanitize strings that are not data URLs
            if (value.startsWith('data:')) {
                sanitized[key] = value; // Don't sanitize data URLs
            } else {
                sanitized[key] = xss(value);
            }
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};


// --- ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

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
    console.log("POST /api/team - Started", req.body);
    try {
        const cleanData = sanitizeData(req.body);
        console.log("Data sanitized, adding to Firestore...");
        const docRef = await addDoc(collection(db, 'team'), cleanData);
        console.log("Firestore Team success: id =", docRef.id);
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
        const galleryList = [];
        for (const d of snapshot.docs) {
            const album = { id: d.id, ...d.data() };
            // Fetch images from gallery_images collection
            const imagesQuery = query(collection(db, 'gallery_images'), where('albumId', '==', d.id));
            const imgsSnapshot = await getDocs(imagesQuery);
            album.images = imgsSnapshot.docs.map(idoc => idoc.data().imgSrc).filter(Boolean);
            galleryList.push(album);
        }
        res.json(galleryList);
    } catch (error) {
        console.error("Error fetching gallery:", error);
        res.status(500).json({ error: "Failed to fetch gallery albums" });
    }
});

app.post('/api/gallery', async (req, res) => {
    console.log("POST /api/gallery - Started", req.body && { name: req.body.name, imagesCount: Array.isArray(req.body.images) ? req.body.images.length : 0 });
    try {
        const cleanData = sanitizeData(req.body);

        // Create album metadata without embedding large image data to avoid Firestore document size limits
        const albumDoc = {
            name: cleanData.name || 'Untitled Album',
            summary: cleanData.summary || '',
            createdAt: new Date().toISOString()
        };

        console.log("Creating album metadata...");
        const albumRef = await addDoc(collection(db, 'gallery'), albumDoc);

        // If images present, store them in a separate collection with a reference to albumId
        const images = Array.isArray(cleanData.images) ? cleanData.images : [];
        const storedImages = [];
        for (const img of images) {
            try {
                const imgDoc = await addDoc(collection(db, 'gallery_images'), {
                    albumId: albumRef.id,
                    imgSrc: img,
                    createdAt: new Date().toISOString()
                });
                storedImages.push({ id: imgDoc.id, imgSrc: img });
            } catch (imgErr) {
                console.error('Failed to store image for album', albumRef.id, imgErr);
            }
        }

        console.log("Firestore Gallery album created id =", albumRef.id, "images stored:", storedImages.length);

        // Return album object including the images the client uploaded so UI can render immediately
        res.status(201).json({ id: albumRef.id, ...albumDoc, images: storedImages.map(i => i.imgSrc) });
    } catch (error) {
        console.error("Error creating gallery album:", error);
        // If Firestore complains about large payloads, send a helpful error
        if (error && error.code === 3) { // Firestore RESOURCE_EXHAUSTED sometimes
            return res.status(413).json({ error: 'Payload too large for Firestore document. Upload fewer/smaller images.' });
        }
        res.status(500).json({ error: "Failed to create gallery album" });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        const albumId = req.params.id;
        // Delete album doc
        await deleteDoc(doc(db, 'gallery', albumId));
        // Delete associated images
        const imagesQuery = query(collection(db, 'gallery_images'), where('albumId', '==', albumId));
        const imgsSnapshot = await getDocs(imagesQuery);
        for (const imgDoc of imgsSnapshot.docs) {
            try {
                await deleteDoc(doc(db, 'gallery_images', imgDoc.id));
            } catch (delErr) {
                console.error('Failed to delete gallery image', imgDoc.id, delErr);
            }
        }
        res.json({ message: "Gallery album and images deleted successfully" });
    } catch (error) {
        console.error("Error deleting gallery album:", error);
        res.status(500).json({ error: "Failed to delete gallery album" });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Check for payload too large error
    if (err.status === 413 || err.code === 'PAYLOAD_TOO_LARGE') {
        return res.status(413).json({ error: 'Request body too large. Please use smaller images.' });
    }
    
    // JSON parse errors
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
