import { create } from 'zustand';

import { immer } from 'zustand/middleware/immer';
import {
    locations as initialLocations,
    gallery as initialGallery,
    techStack as initialTechStack,
    blogPosts as initialBlogPosts,
    socials as initialSocials
} from '#constants';

const useContentStore = create(
    immer((set) => ({
        // Initial Data
        locations: initialLocations,
        gallery: initialGallery,
        techStack: initialTechStack,
        blogPosts: initialBlogPosts,
        socials: initialSocials,

        isLoading: false,
        error: null,

        // Actions
        fetchContent: async () => {
            set((state) => { state.isLoading = true; state.error = null; });
            try {
                const [techRes, blogRes, galleryRes, socialRes, projectRes] = await Promise.all([
                    fetch('http://localhost:3000/api/tech-stack'),
                    fetch('http://localhost:3000/api/blog-posts'),
                    fetch('http://localhost:3000/api/gallery'),
                    fetch('http://localhost:3000/api/socials'),
                    fetch('http://localhost:3000/api/projects')
                ]);

                const techStack = await techRes.json();
                const blogPosts = await blogRes.json();
                const gallery = await galleryRes.json();
                const socials = await socialRes.json();
                const projects = await projectRes.json();

                set((state) => {
                    state.techStack = techStack;
                    state.blogPosts = blogPosts;
                    state.gallery = gallery;
                    state.socials = socials;

                    // Map projects to finder structure
                    if (state.locations.work) {
                        const mappedProjects = projects.map((p, index) => {
                            // Basic mapping, can be improved to match addProject logic
                            const children = [];
                            if (p.description && p.description.length > 0) {
                                children.push({
                                    id: 1,
                                    name: `${p.name} Info.txt`,
                                    icon: "/images/txt.png",
                                    kind: "file",
                                    fileType: "txt",
                                    position: "top-5 left-10",
                                    description: p.description
                                });
                            }
                            if (p.link) {
                                children.push({
                                    id: 2,
                                    name: "Website",
                                    icon: "/images/safari.png",
                                    kind: "file",
                                    fileType: "url",
                                    href: p.link,
                                    position: "top-10 right-20"
                                });
                            }
                            if (p.githubLink) {
                                children.push({
                                    id: 5, // Arbitrary unique ID within folder
                                    name: "Github",
                                    icon: "/icons/github.svg",
                                    kind: "file",
                                    fileType: "url",
                                    href: p.githubLink,
                                    position: "top-10 left-40" // Adjust position to not overlap
                                });
                            }
                            if (p.imageUrl) {
                                children.push({
                                    id: 3,
                                    name: "Preview.png",
                                    icon: "/images/image.png",
                                    kind: "file",
                                    fileType: "img",
                                    imageUrl: p.imageUrl,
                                    position: "top-20 right-10"
                                });
                            }

                            return {
                                id: 100 + index, // Offset ID to avoid conflicts
                                name: p.name,
                                icon: p.icon || "/images/folder.png",
                                kind: "folder",
                                // Position for Finder (grid)
                                position: index % 2 === 0 ? `top-${10 + index * 5} left-10` : `top-${10 + index * 5} right-10`,
                                // Position for Home Desktop (top-right grid) using inline styles to avoid Tailwind JIT issues
                                style: (() => {
                                    const ITEMS_PER_COL = 5;
                                    const col = Math.floor(index / ITEMS_PER_COL);
                                    const row = index % ITEMS_PER_COL;
                                    // Using 'right' for macOS feel. 
                                    return {
                                        top: `${5 + row * 16}vh`,
                                        right: `${5 + col * 10}vw`
                                    };
                                })(),
                                children: children
                            };
                        });

                        // Merge with existing or replace? For now replacing 'work' children from DB might be cleaner if fully migrated
                        // But keeping hybrid for safety:
                        // state.locations.work.children = [...state.locations.work.children, ...mappedProjects]; 
                        // Replacing is better for SSOT
                        state.locations.work.children = mappedProjects;
                    }

                    state.isLoading = false;
                });
            } catch (error) {
                console.error("Failed to fetch content:", error);
                set((state) => { state.isLoading = false; state.error = error.message; });
            }
        },

        // --- Blog Posts ---
        addBlogPost: (post) => set((state) => {
            const newId = Math.max(...state.blogPosts.map(p => p.id), 0) + 1;
            state.blogPosts.unshift({
                id: newId,
                ...post,
                date: post.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
        }),

        // --- Socials ---
        addSocial: (social) => set((state) => {
            const newId = Math.max(...state.socials.map(s => s.id), 0) + 1;
            state.socials.push({
                id: newId,
                ...social
            });
        }),


        // --- Projects (Finder) ---
        addProject: (projectData) => set((state) => {
            // Assuming we are adding to the 'work' directory for now
            const workDir = state.locations.work;
            if (!workDir) return;

            // Create a basic folder structure for the new project
            const newId = Math.max(...(workDir.children?.map(c => c.id) || []), 0) + 1;

            const newProject = {
                id: newId,
                name: projectData.name,
                icon: "/images/folder.png",
                kind: "folder",
                position: "top-10 left-10", // Default position, ideally calculated
                windowPosition: "top-[10vh] left-[10vw]",
                children: [
                    {
                        id: 1,
                        name: `${projectData.name} Info.txt`,
                        icon: "/images/txt.png",
                        kind: "file",
                        fileType: "txt",
                        position: "top-5 left-10",
                        description: projectData.description ? [projectData.description] : ["No description provided."]
                    }
                ]
            };

            if (projectData.link) {
                newProject.children.push({
                    id: 2,
                    name: "Website",
                    icon: "/images/safari.png",
                    kind: "file",
                    fileType: "url",
                    href: projectData.link,
                    position: "top-10 right-20"
                });
            }

            if (projectData.githubLink) {
                newProject.children.push({
                    id: 5,
                    name: "Github",
                    icon: "/icons/github.svg",
                    kind: "file",
                    fileType: "url",
                    href: projectData.githubLink,
                    position: "top-10 left-40"
                });
            }

            if (projectData.imageUrl) {
                newProject.children.push({
                    id: 3,
                    name: "Preview.png",
                    icon: "/images/image.png", // Generic icon
                    kind: "file",
                    fileType: "img",
                    imageUrl: projectData.imageUrl,
                    position: "top-20 right-10"
                });
            }

            if (!workDir.children) workDir.children = [];
            workDir.children.push(newProject);
        }),

        // --- Gallery (Photos) ---
        addPhoto: (photoData) => set((state) => {
            if (!state.gallery) state.gallery = [];
            const newId = Math.max(...state.gallery.map(p => p.id), 0) + 1;
            state.gallery.push({
                id: newId,
                img: photoData.url, // In a real app we'd upload this
                title: photoData.title,
                date: new Date().toISOString().split('T')[0],
                tags: photoData.tags || [],
                isFavorite: false,
            });
        }),

        toggleFavorite: (id) => set((state) => {
            const photo = state.gallery?.find(p => p.id === id);
            if (photo) photo.isFavorite = !photo.isFavorite;
        }),

        addTag: (id, tag) => set((state) => {
            const photo = state.gallery?.find(p => p.id === id);
            if (photo && !photo.tags.includes(tag)) {
                photo.tags.push(tag);
            }
        }),

        removeTag: (id, tag) => set((state) => {
            const photo = state.gallery?.find(p => p.id === id);
            if (photo) {
                photo.tags = photo.tags.filter(t => t !== tag);
            }
        }),

        // --- Tech Stack ---
        updateTechStack: (category, items) => set((state) => {
            const stack = state.techStack.find(s => s.category === category);
            if (stack) {
                stack.items = items;
            } else {
                state.techStack.push({ category, items });
            }
        }),

        addItemToTechStack: (category, item) => set((state) => {
            const stack = state.techStack.find(s => s.category === category);
            if (stack && !stack.items.includes(item)) {
                stack.items.push(item);
            } else if (!stack) {
                state.techStack.push({ category, items: [item] });
            }
        }),

        // --- Reset ---
        resetData: () => set((state) => {
            state.locations = initialLocations;
            state.gallery = initialGallery;
            state.techStack = initialTechStack;
            state.blogPosts = initialBlogPosts;
            state.socials = initialSocials;
        })
    }))
);

export default useContentStore;
