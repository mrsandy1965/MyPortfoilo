import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useContentStore from "#store/content";
import { useState, useRef, useCallback } from "react";
import {
    Trash2, Save, LogIn, Loader2, Image as ImageIcon,
    FolderPlus, Globe, Code2, LayoutDashboard, ChevronRight,
    Upload, X, Star, ExternalLink, Pencil, Check, ArrowLeft, User
} from "lucide-react";
import clsx from "clsx";

// ─── Shared UI ───────────────────────────────────────────────────────────────

const InputField = ({ label, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
        <input className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" {...props} />
    </div>
);

const TextAreaField = ({ label, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
        <textarea className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" {...props} />
    </div>
);

const ImageUploader = ({ label = "Photo", onFile, preview, onClear }) => {
    const ref = useRef();
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>}
            <div onClick={() => ref.current?.click()} className="relative cursor-pointer border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center h-28 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition group overflow-hidden">
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-indigo-500 transition">
                        <Upload className="w-6 h-6" /><span className="text-xs">Click to upload or replace</span>
                    </div>
                )}
                <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); }} />
            </div>
        </div>
    );
};

const Toast = ({ msg, type = 'success', onClose }) => (
    <div className={clsx("flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-4 shadow-sm", type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200")}>
        <span>{msg}</span><button onClick={onClose}><X className="w-4 h-4" /></button>
    </div>
);

const Divider = () => <hr className="my-6 border-gray-100" />;

const SubmitBtn = ({ loading, label, color = "bg-indigo-600 hover:bg-indigo-700" }) => (
    <button type="submit" disabled={loading} className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60", color)}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {loading ? 'Saving…' : label}
    </button>
);

const EditBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Edit"><Pencil className="w-4 h-4" /></button>
);

const DeleteBtn = ({ onClick, loading }) => (
    <button type="button" onClick={onClick} disabled={loading} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50" title="Delete">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
);

const BackBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition"><ArrowLeft className="w-3.5 h-3.5" /> Back to list</button>
);

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-gray-600' },
    { id: 'about', label: 'About Me', icon: User, color: 'text-orange-600' },
    { id: 'projects', label: 'Projects', icon: FolderPlus, color: 'text-indigo-600' },
    { id: 'photos', label: 'Gallery', icon: ImageIcon, color: 'text-pink-600' },
    { id: 'blogs', label: 'Blogs', icon: Globe, color: 'text-blue-600' },
    { id: 'tech', label: 'Skills', icon: Code2, color: 'text-green-600' },
    { id: 'socials', label: 'Socials', icon: Globe, color: 'text-purple-600' },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

