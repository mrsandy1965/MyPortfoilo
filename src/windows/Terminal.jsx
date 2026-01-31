import WindowWrapper from "#hoc/WindowWrapper";
import { WindowControls } from "#components";
import useWindowStore from "#store/window";
import useContentStore from "#store/content";
import { useState, useEffect, useRef, useMemo } from "react";
import { Check } from "lucide-react";

// Mock file system structure
const fileSystem = {
    '~': {
        type: 'dir',
        children: {
            'projects': { type: 'dir', children: {} },
            'skills': { type: 'dir', children: {} },
            'about.txt': { type: 'file', content: 'About me...' },
            'resume.pdf': { type: 'file', content: 'Resume...' },
        }
    }
};

const Terminal = () => {
    const { openWindow, closeWindow } = useWindowStore();
    const { techStack, locations } = useContentStore(); // Get from store
    const stackData = techStack || [];
    const [history, setHistory] = useState([
        { type: 'output', content: 'Welcome to SandeshOS Terminal. Type "help" for a list of commands.' }
    ]);
    const [input, setInput] = useState("");
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentPath, setCurrentPath] = useState("~");
    
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    // Keep focus on input
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    const commands = useMemo(() => ({
        help: () => (
            <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-yellow-400">help</span><span>List all commands</span>
                <span className="text-yellow-400">clear</span><span>Clear the terminal</span>
                <span className="text-yellow-400">about</span><span>About me</span>
                <span className="text-yellow-400">skills</span><span>View tech stack</span>
                <span className="text-yellow-400">projects</span><span>View projects</span>
                <span className="text-yellow-400">contact</span><span>Contact info</span>
                <span className="text-yellow-400">open</span><span>Open an app (e.g., open photos)</span>
                <span className="text-yellow-400">close</span><span>Close an app (e.g., close finder)</span>
            </div>
        ),
        clear: () => {
            setHistory([]);
            return null;
        },
        about: () => (
            <div>
                <p>Hi, I&apos;m Sandesh! 👋</p>
                <p>I&apos;m a Full Stack Developer passionate about building beautiful and functional web applications.</p>
                <p>Type <span className="text-green-400">skills</span> or <span className="text-green-400">projects</span> to see more.</p>
            </div>
        ),
        whoami: () => "guest",
        date: () => new Date().toString(),
        echo: (args) => args.join(" "),
        
        open: (args) => {
            if (!args.length) return "Usage: open <app_name>";
            const app = args[0].toLowerCase();
            const validApps = ['finder', 'photos', 'resume', 'contact', 'terminal', 'admin'];
            openWindow(app);
            return `Opening ${app}...`;
        },
        admin: () => {
             openWindow('admin');
             return "Opening Admin Portal... (Authenticated as guest)";
        },
        close: (args) => {
             if (!args.length) return "Usage: close <app_name>";
            const app = args[0].toLowerCase();
            closeWindow(app);
            return `Closing ${app}...`;
        },
        
        skills: () => (
            <div className="space-y-2 mt-2">
                {techStack.map(({category, items}) => (
                    <div key={category}>
                        <span className="text-blue-400 font-bold">{category}:</span>
                        <span className="text-gray-300 ml-2">{items.join(", ")}</span>
                    </div>
                ))}
                <div className="text-green-400 mt-2">✓ All systems operational</div>
            </div>
        ),
        
        projects: () => {
            const projectsList = locations.work?.children || [];
            return (
                <div className="grid grid-cols-1 gap-2 mt-2">
                     {projectsList.map(p => (
                         <div key={p.id} className="flex items-center gap-2 group cursor-pointer hover:bg-white/10 p-1 rounded"
                              onClick={() => openWindow('finder', p)}>
                            <span>📂</span>
                            <span className="text-blue-300 font-bold">{p.name}</span>
                         </div>
                     ))}
                     <p className="text-gray-500 italic mt-1">Tip: Click on a project or find them in Finder</p>
                </div>
            )
        },

        contact: () => (
             <div>
                <p>📧 Email: <a href="mailto:8055sandesh8055@gmail.com" className="text-blue-400 hover:underline">8055sandesh8055@gmail.com</a></p>
                <p>🐱 GitHub: <a href="https://github.com/mrsandy1965" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">github.com/mrsandy1965</a></p>
                 <p>🔗 LinkedIn: <a href="https://www.linkedin.com/in/sandesh-lendve" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">linkedin.com/in/sandesh-lendve</a></p>
            </div>
        ),

        resume: () => {
            openWindow('resume');
            return "Opening Resume.pdf...";
        },
        
        ls: () => {
             // Simple mock
             return (
                 <div className="grid grid-cols-3 gap-4 text-blue-300">
                     <span>projects/</span>
                     <span>skills/</span>
                     <span className="text-white">about.txt</span>
                     <span className="text-white">resume.pdf</span>
                 </div>
             )
        },
        cd: (args) => {
             if (!args.length || args[0] === '~') {
                 setCurrentPath("~");
                 return null;
             }
             return `cd: no such file or directory: ${args[0]} (Simulated)`;
        }

    }), [openWindow, closeWindow]);

    const handleCommand = (cmdString) => {
        const trimmed = cmdString.trim();
        if (!trimmed) return;

        // Add to command history
        setCommandHistory(prev => [...prev, trimmed]);
        setHistoryIndex(-1);

        const [cmd, ...args] = trimmed.split(/\s+/);
        
        const output = {
            type: 'history',
            command: trimmed,
            path: currentPath,
            timestamp: new Date().toLocaleTimeString() 
        };

        let result;
        if (commands[cmd.toLowerCase()]) {
            try {
                result = commands[cmd.toLowerCase()](args);
            } catch (err) {
                result = `Error executing ${cmd}: ${err.message}`;
            }
        } else {
             result = `Command not found: ${cmd}. Type 'help' for available commands.`;
        }
        
        // Handle clear separately (returns null to skip adding output)
        if (cmd.toLowerCase() === 'clear') return;

        if (result) {
            setHistory(prev => [...prev, output, { type: 'output', content: result }]);
        } else {
             setHistory(prev => [...prev, output]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput("");
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length === 0) return;
            
            const newIndex = historyIndex + 1;
            if (newIndex < commandHistory.length) {
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                 const newIndex = historyIndex - 1;
                 setHistoryIndex(newIndex);
                 setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput("");
            }
        } else if (e.key === 'Tab') {
             e.preventDefault();
             // Simple autocomplete could go here
             const available = Object.keys(commands);
             const match = available.find(c => c.startsWith(input));
             if (match) setInput(match);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="window-header">
                <WindowControls target="terminal"/>
                <h2 className="flex-1 text-center font-bold text-sm">Terminal — guest@sandesh</h2>
                {/* Spacer to balance the controls if needed, or just let h2 center */}
                <div className="w-[50px] pointer-events-none"></div> 
            </div>

            <div 
                className="flex-1 bg-[#1a1b26] text-[#a9b1d6] font-mono text-sm p-4 overflow-y-auto w-full relative"
                onClick={handleContainerClick}
            >
                <div className="space-y-1">
                    {history.map((item, i) => {
                        if (item.type === 'history') {
                            return (
                                <div key={i} className="flex gap-2 text-gray-400">
                                    <span className="text-green-400 font-bold">guest@sandesh:{item.path}$</span>
                                    <span>{item.command}</span>
                                </div>
                            )
                        }
                        return (
                            <div key={i} className="mb-2 whitespace-pre-wrap break-words">
                                {item.content}
                            </div>
                        )
                    })}
                </div>

                <div className="flex gap-2 mt-2 items-center">
                    <span className="text-green-400 font-bold whitespace-nowrap">guest@sandesh:{currentPath}$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none outline-none flex-1 text-[#a9b1d6]"
                        autoFocus
                        spellCheck="false"
                        autoComplete="off"
                    />
                </div>
                <div ref={bottomRef} className="h-4" />
            </div>
        </div>
    );
};
const TerminalWindow = WindowWrapper(Terminal,"terminal")
export default TerminalWindow;