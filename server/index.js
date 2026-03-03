
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ------ Cloudinary Config ------
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// Upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio', resource_type: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });

// ------ Middleware ------
app.use(cors());
app.use(express.json());

// Admin Auth Middleware
const requireAdmin = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (!process.env.ADMIN_SECRET) {
        return res.status(500).json({ error: 'Server not configured with ADMIN_SECRET' });
    }
    if (!token || token !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// =====================
//  PUBLIC READ ROUTES
// =====================

app.get('/api/tech-stack', async (req, res) => {
    try {
        const techStack = await prisma.techStack.findMany({ orderBy: { id: 'asc' } });
        res.json(techStack);
    } catch {
        res.status(500).json({ error: 'Failed to fetch tech stack' });
    }
});

app.get('/api/blog-posts', async (req, res) => {
    try {
        const posts = await prisma.blogPost.findMany({ orderBy: { id: 'desc' } });
        res.json(posts);
    } catch {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

app.get('/api/gallery', async (req, res) => {
    try {
        const photos = await prisma.galleryPhoto.findMany({ orderBy: { id: 'asc' } });
        res.json(photos);
    } catch {
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({ orderBy: { id: 'asc' } });
        res.json(projects);
    } catch {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.get('/api/socials', async (req, res) => {
    try {
        const socials = await prisma.socialProfile.findMany({ orderBy: { id: 'asc' } });
        res.json(socials);
    } catch {
        res.status(500).json({ error: 'Failed to fetch socials' });
    }
});

// =====================
//  ADMIN AUTH CHECK
// =====================

app.post('/api/admin/verify', requireAdmin, (req, res) => {
    res.json({ ok: true });
});

// =====================
//  CLOUDINARY UPLOAD
// =====================

app.post('/api/upload', requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const result = await uploadToCloudinary(req.file.buffer);
        res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: 'Image upload failed' });
    }
});

// =====================
//  PROJECTS CRUD
// =====================

app.post('/api/projects', requireAdmin, async (req, res) => {
    try {
        const { name, icon, description, link, githubLink, imageUrl, techStack } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                icon: icon || '/images/folder.png',
                description: Array.isArray(description) ? description : [description].filter(Boolean),
                link: link || null,
                githubLink: githubLink || null,
                imageUrl: imageUrl || null,
                techStack: Array.isArray(techStack) ? techStack : [],
            },
        });
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const { name, icon, description, link, githubLink, imageUrl, techStack } = req.body;
        const project = await prisma.project.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                icon: icon || '/images/folder.png',
                description: Array.isArray(description) ? description : [description].filter(Boolean),
                link: link || null,
                githubLink: githubLink || null,
                imageUrl: imageUrl || null,
                techStack: Array.isArray(techStack) ? techStack : [],
            },
        });
        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// =====================
//  BLOG POSTS CRUD
// =====================

app.post('/api/blog-posts', requireAdmin, async (req, res) => {
    try {
        const { title, date, image, link, tags } = req.body;
        const post = await prisma.blogPost.create({
            data: {
                title,
                date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                image: image || '',
                link,
                tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
            },
        });
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

app.put('/api/blog-posts/:id', requireAdmin, async (req, res) => {
    try {
        const { title, date, image, link, tags } = req.body;
        const post = await prisma.blogPost.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                image: image || '',
                link,
                tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
            },
        });
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

app.delete('/api/blog-posts/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.blogPost.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// =====================
//  GALLERY CRUD
// =====================

app.post('/api/gallery', requireAdmin, async (req, res) => {
    try {
        const { title, img, date, tags, isFavorite } = req.body;
        const photo = await prisma.galleryPhoto.create({
            data: {
                title,
                img,
                date: date || new Date().toISOString().split('T')[0],
                tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                isFavorite: isFavorite || false,
            },
        });
        res.status(201).json(photo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create gallery photo' });
    }
});

app.patch('/api/gallery/:id/favorite', requireAdmin, async (req, res) => {
    try {
        const photo = await prisma.galleryPhoto.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!photo) return res.status(404).json({ error: 'Photo not found' });
        const updated = await prisma.galleryPhoto.update({
            where: { id: parseInt(req.params.id) },
            data: { isFavorite: !photo.isFavorite },
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

app.put('/api/gallery/:id', requireAdmin, async (req, res) => {
    try {
        const { title, img, date, tags, isFavorite } = req.body;
        const photo = await prisma.galleryPhoto.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                img,
                date: date || new Date().toISOString().split('T')[0],
                tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                isFavorite: isFavorite !== undefined ? isFavorite : false,
            },
        });
        res.json(photo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update photo' });
    }
});

app.delete('/api/gallery/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.galleryPhoto.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});

// =====================
//  TECH STACK CRUD
// =====================

app.post('/api/tech-stack', requireAdmin, async (req, res) => {
    try {
        const { category, item } = req.body;
        const existing = await prisma.techStack.findUnique({ where: { category } });
        if (existing) {
            if (existing.items.includes(item)) {
                return res.json(existing);
            }
            const updated = await prisma.techStack.update({
                where: { category },
                data: { items: { push: item } },
            });
            return res.json(updated);
        }
        const created = await prisma.techStack.create({
            data: { category, items: [item] },
        });
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add tech stack item' });
    }
});

app.delete('/api/tech-stack/item', requireAdmin, async (req, res) => {
    try {
        const { category, item } = req.body;
        const existing = await prisma.techStack.findUnique({ where: { category } });
        if (!existing) return res.status(404).json({ error: 'Category not found' });

        const newItems = existing.items.filter(i => i !== item);
        if (newItems.length === 0) {
            await prisma.techStack.delete({ where: { category } });
            return res.json({ ok: true, deleted: true });
        }
        const updated = await prisma.techStack.update({
            where: { category },
            data: { items: newItems },
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove tech stack item' });
    }
});

app.delete('/api/tech-stack/:category', requireAdmin, async (req, res) => {
    try {
        await prisma.techStack.delete({ where: { category: req.params.category } });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete tech stack category' });
    }
});

// =====================
//  SOCIALS CRUD
// =====================

app.post('/api/socials', requireAdmin, async (req, res) => {
    try {
        const { text, icon, bg, link } = req.body;
        const social = await prisma.socialProfile.create({
            data: { text, icon, bg, link },
        });
        res.status(201).json(social);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create social' });
    }
});

app.put('/api/socials/:id', requireAdmin, async (req, res) => {
    try {
        const { text, icon, bg, link } = req.body;
        const social = await prisma.socialProfile.update({
            where: { id: parseInt(req.params.id) },
            data: { text, icon, bg, link },
        });
        res.json(social);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update social' });
    }
});

app.delete('/api/socials/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.socialProfile.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete social' });
    }
});

// =====================
//  GLOBAL ERROR HANDLERS
// =====================

process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});

// =====================
//  START SERVER
// =====================

// Connect Prisma first so the DB connection holds the event loop open,
// then start listening. Keeping the `server` reference also prevents
// Node from draining the event loop (fixes nodemon "clean exit" issue).
prisma.$connect()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
        // Prevent the event loop from being garbage-collected
        server.ref();
    })
    .catch((err) => {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    });
