import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";

import { DownloadIcon } from "lucide-react";

const Resume = () => {

    return (
        <>
            <div className="window-header">
                <WindowControls target="resume" />
                <h2>Resume.pdf</h2>
                <a href="https://drive.google.com/file/d/1aa2FLarg55QrmvtnfwdsFBc8_4FhHgtB/view?usp=sharing" download className="cursor-pointer" title="Download Resume" target="_blank" rel="noopener noreferrer">
                    <DownloadIcon className="icon"/>
                </a>
            </div>
            <div className="bg-gray-50 h-[calc(100%-30px)] w-full"> {/* Adjust height to account for header */}
                <iframe 
                    src="https://drive.google.com/file/d/1aa2FLarg55QrmvtnfwdsFBc8_4FhHgtB/preview" 
                    width="100%" 
                    height="100%" 
                    className="border-0 w-full h-full"
                    title="Resume Preview"
                    allow="autoplay"
                ></iframe>
            </div>
        </>
    );
};

const ResumeWindow = WindowWrapper(Resume, "resume");
export default ResumeWindow;