const Admin = () => {
    const {
        adminToken, adminError, adminLoading, verifyAdminToken,
        about, updateAbout,
        techStack, blogPosts, gallery, socials, locations,
        createProject, deleteProject, updateProject,
        createPhoto, deletePhoto, updatePhoto,
        createBlogPost, deleteBlogPost, updateBlogPost,
        addTechItem, removeTechItem,
        createSocial, deleteSocial, updateSocial,
        fetchContent,
    } = useContentStore();

    // ── All hooks unconditionally at top ──
    const [activeTab, setActiveTab] = useState('dashboard');
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState({});
    const [pwInput, setPwInput] = useState('');

    // Project
    const [projectForm, setProjectForm] = useState({ name: '', description: '', link: '', githubLink: '', techStack: '', imageUrl: '' });
    const [projectImg, setProjectImg] = useState(null);
    const [projectPreview, setProjectPreview] = useState('');
    const [editingProject, setEditingProject] = useState(null); // {dbId, ...}

    // Photo
    const [photoForm, setPhotoForm] = useState({ title: '', tags: '', isFavorite: false, img: '' });
    const [photoImg, setPhotoImg] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [editingPhoto, setEditingPhoto] = useState(null);

    // Blog
    const [blogForm, setBlogForm] = useState({ title: '', link: '', tags: '', image: '' });
    const [blogImg, setBlogImg] = useState(null);
    const [blogPreview, setBlogPreview] = useState('');
    const [editingBlog, setEditingBlog] = useState(null);

    // Tech
    const [techForm, setTechForm] = useState({ category: '', newCategory: '', item: '' });

    // Social
    const [socialForm, setSocialForm] = useState({ text: '', icon: '', bg: '#6366f1', link: '' });
    const [editingSocial, setEditingSocial] = useState(null);

    // About
    const [aboutForm, setAboutForm] = useState({ name: about?.name || '', subtitle: about?.subtitle || '', bio: about?.bio?.join('\n') || '' });
    const [newPhotoFiles, setNewPhotoFiles] = useState([]);
    const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState(about?.photos || []);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const withBusy = useCallback(async (key, fn) => {
        setBusy(b => ({ ...b, [key]: true }));
        try { await fn(); showToast('Saved successfully!'); }
        catch (e) { showToast(e.message || 'Something went wrong', 'error'); }
        finally { setBusy(b => ({ ...b, [key]: false })); }
    }, [showToast]);

    // ── Login ────────────────────────────────────────────────────────────────
    if (!adminToken) {
        return (
            <div className="flex flex-col h-full bg-gray-50">
                <div className="window-header">
                    <WindowControls target="admin" />
                    <h2 className="flex-1 text-center font-bold text-sm">System Admin</h2>
                    <div className="w-[50px] pointer-events-none" />
                </div>
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-sm">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3"><LogIn className="w-7 h-7 text-indigo-600" /></div>
                            <h2 className="text-xl font-bold text-gray-800">Admin Access</h2>
                            <p className="text-sm text-gray-500 mt-1">Enter your admin password to continue</p>
                        </div>
                        <form onSubmit={async (e) => { e.preventDefault(); await verifyAdminToken(pwInput); }} className="flex flex-col gap-3">
                            <input type="password" placeholder="Admin password" value={pwInput} onChange={e => setPwInput(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" autoFocus />
                            {adminError && <p className="text-xs text-red-500">{adminError}</p>}
                            <button type="submit" disabled={adminLoading || !pwInput} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                {adminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                                {adminLoading ? 'Verifying...' : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const projects = locations?.work?.children || [];

    // ── Project handlers ──────────────────────────────────────────────────────
    const startEditProject = (p) => {
        setEditingProject(p);
        setProjectForm({
            name: p.name,
            description: Array.isArray(p.children?.[0]?.description) ? p.children[0].description.join('\n') : '',
            link: p.children?.find(c => c.name === 'Website')?.href || '',
            githubLink: p.children?.find(c => c.name === 'Github')?.href || '',
            techStack: '',
            imageUrl: p.children?.find(c => c.fileType === 'img')?.imageUrl || '',
        });
        setProjectImg(null);
        setProjectPreview(p.children?.find(c => c.fileType === 'img')?.imageUrl || '');
    };

    const cancelEditProject = () => { setEditingProject(null); setProjectForm({ name: '', description: '', link: '', githubLink: '', techStack: '', imageUrl: '' }); setProjectImg(null); setProjectPreview(''); };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        if (editingProject) {
            await withBusy('project-save', async () => {
                await updateProject(editingProject.dbId, { ...projectForm, imageUrl: projectPreview }, projectImg);
                cancelEditProject();
            });
        } else {
            await withBusy('project-save', async () => {
                const techArr = projectForm.techStack.split(',').map(t => t.trim()).filter(Boolean);
                await createProject({ ...projectForm, techStack: techArr, description: projectForm.description ? [projectForm.description] : [] }, projectImg);
                setProjectForm({ name: '', description: '', link: '', githubLink: '', techStack: '', imageUrl: '' });
                setProjectImg(null); setProjectPreview('');
            });
        }
    };

    // ── Photo handlers ────────────────────────────────────────────────────────
    const startEditPhoto = (photo) => {
        setEditingPhoto(photo);
        setPhotoForm({ title: photo.title, tags: photo.tags?.join(', ') || '', isFavorite: photo.isFavorite, img: photo.img });
        setPhotoImg(null); setPhotoPreview(photo.img);
    };

    const cancelEditPhoto = () => { setEditingPhoto(null); setPhotoForm({ title: '', tags: '', isFavorite: false, img: '' }); setPhotoImg(null); setPhotoPreview(''); };

    const handlePhotoSubmit = async (e) => {
        e.preventDefault();
        if (editingPhoto) {
            await withBusy('photo-save', async () => {
                await updatePhoto(editingPhoto.id, { ...photoForm, img: photoPreview }, photoImg);
                cancelEditPhoto();
            });
        } else {
            if (!photoImg) { showToast('Please select an image', 'error'); return; }
            await withBusy('photo-save', async () => {
                await createPhoto({ title: photoForm.title, tags: photoForm.tags, isFavorite: photoForm.isFavorite }, photoImg);
                setPhotoForm({ title: '', tags: '', isFavorite: false, img: '' });
                setPhotoImg(null); setPhotoPreview('');
            });
        }
    };

    // ── Blog handlers ─────────────────────────────────────────────────────────
    const startEditBlog = (post) => {
        setEditingBlog(post);
        setBlogForm({ title: post.title, link: post.link, tags: post.tags?.join(', ') || '', image: post.image });
        setBlogImg(null); setBlogPreview(post.image);
    };

    const cancelEditBlog = () => { setEditingBlog(null); setBlogForm({ title: '', link: '', tags: '', image: '' }); setBlogImg(null); setBlogPreview(''); };

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        if (editingBlog) {
            await withBusy('blog-save', async () => {
                await updateBlogPost(editingBlog.id, { ...blogForm, image: blogPreview }, blogImg);
                cancelEditBlog();
            });
        } else {
            await withBusy('blog-save', async () => {
                const tagsArr = blogForm.tags.split(',').map(t => t.trim()).filter(Boolean);
                await createBlogPost({ title: blogForm.title, link: blogForm.link, tags: tagsArr }, blogImg);
                setBlogForm({ title: '', link: '', tags: '', image: '' });
                setBlogImg(null); setBlogPreview('');
            });
        }
    };

    // ── Social handlers ───────────────────────────────────────────────────────
    const startEditSocial = (s) => { setEditingSocial(s); setSocialForm({ text: s.text, icon: s.icon, bg: s.bg, link: s.link }); };
    const cancelEditSocial = () => { setEditingSocial(null); setSocialForm({ text: '', icon: '', bg: '#6366f1', link: '' }); };

    const handleSocialSubmit = async (e) => {
        e.preventDefault();
        if (editingSocial) {
            await withBusy('social-save', async () => { await updateSocial(editingSocial.id, socialForm); cancelEditSocial(); });
        } else {
            await withBusy('social-save', async () => { await createSocial(socialForm); setSocialForm({ text: '', icon: '', bg: '#6366f1', link: '' }); });
        }
    };

    const handleAddTech = async (e) => {
        e.preventDefault();
        const cat = techForm.category === '__new__' ? techForm.newCategory : techForm.category;
        if (!cat || !techForm.item) return;
        await withBusy('tech-add', async () => { await addTechItem(cat, techForm.item); setTechForm(t => ({ ...t, item: '', newCategory: '' })); });
    };

    // ── About panel ───────────────────────────────────────────────────────────
    const handleAboutSubmit = async (e) => {
        e.preventDefault();
        await withBusy('about-save', async () => {
            await updateAbout(
                { name: aboutForm.name, subtitle: aboutForm.subtitle, bio: aboutForm.bio, existingPhotos },
                newPhotoFiles
            );
            setNewPhotoFiles([]); setNewPhotoPreviews([]);
        });
    };

    const handleNewPhotos = (files) => {
        const fileArr = Array.from(files);
        setNewPhotoFiles(f => [...f, ...fileArr]);
        setNewPhotoPreviews(p => [...p, ...fileArr.map(f => URL.createObjectURL(f))]);
    };

    const removeNewPhoto = (idx) => {
        setNewPhotoFiles(f => f.filter((_, i) => i !== idx));
        setNewPhotoPreviews(p => p.filter((_, i) => i !== idx));
    };

    const AboutPanel = (
        <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-orange-600"><User className="w-5 h-5" /> Edit About Me</h3>
            <form onSubmit={handleAboutSubmit} className="space-y-4 bg-white border border-gray-100 rounded-2xl p-5">
                <InputField label="Your Name *" required value={aboutForm.name} onChange={e => setAboutForm(a => ({ ...a, name: e.target.value }))} placeholder="e.g. Sandesh" />
                <InputField label="Subtitle" value={aboutForm.subtitle} onChange={e => setAboutForm(a => ({ ...a, subtitle: e.target.value }))} placeholder="e.g. Meet the Developer Behind the Code" />
                <TextAreaField label="Bio (one paragraph per line)" rows={6} value={aboutForm.bio} onChange={e => setAboutForm(a => ({ ...a, bio: e.target.value }))} placeholder={`Hey there! 👋 I'm Sandesh...\nI love building cool stuff!`} />

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profile Photos</label>

                    {/* Existing photos */}
                    {existingPhotos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1">
                            {existingPhotos.map((url, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 group">
                                    <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setExistingPhotos(p => p.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New photo previews */}
                    {newPhotoPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1">
                            {newPhotoPreviews.map((url, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-indigo-200 group">
                                    <img src={url} alt={`New ${i+1}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewPhoto(i)} className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="absolute bottom-0 left-0 right-0 text-[9px] text-white bg-indigo-500/80 text-center">New</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload button */}
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition w-fit text-sm text-gray-500 hover:text-orange-600">
                        <Upload className="w-4 h-4" /> Add photo(s)
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleNewPhotos(e.target.files)} />
                    </label>
                    <p className="text-xs text-gray-400">These appear in your About Me window on the desktop.</p>
                </div>

                <SubmitBtn loading={busy['about-save']} label="Save About Me" color="bg-orange-600 hover:bg-orange-700" />
            </form>
        </div>
    );

    // ── Tab Panels ────────────────────────────────────────────────────────────

    const Dashboard = (
        <div className="space-y-6">
            <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-5 rounded-2xl text-white">
                <h3 className="text-lg font-bold mb-1">Welcome back, Admin 👋</h3>
                <p className="text-indigo-100 text-sm">Your portfolio CMS is connected and live.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { label: 'Projects', count: projects.length, tab: 'projects', bg: 'bg-indigo-50', tc: 'text-indigo-600', border: 'border-indigo-100', Icon: FolderPlus },
                    { label: 'Photos', count: gallery.length, tab: 'photos', bg: 'bg-pink-50', tc: 'text-pink-600', border: 'border-pink-100', Icon: ImageIcon },
                    { label: 'Blog Posts', count: blogPosts.length, tab: 'blogs', bg: 'bg-blue-50', tc: 'text-blue-600', border: 'border-blue-100', Icon: Globe },
                    { label: 'Skills', count: techStack.reduce((acc, t) => acc + t.items.length, 0), tab: 'tech', bg: 'bg-green-50', tc: 'text-green-600', border: 'border-green-100', Icon: Code2 },
                    { label: 'Socials', count: socials.length, tab: 'socials', bg: 'bg-purple-50', tc: 'text-purple-600', border: 'border-purple-100', Icon: Globe },
                ].map(({ label, count, tab, bg, tc, border, Icon }) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={clsx("p-4 bg-white border rounded-xl hover:shadow-md transition-all text-left group flex items-start gap-3", border)}>
                        <div className={clsx("p-2 rounded-lg", bg, tc)}><Icon className="w-5 h-5" /></div>
                        <div><p className="text-2xl font-bold text-gray-800">{count}</p><p className="text-xs text-gray-500">{label}</p></div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto mt-1 transition" />
                    </button>
                ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                <strong>💡 Tip:</strong> Click the <Pencil className="inline w-3.5 h-3.5 mx-0.5" /> pencil icon on any item to edit it.
            </div>
        </div>
    );

    // ── Projects Panel ────────────────────────────────────────────────────────
    const Projects = (
        <div className="space-y-6">
            {editingProject && <BackBtn onClick={cancelEditProject} />}
            <h3 className="flex items-center gap-2 text-base font-bold text-indigo-600">
                <FolderPlus className="w-5 h-5" />
                {editingProject ? `Editing: ${editingProject.name}` : 'Add Project'}
            </h3>
            <form onSubmit={handleProjectSubmit} className="space-y-3 bg-white border border-gray-100 rounded-2xl p-5">
                <InputField label="Project Name *" required value={projectForm.name} onChange={e => setProjectForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. My Portfolio" />
                <TextAreaField label="Description" rows={3} value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} placeholder="What does this project do?" />
                <div className="grid grid-cols-2 gap-3">
                    <InputField label="Live URL" type="url" value={projectForm.link} onChange={e => setProjectForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." />
                    <InputField label="GitHub URL" type="url" value={projectForm.githubLink} onChange={e => setProjectForm(p => ({ ...p, githubLink: e.target.value }))} placeholder="https://github.com/..." />
                </div>
                {!editingProject && <InputField label="Tech Stack (comma-separated)" value={projectForm.techStack} onChange={e => setProjectForm(p => ({ ...p, techStack: e.target.value }))} placeholder="React, Node.js, PostgreSQL" />}
                <ImageUploader label="Project Preview Image" onFile={f => { setProjectImg(f); setProjectPreview(URL.createObjectURL(f)); }} preview={projectPreview} onClear={() => { setProjectImg(null); setProjectPreview(''); }} />
                <div className="flex gap-2">
                    <SubmitBtn loading={busy['project-save']} label={editingProject ? 'Save Changes' : 'Add Project'} />
                    {editingProject && <button type="button" onClick={cancelEditProject} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>}
                </div>
            </form>

            {!editingProject && (
                <>
                    <Divider />
                    <h4 className="font-semibold text-gray-600 text-sm">Existing Projects ({projects.length})</h4>
                    <div className="space-y-2">
                        {projects.length === 0 && <p className="text-sm text-gray-400">No projects yet.</p>}
                        {projects.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0"><FolderPlus className="w-4 h-4 text-indigo-500" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.children?.length || 0} files</p>
                                </div>
                                <EditBtn onClick={() => startEditProject(p)} />
                                <DeleteBtn loading={busy[`del-proj-${p.dbId}`]} onClick={() => withBusy(`del-proj-${p.dbId}`, () => deleteProject(p.dbId))} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    // ── Photos Panel ──────────────────────────────────────────────────────────
    const Photos = (
        <div className="space-y-6">
            {editingPhoto && <BackBtn onClick={cancelEditPhoto} />}
            <h3 className="flex items-center gap-2 text-base font-bold text-pink-600">
                <ImageIcon className="w-5 h-5" />
                {editingPhoto ? `Editing: ${editingPhoto.title}` : 'Add Photo'}
            </h3>
            <form onSubmit={handlePhotoSubmit} className="space-y-3 bg-white border border-gray-100 rounded-2xl p-5">
                <InputField label="Title *" required value={photoForm.title} onChange={e => setPhotoForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Team Hackathon" />
                <InputField label="Tags (comma-separated)" value={photoForm.tags} onChange={e => setPhotoForm(p => ({ ...p, tags: e.target.value }))} placeholder="memories, places, people" />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={photoForm.isFavorite} onChange={e => setPhotoForm(p => ({ ...p, isFavorite: e.target.checked }))} className="rounded" />
                    <Star className="w-4 h-4 text-amber-400" /> Mark as Favorite
                </label>
                <ImageUploader label={editingPhoto ? 'Replace Photo (optional)' : 'Photo *'} onFile={f => { setPhotoImg(f); setPhotoPreview(URL.createObjectURL(f)); }} preview={photoPreview} onClear={() => { setPhotoImg(null); setPhotoPreview(editingPhoto?.img || ''); }} />
                <div className="flex gap-2">
                    <SubmitBtn loading={busy['photo-save']} label={editingPhoto ? 'Save Changes' : 'Upload Photo'} color="bg-pink-600 hover:bg-pink-700" />
                    {editingPhoto && <button type="button" onClick={cancelEditPhoto} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>}
                </div>
            </form>

            {!editingPhoto && (
                <>
                    <Divider />
                    <h4 className="font-semibold text-gray-600 text-sm">Gallery ({gallery.length} photos)</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {gallery.length === 0 && <p className="col-span-3 text-sm text-gray-400">No photos yet.</p>}
                        {gallery.map(photo => (
                            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
                                <img src={photo.img} alt={photo.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-2">
                                    <p className="text-white text-xs font-semibold text-center truncate w-full">{photo.title}</p>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => startEditPhoto(photo)} className="p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => withBusy(`del-photo-${photo.id}`, () => deletePhoto(photo.id))} disabled={busy[`del-photo-${photo.id}`]} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-60">
                                            {busy[`del-photo-${photo.id}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                                {photo.isFavorite && <Star className="absolute top-1 right-1 w-4 h-4 text-amber-400 fill-amber-400" />}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    // ── Blogs Panel ───────────────────────────────────────────────────────────
    const Blogs = (
        <div className="space-y-6">
            {editingBlog && <BackBtn onClick={cancelEditBlog} />}
            <h3 className="flex items-center gap-2 text-base font-bold text-blue-600">
                <Globe className="w-5 h-5" />
                {editingBlog ? `Editing: ${editingBlog.title}` : 'Add Blog Post'}
            </h3>
            <form onSubmit={handleBlogSubmit} className="space-y-3 bg-white border border-gray-100 rounded-2xl p-5">
                <InputField label="Title *" required value={blogForm.title} onChange={e => setBlogForm(b => ({ ...b, title: e.target.value }))} placeholder="e.g. Why I love TypeScript" />
                <InputField label="Article URL *" required type="url" value={blogForm.link} onChange={e => setBlogForm(b => ({ ...b, link: e.target.value }))} placeholder="https://..." />
                <InputField label="Tags (comma-separated)" value={blogForm.tags} onChange={e => setBlogForm(b => ({ ...b, tags: e.target.value }))} placeholder="Frontend, Dev Tools" />
                <ImageUploader label={editingBlog ? 'Replace Cover Image (optional)' : 'Cover Image'} onFile={f => { setBlogImg(f); setBlogPreview(URL.createObjectURL(f)); }} preview={blogPreview} onClear={() => { setBlogImg(null); setBlogPreview(editingBlog?.image || ''); }} />
                <div className="flex gap-2">
                    <SubmitBtn loading={busy['blog-save']} label={editingBlog ? 'Save Changes' : 'Add Blog Post'} color="bg-blue-600 hover:bg-blue-700" />
                    {editingBlog && <button type="button" onClick={cancelEditBlog} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>}
                </div>
            </form>

            {!editingBlog && (
                <>
                    <Divider />
                    <h4 className="font-semibold text-gray-600 text-sm">Blog Posts ({blogPosts.length})</h4>
                    <div className="space-y-2">
                        {blogPosts.length === 0 && <p className="text-sm text-gray-400">No blog posts yet.</p>}
                        {blogPosts.map(post => (
                            <div key={post.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
                                {post.image ? <img src={post.image} alt={post.title} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100" /> : <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><Globe className="w-5 h-5 text-blue-500" /></div>}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{post.title}</p>
                                    <p className="text-xs text-gray-400">{post.date} · {post.tags?.join(', ')}</p>
                                </div>
                                <a href={post.link} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-500 transition shrink-0"><ExternalLink className="w-4 h-4" /></a>
                                <EditBtn onClick={() => startEditBlog(post)} />
                                <DeleteBtn loading={busy[`del-blog-${post.id}`]} onClick={() => withBusy(`del-blog-${post.id}`, () => deleteBlogPost(post.id))} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    // ── Tech Stack Panel ──────────────────────────────────────────────────────
    const TechStackPanel = (
        <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-green-600"><Code2 className="w-5 h-5" /> Add Skill</h3>
            <form onSubmit={handleAddTech} className="space-y-3 bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
                    <select required value={techForm.category} onChange={e => setTechForm(t => ({ ...t, category: e.target.value }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                        <option value="">Select category…</option>
                        {techStack.map(t => <option key={t.category} value={t.category}>{t.category}</option>)}
                        <option value="__new__">+ Create new category…</option>
                    </select>
                </div>
                {techForm.category === '__new__' && <InputField label="New Category Name *" required value={techForm.newCategory} onChange={e => setTechForm(t => ({ ...t, newCategory: e.target.value }))} placeholder="e.g. Cloud" />}
                <InputField label="Skill Name *" required value={techForm.item} onChange={e => setTechForm(t => ({ ...t, item: e.target.value }))} placeholder="e.g. AWS, Docker" />
                <SubmitBtn loading={busy['tech-add']} label="Add Skill" color="bg-green-600 hover:bg-green-700" />
            </form>
            <Divider />
            <h4 className="font-semibold text-gray-600 text-sm">Current Skills</h4>
            <div className="space-y-3">
                {techStack.length === 0 && <p className="text-sm text-gray-400">No skills yet.</p>}
                {techStack.map(ts => (
                    <div key={ts.category} className="bg-white border border-gray-100 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{ts.category}</p>
                        <div className="flex flex-wrap gap-2">
                            {ts.items.map(item => (
                                <span key={item} className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                                    {item}
                                    <button type="button" onClick={() => withBusy(`del-tech-${ts.category}-${item}`, () => removeTechItem(ts.category, item))} disabled={busy[`del-tech-${ts.category}-${item}`]} className="hover:text-red-500 transition mt-0.5 disabled:opacity-50">
                                        {busy[`del-tech-${ts.category}-${item}`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ── Socials Panel ─────────────────────────────────────────────────────────
    const Socials = (
        <div className="space-y-6">
            {editingSocial && <BackBtn onClick={cancelEditSocial} />}
            <h3 className="flex items-center gap-2 text-base font-bold text-purple-600">
                <Globe className="w-5 h-5" />
                {editingSocial ? `Editing: ${editingSocial.text}` : 'Add Social Link'}
            </h3>
            <form onSubmit={handleSocialSubmit} className="space-y-3 bg-white border border-gray-100 rounded-2xl p-5">
                <InputField label="Platform *" required value={socialForm.text} onChange={e => setSocialForm(s => ({ ...s, text: e.target.value }))} placeholder="e.g. GitHub, LinkedIn" />
                <InputField label="Profile URL *" required type="url" value={socialForm.link} onChange={e => setSocialForm(s => ({ ...s, link: e.target.value }))} placeholder="https://..." />
                <InputField label="Icon path or URL" value={socialForm.icon} onChange={e => setSocialForm(s => ({ ...s, icon: e.target.value }))} placeholder="/icons/github.svg or https://..." />
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand Color</label>
                    <div className="flex gap-2">
                        <input type="color" value={socialForm.bg} onChange={e => setSocialForm(s => ({ ...s, bg: e.target.value }))} className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer" />
                        <input type="text" value={socialForm.bg} onChange={e => setSocialForm(s => ({ ...s, bg: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <SubmitBtn loading={busy['social-save']} label={editingSocial ? 'Save Changes' : 'Add Social'} color="bg-purple-600 hover:bg-purple-700" />
                    {editingSocial && <button type="button" onClick={cancelEditSocial} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition">Cancel</button>}
                </div>
            </form>

            {!editingSocial && (
                <>
                    <Divider />
                    <h4 className="font-semibold text-gray-600 text-sm">Social Links ({socials.length})</h4>
                    <div className="space-y-2">
                        {socials.length === 0 && <p className="text-sm text-gray-400">No social links yet.</p>}
                        {socials.map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                                    {s.icon ? <img src={s.icon} alt={s.text} className="w-5 h-5" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <Globe className="w-5 h-5 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{s.text}</p>
                                    <p className="text-xs text-gray-400 truncate">{s.link}</p>
                                </div>
                                <a href={s.link} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-purple-500 transition shrink-0"><ExternalLink className="w-4 h-4" /></a>
                                <EditBtn onClick={() => startEditSocial(s)} />
                                <DeleteBtn loading={busy[`del-social-${s.id}`]} onClick={() => withBusy(`del-social-${s.id}`, () => deleteSocial(s.id))} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    const tabContent = {
        dashboard: Dashboard,
        about: AboutPanel,
        projects: Projects,
        photos: Photos,
        blogs: Blogs,
        tech: TechStackPanel,
        socials: Socials,
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="window-header">
                <WindowControls target="admin" />
                <h2 className="flex-1 text-center font-bold text-sm">System Admin</h2>
                <div className="w-[50px] pointer-events-none" />
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-44 bg-white border-r border-gray-100 p-3 flex flex-col gap-1 shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">Content</p>
                    {TABS.map(({ id, label, icon: TabIcon, color }) => (
                        <button key={id} onClick={() => { setActiveTab(id); setEditingProject(null); setEditingPhoto(null); setEditingBlog(null); setEditingSocial(null); }}
                            className={clsx("flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm font-medium transition-all", activeTab === id ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700")}>
                            <TabIcon className={clsx("w-4 h-4 shrink-0", activeTab === id ? color : "text-gray-400")} />
                            {label}
                            {/* Show dot if editing */}
                            {(id === 'projects' && editingProject) || (id === 'photos' && editingPhoto) || (id === 'blogs' && editingBlog) || (id === 'socials' && editingSocial)
                                ? <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400" /> : null}
                        </button>
                    ))}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button onClick={() => fetchContent()} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition">
                            <Loader2 className="w-3 h-3" /> Refresh Data
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
                    {tabContent[activeTab]}
                </div>
            </div>
        </div>
    );
};

// Unused imports suppressor — Check/ArrowLeft used above; keep to satisfy linter
void Check;

const AdminWindow = WindowWrapper(Admin, "admin");
export default AdminWindow;
