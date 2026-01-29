import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import { DownloadIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Resume = () => {
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error) => {
        console.error("PDF Load Error:", error);
        setLoading(false);
        setError("Failed to load resume. Please try downloading it instead.");
    };

    return (
        <>
            <div className="window-header">
                <WindowControls target="resume" />
                <h2>Resume.pdf</h2>
                <a href="/files/resume.pdf" download className="cursor-pointer" title="Download Resume">
                    <DownloadIcon className="icon"/>
                </a>
            </div>
            <div className="bg-gray-50 overflow-y-auto max-h-[80vh] min-h-[600px]">
                {loading && !error && (
                    <div className="flex items-center justify-center min-h-[600px]">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                            <p className="text-gray-600 text-sm">Loading PDF...</p>
                        </div>
                    </div>
                )}
                {error && (
                     <div className="flex items-center justify-center min-h-[600px] text-red-500 flex-col gap-2">
                        <p>{error}</p>
                        <a href="/files/resume.pdf" className="text-blue-500 underline text-sm" download>Download PDF directly</a>
                    </div>
                )}
                <Document 
                    file="/files/resume.pdf" 
                    externalLinkTarget="_blank"
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading=""
                    className="flex flex-col items-center gap-4 p-4"
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            renderTextLayer
                            renderAnnotationLayer
                            className="shadow-lg"
                        />
                    ))}
                </Document>
            </div>
        </>
    );
};

const ResumeWindow = WindowWrapper(Resume, "resume");
export default ResumeWindow;
