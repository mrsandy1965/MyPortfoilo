import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
    locations as initialLocations,
    gallery as initialGallery,
    techStack as initialTechStack,
    blogPosts as initialBlogPosts,
    socials as initialSocials
} from '#constants';

const useContentStore = create(
    persist(
        immer((set) => ({
            // Initial Data
            locations: initialLocations,
            gallery: initialGallery,
            techStack: initialTechStack,
            blogPosts: initialBlogPosts,
            socials: initialSocials, // Add socials to state

            // Actions

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
        })),
        {
            name: 'content-storage', // name of the item in the storage (must be unique)
        }
    )
);

export default useContentStore;
