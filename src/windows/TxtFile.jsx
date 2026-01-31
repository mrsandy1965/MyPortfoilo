import { WindowControls } from "#components";
import WindowWrapper from "#hoc/WindowWrapper";
import useWindowStore from "#store/window";

const TxtFile = () => {
    const { windows } = useWindowStore();
    const fileData = windows.txtfile?.data;

    if (!fileData) {
        return (
            <>
                <div className="window-header">
                    <WindowControls target="txtfile" />
                    <h2>Text File</h2>
                </div>
                <div className="bg-white p-6 min-h-[400px]">
                    <p className="text-gray-500">No file selected</p>
                </div>
            </>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="window-header flex-none">
                <WindowControls target="txtfile" />
                <h2>{fileData.name}</h2>
            </div>
            <div className="bg-white p-8 flex-1 overflow-y-auto max-w-3xl">
                {fileData.subtitle && (
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">{fileData.subtitle}</h3>
                )}
                {fileData.image && (
                    <img 
                        src={fileData.image} 
                        alt={fileData.name} 
                        className="w-32 h-32 rounded-xl object-cover mb-6 shadow-md"
                    />
                )}
                <div className="space-y-4">
                    {fileData.description?.map((paragraph, index) => (
                        <p key={index} className="text-gray-700 leading-relaxed text-base">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TxtFileWindow = WindowWrapper(TxtFile, "txtfile");
export default TxtFileWindow;
