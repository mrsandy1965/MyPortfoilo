
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes

// Get Tech Stack
app.get('/api/tech-stack', async (req, res) => {
    try {
        const techStack = await prisma.techStack.findMany({
            orderBy: { id: 'asc' },
        });
        res.json(techStack);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tech stack' });
    }
});

// Get Blog Posts
app.get('/api/blog-posts', async (req, res) => {
    try {
        const posts = await prisma.blogPost.findMany({
            orderBy: { id: 'desc' }, // Latest first
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

// Get Gallery Photos
app.get('/api/gallery', async (req, res) => {
    try {
        const photos = await prisma.galleryPhoto.findMany({
            orderBy: { id: 'asc' },
        });
        res.json(photos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// Get Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany();
        // Complex mapping if needed, for now returning as is
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get Socials
app.get('/api/socials', async (req, res) => {
    try {
        const socials = await prisma.socialProfile.findMany({
            orderBy: { id: 'asc' },
        });
        res.json(socials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch socials' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
