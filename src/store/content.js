import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    locations as initialLocations,
    gallery as initialGallery,
    techStack as initialTechStack,
    blogPosts as initialBlogPosts,
    socials as initialSocials
} from '#constants';

const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Sanitize rawApi in case Vercel env ends with /api or /
const API = rawApi.replace(/\/api\/?$/, '').replace(/\/+$/, '');


const mapProjectsToLocations = (projects) =>
    projects.map((p, index) => {
        const children = [];
        if (p.description && p.description.length > 0) {
            children.push({ id: 1, name: `${p.name} Info.txt`, icon: '/images/txt.png', kind: 'file', fileType: 'txt', position: 'top-5 left-10', description: p.description });
        }
        if (p.link) {
            children.push({ id: 2, name: 'Website', icon: '/images/safari.png', kind: 'file', fileType: 'url', href: p.link, position: 'top-10 right-20' });
        }
        if (p.githubLink) {
            children.push({ id: 5, name: 'Github', icon: '/icons/github.svg', kind: 'file', fileType: 'url', href: p.githubLink, position: 'top-10 left-40' });
        }
        if (p.imageUrl) {
            children.push({ id: 3, name: 'Preview.png', icon: '/images/image.png', kind: 'file', fileType: 'img', imageUrl: p.imageUrl, position: 'top-20 right-10' });
        }
        const ITEMS_PER_COL = 5;
        const col = Math.floor(index / ITEMS_PER_COL);
        const row = index % ITEMS_PER_COL;
        return {
            id: 100 + index,
            dbId: p.id,
            name: p.name,
            icon: p.icon || '/images/folder.png',
            kind: 'folder',
            position: index % 2 === 0 ? `top-${10 + index * 5} left-10` : `top-${10 + index * 5} right-10`,
            style: { top: `${5 + row * 16}vh`, right: `${5 + col * 10}vw` },
            children,
        };
    });

