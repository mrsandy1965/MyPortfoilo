import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useContentStore from "#store/content";
import { useState } from "react";
import { Plus, Image as ImageIcon, FolderPlus, Save, RotateCcw, X } from "lucide-react";
import clsx from "clsx";

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { 
        addProject, addPhoto, addBlogPost, addSocial, addItemToTechStack, 
        resetData, techStack 
    } = useContentStore();

    // Form States
    const [projectForm, setProjectForm] = useState({ name: '', description: '', link: '', imageUrl: '' });
    const [photoForm, setPhotoForm] = useState({ title: '', url: '', tags: '' });
    const [blogForm, setBlogForm] = useState({ title: '', image: '', link: '' });
    const [socialForm, setSocialForm] = useState({ text: '', icon: '', bg: '#000000', link: '' });
    const [techForm, setTechForm] = useState({ category: '', item: '' });
    const [successMsg, setSuccessMsg] = useState('');

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleAddProject = (e) => {
        e.preventDefault();
        addProject(projectForm);
        showSuccess(`Project "${projectForm.name}" added successfully!`);
        setProjectForm({ name: '', description: '', link: '', imageUrl: '' });
    };

    const handleAddPhoto = (e) => {
        e.preventDefault();
        const tagsArray = photoForm.tags.split(',').map(t => t.trim()).filter(Boolean);
        addPhoto({ ...photoForm, tags: tagsArray });
        showSuccess(`Photo "${photoForm.title}" added successfully!`);
        setPhotoForm({ title: '', url: '', tags: '' });
    };

    const handleAddBlog = (e) => {
        e.preventDefault();
        addBlogPost(blogForm);
        showSuccess(`Blog "${blogForm.title}" added successfully!`);
        setBlogForm({ title: '', image: '', link: '' });
    };

    const handleAddSocial = (e) => {
         e.preventDefault();
         addSocial(socialForm);
        showSuccess(`Social "${socialForm.text}" added successfully!`);
        setSocialForm({ text: '', icon: '', bg: '#000000', link: '' });
    };

    const handleAddTech = (e) => {
        e.preventDefault();
        addItemToTechStack(techForm.category, techForm.item);
        showSuccess(`"${techForm.item}" added to ${techForm.category}!`);
        setTechForm(prev => ({ ...prev, item: '' })); // Keep category selected
    }


    const handleReset = () => {
        if(confirm("Are you sure you want to reset all data to defaults? This cannot be undone.")) {
            resetData();
            showSuccess("System reset to factory defaults.");
        }
    }

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Welcome, Admin</h3>
                <p className="text-blue-600">Manage all your portfolio content from one place. Changes are auto-saved.</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('projects')} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left group">
                    <FolderPlus className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform"/>
                    <h4 className="font-bold text-gray-700">Projects</h4>
                    <p className="text-xs text-gray-500">Finder Content</p>
                </button>
                 <button onClick={() => setActiveTab('photos')} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left group">
                    <ImageIcon className="w-8 h-8 text-pink-500 mb-2 group-hover:scale-110 transition-transform"/>
                    <h4 className="font-bold text-gray-700">Gallery</h4>
                    <p className="text-xs text-gray-500">Photo Albums</p>
                </button>
                 <button onClick={() => setActiveTab('blogs')} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left group">
                    <span className="text-3xl mb-2 block">📰</span>
                    <h4 className="font-bold text-gray-700">Blogs</h4>
                    <p className="text-xs text-gray-500">Safari Posts</p>
                </button>
                 <button onClick={() => setActiveTab('tech')} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left group">
                    <span className="text-3xl mb-2 block">💻</span>
                    <h4 className="font-bold text-gray-700">Skills</h4>
                    <p className="text-xs text-gray-500">Tech Stack</p>
                </button>
                 <button onClick={() => setActiveTab('socials')} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left group">
                    <span className="text-3xl mb-2 block">🌐</span>
                    <h4 className="font-bold text-gray-700">Socials</h4>
                    <p className="text-xs text-gray-500">Contact Links</p>
                </button>
            </div>

            <div className="pt-8 border-t border-gray-200">
                 <button onClick={handleReset} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                    <RotateCcw className="w-4 h-4"/>
                    Reset System Data
                 </button>
            </div>
        </div>
    );

    const renderProjectForm = () => (
        <form onSubmit={handleAddProject} className="space-y-4 max-w-lg">
            <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
                <FolderPlus className="w-5 h-5"/> Add Project
            </h3>
            <input required type="text" placeholder="Project Name" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} className="w-full p-2 border rounded-md"/>
            <textarea required rows={3} placeholder="Description" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input type="url" placeholder="Link URL (https://...)" value={projectForm.link} onChange={e => setProjectForm({...projectForm, link: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input type="url" placeholder="Image URL (https://...)" value={projectForm.imageUrl} onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})} className="w-full p-2 border rounded-md"/>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"><Save className="w-4 h-4"/> Save Project</button>
        </form>
    );

    const renderPhotoForm = () => (
        <form onSubmit={handleAddPhoto} className="space-y-4 max-w-lg">
            <h3 className="text-lg font-bold flex items-center gap-2 text-pink-600">
                <ImageIcon className="w-5 h-5"/> Add Photo
            </h3>
            <input required type="text" placeholder="Title" value={photoForm.title} onChange={e => setPhotoForm({...photoForm, title: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input required type="url" placeholder="Image URL (https://...)" value={photoForm.url} onChange={e => setPhotoForm({...photoForm, url: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input type="text" placeholder="Tags (comma separated)" value={photoForm.tags} onChange={e => setPhotoForm({...photoForm, tags: e.target.value})} className="w-full p-2 border rounded-md"/>
            <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center gap-2"><Save className="w-4 h-4"/> Save Photo</button>
        </form>
    );

    const renderBlogForm = () => (
        <form onSubmit={handleAddBlog} className="space-y-4 max-w-lg">
            <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
                <span>📰</span> Add Blog Post
            </h3>
            <input required type="text" placeholder="Title" value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input required type="url" placeholder="Image URL (https://...)" value={blogForm.image} onChange={e => setBlogForm({...blogForm, image: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input required type="url" placeholder="Article Link (https://...)" value={blogForm.link} onChange={e => setBlogForm({...blogForm, link: e.target.value})} className="w-full p-2 border rounded-md"/>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4"/> Save Blog</button>
        </form>
    );

    const renderTechForm = () => (
        <form onSubmit={handleAddTech} className="space-y-4 max-w-lg">
             <h3 className="text-lg font-bold flex items-center gap-2 text-green-600">
                <span>💻</span> Add Tech Skill
            </h3>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={techForm.category} onChange={e => setTechForm({...techForm, category: e.target.value})} className="w-full p-2 border rounded-md bg-white">
                    <option value="">Select Category</option>
                    {techStack.map(t => <option key={t.category} value={t.category}>{t.category}</option>)}
                     <option value="New">Create New...</option>
                </select>
            </div>
            {techForm.category === 'New' && (
                 <input type="text" placeholder="New Category Name" className="w-full p-2 border rounded-md" onBlur={e => setTechForm({...techForm, category: e.target.value})} />
            )}
            <input required type="text" placeholder="Skill Name (e.g. Python)" value={techForm.item} onChange={e => setTechForm({...techForm, item: e.target.value})} className="w-full p-2 border rounded-md"/>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"><Save className="w-4 h-4"/> Add Skill</button>
        </form>
    );

    const renderSocialForm = () => (
        <form onSubmit={handleAddSocial} className="space-y-4 max-w-lg">
            <h3 className="text-lg font-bold flex items-center gap-2 text-purple-600">
                <span>🌐</span> Add Social Link
            </h3>
            <input required type="text" placeholder="Platform Name (e.g. Discord)" value={socialForm.text} onChange={e => setSocialForm({...socialForm, text: e.target.value})} className="w-full p-2 border rounded-md"/>
            <input required type="url" placeholder="Profile URL" value={socialForm.link} onChange={e => setSocialForm({...socialForm, link: e.target.value})} className="w-full p-2 border rounded-md"/>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL (SVG/PNG)</label>
                <input required type="text" placeholder="/icons/..." value={socialForm.icon} onChange={e => setSocialForm({...socialForm, icon: e.target.value})} className="w-full p-2 border rounded-md"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <div className="flex gap-2">
                    <input type="color" value={socialForm.bg} onChange={e => setSocialForm({...socialForm, bg: e.target.value})} className="h-10 w-20"/>
                    <input type="text" value={socialForm.bg} onChange={e => setSocialForm({...socialForm, bg: e.target.value})} className="flex-1 p-2 border rounded-md uppercase"/>
                </div>
            </div>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"><Save className="w-4 h-4"/> Save Social</button>
        </form>
    );

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="window-header">
                <WindowControls target="admin"/>
                <h2 className="flex-1 text-center font-bold text-sm">System Admin</h2>
                <div className="w-[50px] pointer-events-none"></div> 
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-white border-r border-gray-200 p-4 flex flex-col gap-2">
                    <button onClick={() => setActiveTab('dashboard')} className={clsx("text-left px-3 py-2 rounded-md font-medium text-sm transition-colors", activeTab === 'dashboard' ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50")}>Dashboard</button>
                    <button onClick={() => setActiveTab('projects')} className={clsx("text-left px-3 py-2 rounded-md font-medium text-sm transition-colors", activeTab === 'projects' ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50")}>Projects</button>
                    <button onClick={() => setActiveTab('photos')} className={clsx("text-left px-3 py-2 rounded-md font-medium text-sm transition-colors", activeTab === 'photos' ? "bg-pink-50 text-pink-700" : "text-gray-600 hover:bg-gray-50")}>Photos</button>
                    <button onClick={() => setActiveTab('blogs')} className={clsx("text-left px-3 py-2 rounded-md font-medium text-sm transition-colors", activeTab === 'blogs' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50")}>Blogs</button>
                    <button onClick={() => setActiveTab('tech')} className={clsx("text-left px-3 py-2 rounded-md font-medium text-sm transition-colors", activeTab === 'tech' ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50")}>Tech Stack</button>
                    <button onClick={() => setActiveTab('socials')} className={clsx("text-left px-3 py-2 rounded-md font-medium text-sm transition-colors", activeTab === 'socials' ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50")}>Socials</button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {successMsg && (
                        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
                            <span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4"/></button>
                        </div>
                    )}

                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'projects' && renderProjectForm()}
                    {activeTab === 'photos' && renderPhotoForm()}
                    {activeTab === 'blogs' && renderBlogForm()}
                    {activeTab === 'tech' && renderTechForm()}
                    {activeTab === 'socials' && renderSocialForm()}
                </div>
            </div>
        </div>
    );
}

const AdminWindow = WindowWrapper(Admin, "admin");
export default AdminWindow;
