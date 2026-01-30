import { WindowControls } from "#components"
import WindowWrapper from "#hoc/WindowWrapper"
import { ChevronLeft, ChevronRight, Copy, PanelLeft, Plus, Search, Share, ShieldHalf, Code2, Database, Layout, Smartphone, PenTool, Terminal } from "lucide-react"
import useContentStore from "#store/content"
import clsx from "clsx"
import { useState } from "react"

const Safari = () => {
  const { blogPosts, techStack } = useContentStore();
  const posts = blogPosts || [];
  const skills = techStack || [];

  const [selectedCategory, setSelectedCategory] = useState("All");

  // Helper to get icon for category
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'frontend': return <Layout className="w-5 h-5" />;
      case 'backend': return <Database className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tools': return <Terminal className="w-5 h-5" />;
      case 'design': return <PenTool className="w-5 h-5" />;
      default: return <Code2 className="w-5 h-5" />;
    }
  };

  // Helper for Bento Grid specific classes based on index
  const getBentoClass = (index) => {
    return "md:col-span-2 bg-white border-gray-100 hover:border-blue-200";
  };

  // Tech Stack Icons Mapping - Expanded
  const TECH_ICONS = {
    // Frontend
    "React.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    "Next": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    "HTML": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    "CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    "Vue.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
    "Angular": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
    "Svelte": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg",
    
    // Mobile
    "React Native": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "Expo": "https://raw.githubusercontent.com/expo/expo/main/docs/public/static/images/favicon.ico", // Fallback to expo favicon or similar stable
    "Flutter": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
    "Swift": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
    "Kotlin": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",

    // Styling
    "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    "Tailwind": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    "Sass": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
    "SCSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
    "Bootstrap": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    "Material UI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg",
    "Framer Motion": "https://pagepro.co/blog/wp-content/uploads/2020/03/framer-motion.png", // Common logo URL

    // Backend
    "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    "Node": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    "Express": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
    "NestJS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
    "Hono": "https://raw.githubusercontent.com/honojs/hono/main/docs/public/images/hono-title.png", 
    "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    "Django": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
    "Flask": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
    "Java": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    "Spring Boot": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
    "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
    "Rust": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg",
    "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",

    // Database
    "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    "Postgres": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
    "Supabase": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
    "Firebase": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
    "Prisma": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg", // Added Prisma as requested in thought process
    
    // Tools & DevOps
    "Git": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    "GitHub": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    "Kubernetes": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
    "AWS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    "Linux": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
    "Figma": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
    "Adobe XD": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xd/xd-plain.svg",
  };

  const getTechIcon = (name) => {
      if (TECH_ICONS[name]) return TECH_ICONS[name];
      
      // Fuzzy match attempt
      const lowerName = name.toLowerCase().replace(/\./g, "").replace(/\s/g, "");
      const foundKey = Object.keys(TECH_ICONS).find(key => {
          const lowerKey = key.toLowerCase().replace(/\./g, "").replace(/\s/g, "");
          return lowerKey === lowerName || lowerKey.includes(lowerName) || lowerName.includes(lowerKey);
      });
      
      return foundKey ? TECH_ICONS[foundKey] : "/images/plain.png";
  };

  // Filter posts based on selected category
  const filteredPosts = posts.filter(post => {
      if (selectedCategory === "All") return true;
      return post.tags?.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
  });

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  return (
    <div className="flex flex-col h-full bg-[#fbfbfd]">
        {/* Safari Header */}
        <div className="window-header flex-none bg-[#fbfbfd] border-b border-[#d1d1d1]/50 backdrop-blur-md">
            <WindowControls target="safari" />
            <PanelLeft className="ml-8 text-gray-500 w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors" />
            <div className="flex items-center gap-4 ml-5 text-gray-400" >
                <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
                <ChevronRight className="w-5 h-5 cursor-pointer hover:text-gray-800 transition-colors"/>
            </div>
            
            {/* Address Bar */}
            <div className="flex-1 flex justify-center px-4">
                <div className="flex items-center gap-2 bg-gray-200/50 hover:bg-gray-200/80 transition-colors px-3 py-1.5 rounded-lg w-full max-w-lg text-sm group cursor-text">
                    <ShieldHalf className="w-3 h-3 text-gray-500 group-hover:text-gray-800"/>
                    <Search className="w-3 h-3 text-gray-400"/>
                    <input type="text" placeholder="sandesh.dev/portfolio" className="bg-transparent border-none outline-none flex-1 placeholder:text-gray-500 text-center group-hover:text-left transition-all text-gray-700"/>
                </div>
            </div>

            <div className="flex items-center gap-4 text-gray-500">
                <Share className="w-4 h-4 cursor-pointer hover:text-blue-500 transition-colors"/>
                <Plus className="w-4 h-4 cursor-pointer hover:text-gray-800 transition-colors" />
                <Copy className="w-4 h-4 cursor-pointer hover:text-gray-800 transition-colors" />
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-16">
                
                {/* Tech Stack - Bento Grid */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Tech Ecosystem</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-md text-gray-500">UPDATED 2024</span>
                            {selectedCategory !== "All" && (
                                <button 
                                    onClick={() => setSelectedCategory("All")}
                                    className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                    CLEAR FILTER
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                        {skills.map((category, idx) => (
                            <div 
                                key={category.category} 
                                onClick={() => setSelectedCategory(category.category === selectedCategory ? "All" : category.category)}
                                className={clsx(
                                    "group p-6 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer",
                                    getBentoClass(idx),
                                    selectedCategory === category.category ? "ring-2 ring-blue-500 ring-offset-2" : "hover:border-blue-200"
                                )}
                            >
                                {/* Decorative background elements */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 text-blue-500"></div>
                                
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className={clsx(
                                        "p-2 rounded-xl shadow-sm ring-1 ring-black/5 transition-colors",
                                        selectedCategory === category.category ? "bg-blue-600 text-white" : "bg-white text-gray-700 group-hover:text-blue-600"
                                    )}>
                                        {getCategoryIcon(category.category)}
                                    </div>
                                    <h3 className="font-bold text-gray-800">{category.category}</h3>
                                </div>
                                
                                <div className="flex-1 grid grid-cols-3 gap-3 place-content-start relative z-10">
                                    {category.items.map((item) => (
                                        <div key={item} 
                                            className="group/item flex flex-col items-center justify-center p-2 bg-white/60 backdrop-blur-sm border border-black/5 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-default aspect-square"
                                            title={item}
                                        >
                                            <img 
                                                src={getTechIcon(item)} 
                                                alt={item} 
                                                className="w-8 h-8 object-contain mb-1.5 group-hover/item:scale-110 transition-transform"
                                                onError={(e) => {e.target.onerror = null; e.target.src = "/images/plain.png"}}
                                            />
                                            <span className="text-[9px] font-semibold text-gray-500 group-hover/item:text-blue-600 text-center leading-tight truncate w-full px-0.5">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Blog Section - Magazine Style */}
                <section>
                    <div className="flex items-center justify-between mb-8 border-l-4 border-pink-500 pl-4">
                         <h2 className="text-2xl font-bold text-gray-900">Latest Insights</h2>
                         <span className="text-sm font-medium text-gray-400">
                            {selectedCategory === "All" ? "All Posts" : `Filtering by: ${selectedCategory}`}
                         </span>
                    </div>
                   
                    
                    {filteredPosts.length > 0 ? (
                        <>
                            {/* Featured Hero Post */}
                            {featuredPost && (
                                <div className="group relative w-full h-[400px] rounded-3xl overflow-hidden mb-8 shadow-2xl ring-1 ring-black/5 cursor-pointer">
                                    <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    
                                    <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
                                        <div className="flex gap-2 mb-4">
                                            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-900/50">FEATURED</span>
                                            {featuredPost.tags?.map(tag => (
                                                <span key={tag} className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                                            {featuredPost.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-gray-300 text-sm font-medium">
                                            <span>{featuredPost.date}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <a href={featuredPost.link} target="_blank" rel="noopener noreferrer" className="text-white hover:underline flex items-center gap-1 group/link">
                                                Read Article <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {otherPosts.map((post) => (
                                    <div key={post.id} className="group flex flex-col gap-4 cursor-pointer">
                                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5">
                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-pink-600 uppercase tracking-widest">
                                                <span>{post.tags?.[0] || "Technology"}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-400 font-normal normal-case">{post.date}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-500 group-hover:text-gray-900 flex items-center gap-1 mt-1">
                                                Read more <ChevronRight className="w-3 h-3"/>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                             <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Search className="w-8 h-8"/>
                             </div>
                             <h3 className="text-lg font-bold text-gray-700">No posts found</h3>
                             <p className="text-gray-500">No articles found for the category "{selectedCategory}"</p>
                             <button 
                                onClick={() => setSelectedCategory("All")}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                             >
                                Clear Filters
                             </button>
                        </div>
                    )}
                </section>

                <footer className="text-center text-gray-400 py-8 border-t border-gray-100">
                    <p className="text-sm">© 2024 Sandesh's Portfolio. Built with React & Tailwind.</p>
                </footer>
            </div>
        </div>
    </div>
  )
}
const SafariWindow = WindowWrapper(Safari,"safari")
export default SafariWindow