const useContentStore = create(
    immer((set, get) => ({
        // Data
        locations: initialLocations,
        gallery: initialGallery,
        techStack: initialTechStack,
        blogPosts: initialBlogPosts,
        socials: initialSocials,

        isLoading: false,
        error: null,

        // Admin
        adminToken: '',
        adminError: '',
        adminLoading: false,

        // About Me
        about: { name: 'Sandesh', subtitle: 'Meet the Developer Behind the Code', bio: [], photos: [] },

        setAdminToken: (token) => set((state) => { state.adminToken = token; state.adminError = ''; }),

        verifyAdminToken: async (token) => {
            set((state) => { state.adminLoading = true; state.adminError = ''; });
            try {
                const res = await fetch(`${API}/api/admin/verify`, {
                    method: 'POST',
                    headers: { 'X-Admin-Token': token },
                });
                if (!res.ok) throw new Error('Invalid password');
                set((state) => { state.adminToken = token; state.adminLoading = false; });
                return true;
            } catch (err) {
                set((state) => { state.adminError = err.message; state.adminLoading = false; });
                return false;
            }
        },

        // ---- Fetch (public) ----
        fetchContent: async () => {
            set((state) => { state.isLoading = true; state.error = null; });
            try {
                const [techRes, blogRes, galleryRes, socialRes, projectRes, aboutRes] = await Promise.all([
                    fetch(`${API}/api/tech-stack`),
                    fetch(`${API}/api/blog-posts`),
                    fetch(`${API}/api/gallery`),
                    fetch(`${API}/api/socials`),
                    fetch(`${API}/api/projects`),
                    fetch(`${API}/api/about`),
                ]);

                const techStack = await techRes.json();
                const blogPosts = await blogRes.json();
                const gallery = await galleryRes.json();
                const socials = await socialRes.json();
                const projects = await projectRes.json();
                const about = aboutRes.ok ? await aboutRes.json() : null;

                set((state) => {
                    state.techStack = Array.isArray(techStack) ? techStack : state.techStack;
                    state.blogPosts = Array.isArray(blogPosts) ? blogPosts : state.blogPosts;
                    state.gallery = Array.isArray(gallery) ? gallery : state.gallery;
                    state.socials = Array.isArray(socials) ? socials : state.socials;
                    if (about && about.id) {
                        state.about = about;
                        if (state.locations.about && state.locations.about.children) {
                            state.locations.about.children = state.locations.about.children.map((child) => {
                                const newChild = { ...child };
                                if (newChild.name === "me.png") {
                                    if (about.photos?.[0]) {
                                        newChild.imageUrl = about.photos[0];
                                        newChild.icon = about.photos[0]; // Show as Finder thumbnail
                                    }
                                } else if (newChild.name === "casual-me.png") {
                                    if (about.photos?.[1]) {
                                        newChild.imageUrl = about.photos[1];
                                        newChild.icon = about.photos[1];
                                    }
                                } else if (newChild.name === "conference-me.png") {
                                    if (about.photos?.[2]) {
                                        newChild.imageUrl = about.photos[2];
                                        newChild.icon = about.photos[2];
                                    }
                                } else if (newChild.name === "about-me.txt") {
                                    newChild.subtitle = about.subtitle || "Meet the Developer Behind the Code";
                                    newChild.description = about.bio || [];
                                    if (about.photos?.[0]) newChild.image = about.photos[0];
                                }
                                return newChild;
                            });
                        }
                    }
                    if (state.locations.work && Array.isArray(projects)) {
                        state.locations.work.children = mapProjectsToLocations(projects);
                    }

                    state.isLoading = false;
                });
            } catch (error) {
                console.error('Failed to fetch content:', error);
                set((state) => { state.isLoading = false; state.error = error.message; });
            }
        },

        updateAbout: async (aboutData, newPhotos) => {
            const token = get().adminToken;
            // Upload any new photos to Cloudinary first
            const uploadedPhotos = await Promise.all(
                (newPhotos || []).map(f => get().uploadImage(f))
            );
            const allPhotos = [
                ...(aboutData.existingPhotos || []),
                ...uploadedPhotos,
            ];
            const res = await fetch(`${API}/api/about`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ ...aboutData, photos: allPhotos }),
            });
            if (!res.ok) throw new Error('Failed to update about');
            const updated = await res.json();
            set((state) => { state.about = updated; });
            return updated;
        },

        // ---- Upload Helper ----
        uploadImage: async (file) => {
            const token = get().adminToken;
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${API}/api/upload`, {
                method: 'POST',
                headers: { 'X-Admin-Token': token },
                body: formData,
            });
            if (!res.ok) throw new Error('Image upload failed');
            const data = await res.json();
            return data.url;
        },

        // ---- Projects ----
        createProject: async (projectData, imageFile) => {
            const token = get().adminToken;
            let imageUrl = projectData.imageUrl || '';
            if (imageFile) imageUrl = await get().uploadImage(imageFile);

            const res = await fetch(`${API}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ ...projectData, imageUrl }),
            });
            if (!res.ok) throw new Error('Failed to create project');
            await get().fetchContent();
        },

        deleteProject: async (id) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Token': token },
            });
            if (!res.ok) throw new Error('Failed to delete project');
            await get().fetchContent();
        },

        updateProject: async (id, projectData, imageFile) => {
            const token = get().adminToken;
            let imageUrl = projectData.imageUrl || '';
            if (imageFile) imageUrl = await get().uploadImage(imageFile);
            const techArr = Array.isArray(projectData.techStack) ? projectData.techStack
                : (projectData.techStack || '').split(',').map(t => t.trim()).filter(Boolean);
            const res = await fetch(`${API}/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({
                    ...projectData,
                    techStack: techArr,
                    description: Array.isArray(projectData.description) ? projectData.description
                        : projectData.description ? [projectData.description] : [],
                    imageUrl,
                }),
            });
            if (!res.ok) throw new Error('Failed to update project');
            await get().fetchContent();
        },

        // ---- Photos ----
        createPhoto: async (photoData, imageFile) => {
            const token = get().adminToken;
            let img = photoData.img || '';
            if (imageFile) img = await get().uploadImage(imageFile);

            const res = await fetch(`${API}/api/gallery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ ...photoData, img }),
            });
            if (!res.ok) throw new Error('Failed to create photo');
            await get().fetchContent();
        },

        deletePhoto: async (id) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/gallery/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Token': token },
            });
            if (!res.ok) throw new Error('Failed to delete photo');
            await get().fetchContent();
        },

        updatePhoto: async (id, photoData, imageFile) => {
            const token = get().adminToken;
            let img = photoData.img || '';
            if (imageFile) img = await get().uploadImage(imageFile);
            const res = await fetch(`${API}/api/gallery/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ ...photoData, img }),
            });
            if (!res.ok) throw new Error('Failed to update photo');
            await get().fetchContent();
        },

        toggleFavorite: (id) => set((state) => {
            const photo = state.gallery?.find(p => p.id === id);
            if (photo) photo.isFavorite = !photo.isFavorite;
        }),

        addTag: (id, tag) => set((state) => {
            const photo = state.gallery?.find(p => p.id === id);
            if (photo && !photo.tags.includes(tag)) photo.tags.push(tag);
        }),

        removeTag: (id, tag) => set((state) => {
            const photo = state.gallery?.find(p => p.id === id);
            if (photo) photo.tags = photo.tags.filter(t => t !== tag);
        }),

        // ---- Blog Posts ----
        createBlogPost: async (postData, imageFile) => {
            const token = get().adminToken;
            let image = postData.image || '';
            if (imageFile) image = await get().uploadImage(imageFile);

            const res = await fetch(`${API}/api/blog-posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ ...postData, image }),
            });
            if (!res.ok) throw new Error('Failed to create blog post');
            await get().fetchContent();
        },

        deleteBlogPost: async (id) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/blog-posts/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Token': token },
            });
            if (!res.ok) throw new Error('Failed to delete blog post');
            await get().fetchContent();
        },

        updateBlogPost: async (id, postData, imageFile) => {
            const token = get().adminToken;
            let image = postData.image || '';
            if (imageFile) image = await get().uploadImage(imageFile);
            const tagsArr = Array.isArray(postData.tags) ? postData.tags
                : (postData.tags || '').split(',').map(t => t.trim()).filter(Boolean);
            const res = await fetch(`${API}/api/blog-posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ ...postData, tags: tagsArr, image }),
            });
            if (!res.ok) throw new Error('Failed to update blog post');
            await get().fetchContent();
        },

        // ---- Tech Stack ----
        addTechItem: async (category, item) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/tech-stack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ category, item }),
            });
            if (!res.ok) throw new Error('Failed to add tech item');
            await get().fetchContent();
        },

        removeTechItem: async (category, item) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/tech-stack/item`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify({ category, item }),
            });
            if (!res.ok) throw new Error('Failed to remove tech item');
            await get().fetchContent();
        },

        // ---- Socials ----
        createSocial: async (socialData) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/socials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify(socialData),
            });
            if (!res.ok) throw new Error('Failed to create social');
            await get().fetchContent();
        },

        deleteSocial: async (id) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/socials/${id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Token': token },
            });
            if (!res.ok) throw new Error('Failed to delete social');
            await get().fetchContent();
        },

        updateSocial: async (id, socialData) => {
            const token = get().adminToken;
            const res = await fetch(`${API}/api/socials/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
                body: JSON.stringify(socialData),
            });
            if (!res.ok) throw new Error('Failed to update social');
            await get().fetchContent();
        },

        // ---- Reset (local only) ----
        resetData: () => set((state) => {
            state.locations = initialLocations;
            state.gallery = initialGallery;
            state.techStack = initialTechStack;
            state.blogPosts = initialBlogPosts;
            state.socials = initialSocials;
        }),

        // Keep old local actions for backward compat
        addItemToTechStack: (category, item) => set((state) => {
            const stack = state.techStack.find(s => s.category === category);
            if (stack && !stack.items.includes(item)) stack.items.push(item);
            else if (!stack) state.techStack.push({ category, items: [item] });
        }),
        updateTechStack: (category, items) => set((state) => {
            const stack = state.techStack.find(s => s.category === category);
            if (stack) stack.items = items;
            else state.techStack.push({ category, items });
        }),
    }))
);

export default useContentStore;
