import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import { DownloadIcon } from "lucide-react";
import useWindowStore from "#store/window";

const ImgFile = () => {
    const { windows } = useWindowStore();
    const fileData = windows.imgfile?.data;

    if (!fileData) {
        return (
            <>
                <div className="window-header">
                    <WindowControls target="imgfile" />
                    <h2>Image Viewer</h2>
                </div>
                <div className="bg-white p-6 min-h-[400px] flex items-center justify-center">
                    <p className="text-gray-500">No image selected</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="window-header">
                <WindowControls target="imgfile" />
                <h2>{fileData.name}</h2>
                {fileData.imageUrl && (
                    <a href={fileData.imageUrl} download={fileData.name} className="cursor-pointer" title="Download Image">
                        <DownloadIcon className="icon"/>
                    </a>
                )}
            </div>
            <div className="bg-gray-50 p-8 min-h-[500px] max-h-[700px] flex items-center justify-center overflow-auto">
                {fileData.imageUrl && (
                    <img 
                        src={fileData.imageUrl} 
                        alt={fileData.name} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                    />
                )}
            </div>
        </>
    );
};

const ImgFileWindow = WindowWrapper(ImgFile, "imgfile");
export default ImgFileWindow;
