
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
    log: ['info'],
});

async function main() {
    console.log('Start seeding ...');

    // Dynamic import of ESM constants
    const { techStack, blogPosts, gallery, socials, locations } = await import('../src/constants/index.js');

    // Seed Projects
    if (locations && locations.work && locations.work.children) {
        for (const project of locations.work.children) {
            // Extract details from children files
            let description = [];
            let link = null;
            let imageUrl = null;
            let githubLink = null; // constants check

            if (project.children) {
                const txtFile = project.children.find(c => c.fileType === 'txt');
                if (txtFile && txtFile.description) description = txtFile.description;

                const urlFile = project.children.find(c => c.fileType === 'url');
                if (urlFile && urlFile.href) link = urlFile.href;

                const githubFile = project.children.find(c => c.name === 'Github');
                if (githubFile && githubFile.href) githubLink = githubFile.href;

                const imgFile = project.children.find(c => c.fileType === 'img' && c.name.includes('preview') || c.imageUrl);
                // In constants, sometimes image is explicitly named or just the first image
                const previewImg = project.children.find(c => c.fileType === 'img');
                if (previewImg && previewImg.imageUrl) imageUrl = previewImg.imageUrl;
            }

            const existing = await prisma.project.findFirst({ where: { name: project.name } });
            if (!existing) {
                await prisma.project.create({
                    data: {
                        name: project.name,
                        icon: project.icon,
                        description: description,
                        link: link,
                        githubLink: githubLink,
                        imageUrl: imageUrl,
                        techStack: [] // Constants doesn't have explicit tech stack per project yet, defaulting empty
                    }
                });
                console.log(`Created project: ${project.name}`);
            }
        }
    }

    // Seed Tech Stack
    for (const stack of techStack) {
        const tech = await prisma.techStack.upsert({
            where: { category: stack.category },
            update: { items: stack.items },
            create: {
                category: stack.category,
                items: stack.items,
            },
        });
        console.log(`Created/Updated tech stack for category: ${tech.category}`);
    }

    // Seed Blog Posts
    for (const post of blogPosts) {
        const existing = await prisma.blogPost.findFirst({ where: { title: post.title } });
        if (!existing) {
            await prisma.blogPost.create({
                data: {
                    title: post.title,
                    date: post.date,
                    image: post.image,
                    link: post.link,
                    tags: post.tags || [],
                }
            });
            console.log(`Created blog post: ${post.title}`);
        }
    }

    // Seed Gallery
    for (const photo of gallery) {
        const existing = await prisma.galleryPhoto.findFirst({ where: { title: photo.title } });
        if (!existing) {
            await prisma.galleryPhoto.create({
                data: {
                    title: photo.title,
                    img: photo.img,
                    date: photo.date,
                    tags: photo.tags || [],
                    isFavorite: photo.isFavorite || false,
                }
            });
            console.log(`Created photo: ${photo.title}`);
        }
    }

    // Seed Socials
    for (const social of socials) {
        const existing = await prisma.socialProfile.findFirst({ where: { text: social.text } });
        if (!existing) {
            await prisma.socialProfile.create({
                data: {
                    text: social.text,
                    icon: social.icon,
                    bg: social.bg,
                    link: social.link,
                }
            });
            console.log(`Created social: ${social.text}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
