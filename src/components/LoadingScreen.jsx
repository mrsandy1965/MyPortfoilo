import { Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

const LoadingScreen = () => {
    const containerRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(containerRef.current, 
            { opacity: 0 }, 
            { opacity: 1, duration: 0.5 }
        );
    }, []);

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-8 text-white"
        >
            <img 
                src="/images/apple.png" 
                alt="Apple Logo" 
                className="w-24 h-24 object-contain invert" // Assuming white logo needed, or use existing asset
                onError={(e) => { e.target.style.display = 'none'; }} // Fallback if image missing
            />
            {/* Fallback Icon if image fails or isn't appropriate */}
            <div className="flex flex-col items-center gap-4">
                 <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-progress origin-left w-full"></div>
                 </div>
            </div>
            
            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
