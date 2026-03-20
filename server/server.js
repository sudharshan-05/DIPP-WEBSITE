const express = require('express');
const cors = require('cors');
const xss = require('xss');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase with Service Role Key (bypasses RLS for server-side operations)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const uploadImageToStorage = async (base64Str, folder) => {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image')) {
        return base64Str;
    }
    try {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
        const base64Data = base64Str.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');
        
        const { data, error } = await supabase.storage
            .from('images') // Assume public bucket 'images' exists
            .upload(`${folder}/${filename}`, buffer, { 
                contentType: 'image/jpeg',
                upsert: true
            });
        
        if (error) {
            console.error(`[Supabase Storage] Error:`, error.message);
            return base64Str;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(`${folder}/${filename}`);

        console.log(`[Supabase Storage] Success: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error(`[Supabase Storage] Exception:`, error.message);
        return base64Str;
    }
};

const handleImageUploads = async (data, folder, fields) => {
    console.log(`[Handler] Processing images for ${folder} (${fields.join(', ')})`);
    const processed = { ...data };
    for (const field of fields) {
        if (Array.isArray(processed[field])) {
            console.log(`[Handler] Field '${field}' is an array of ${processed[field].length} images`);
            processed[field] = await Promise.all(
                processed[field].map(img => uploadImageToStorage(img, folder))
            );
        } else if (processed[field]) {
            console.log(`[Handler] Field '${field}' is a single image`);
            processed[field] = await uploadImageToStorage(processed[field], folder);
        }
    }
    return processed;
};

// Middleware
app.use(cors()); // Allow all origins for dev troubleshooting
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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


// Map lowercase Supabase columns back to camelCase for the frontend
const COLUMN_MAP = {
    imgsrc: 'imgSrc',
    githuburl: 'githubUrl',
    demourl: 'demoUrl',
    starurl: 'starUrl',
    linkedinurl: 'linkedinUrl',
    isodate: 'isoDate',
    rsvpcount: 'rsvpCount',
    created_at: 'created_at',
    attendee_info: 'attendee_info'
};

const normalizeToCamelCase = (row) => {
    if (!row || typeof row !== 'object') return row;
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
        normalized[COLUMN_MAP[key] || key] = value;
    }
    return normalized;
};

const normalizeRows = (rows) => {
    if (!Array.isArray(rows)) return rows;
    return rows.map(normalizeToCamelCase);
};


// --- ROUTES ---

// 1. Events
app.get('/api/events', async (req, res) => {
    try {
        const { data, error } = await supabase.from('events').select('*');
        if (error) throw error;
        res.json(normalizeRows(data));
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

app.post('/api/events', async (req, res) => {
    console.log("POST /api/events - Started", req.body.title);
    try {
        const sanitized = sanitizeData(req.body);
        const processed = await handleImageUploads(sanitized, 'events', ['img', 'images']);
        
        // Map to lowercase columns
        const dbData = {
            title: processed.title,
            category: processed.category,
            date: processed.date,
            isodate: processed.isoDate,
            time: processed.time,
            venue: processed.venue,
            duration: processed.duration,
            audience: processed.audience,
            about: processed.about,
            conducted: processed.conducted,
            img: processed.img,
            images: processed.images,
            rsvpcount: processed.rsvpCount
        };

        const { data, error } = await supabase.from('events').insert([dbData]).select();
        if (error) throw error;
        res.status(201).json(normalizeToCamelCase(data[0]));
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('events').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
});


// 2. Registrations (Events)
app.post('/api/register', registrationLimiter, async (req, res) => {
    try {
        const cleanData = sanitizeData(req.body);
        if (!cleanData.eventId || !cleanData.user) {
            return res.status(400).json({ error: "Missing eventId or user data" });
        }
        
        const { data, error } = await supabase.from('registrations').insert([{
            eventId: cleanData.eventId,
            attendee_info: cleanData.user,
            timestamp: new Date().toISOString()
        }]).select();
        
        if (error) throw error;
        res.status(201).json({ message: "Registered successfully", id: data[0].id });
    } catch (error) {
        console.error("Error registering:", error);
        res.status(500).json({ error: "Failed to register" });
    }
});


// 3. Projects
app.get('/api/projects', async (req, res) => {
    try {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) throw error;
        res.json(normalizeRows(data));
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

app.post('/api/projects', async (req, res) => {
    console.log("POST /api/projects - Started", req.body.title);
    try {
        const sanitized = sanitizeData(req.body);
        const processed = await handleImageUploads(sanitized, 'projects', ['imgSrc', 'images']);
        
        const dbData = {
            title: processed.title,
            description: processed.description,
            tags: processed.tags,
            imgsrc: processed.imgSrc,
            images: processed.images,
            githuburl: processed.githubUrl,
            demourl: processed.demoUrl,
            starurl: processed.starUrl
        };

        const { data, error } = await supabase.from('projects').insert([dbData]).select();
        if (error) throw error;
        res.status(201).json(normalizeToCamelCase(data[0]));
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
});


// 4. Team
app.get('/api/team', async (req, res) => {
    try {
        const { data, error } = await supabase.from('team').select('*');
        if (error) throw error;
        res.json(normalizeRows(data));
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ error: "Failed to fetch team" });
    }
});

app.post('/api/team', async (req, res) => {
    try {
        const sanitized = sanitizeData(req.body);
        const processed = await handleImageUploads(sanitized, 'team', ['imgSrc', 'images']);
        
        const dbData = {
            name: processed.name,
            role: processed.role,
            bio: processed.bio,
            imgsrc: processed.imgSrc,
            images: processed.images,
            linkedinurl: processed.linkedinUrl,
            githuburl: processed.githubUrl
        };

        const { data, error } = await supabase.from('team').insert([dbData]).select();
        if (error) throw error;
        res.status(201).json(normalizeToCamelCase(data[0]));
    } catch (error) {
        console.error("Error adding team member:", error);
        res.status(500).json({ error: "Failed to add team member" });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('team').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Team member deleted successfully" });
    } catch (error) {
        console.error("Error deleting team member:", error);
        res.status(500).json({ error: "Failed to delete team member" });
    }
});


// 5. Gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const { data, error } = await supabase.from('gallery').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error("Error fetching gallery:", error);
        res.status(500).json({ error: "Failed to fetch gallery albums" });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        const sanitized = sanitizeData(req.body);
        const processedData = await handleImageUploads(sanitized, 'gallery', ['images']);
        const { data, error } = await supabase.from('gallery').insert([processedData]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error("Error creating gallery album:", error);
        res.status(500).json({ error: "Failed to create gallery album" });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('gallery').delete().eq('id', req.params.id);
        if (error) throw error;
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
