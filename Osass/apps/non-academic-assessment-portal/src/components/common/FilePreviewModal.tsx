import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, ImageIcon, FileIcon } from "lucide-react";

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
}

export const FilePreviewModal = ({
    isOpen,
    onClose,
    fileUrl,
    fileName,
}: FilePreviewModalProps) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(fileUrl);
    const isPdf = /\.pdf(\?.*)?$/i.test(fileUrl);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            {isImage ? (
                                <ImageIcon className="w-4 h-4 text-primary" />
                            ) : isPdf ? (
                                <FileText className="w-4 h-4 text-primary" />
                            ) : (
                                <FileIcon className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold truncate max-w-[300px]">
                                {fileName}
                            </DialogTitle>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                Document Preview
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                            <Download className="w-3 h-3" />
                            Download
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                                Open Original
                            </a>
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-muted/20 flex items-center justify-center overflow-auto p-4">
                    {isImage ? (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-full rounded-lg border shadow-inner"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-background shadow-xl flex items-center justify-center mx-auto border">
                                <FileIcon className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-bold">No preview available for this file type</p>
                                <p className="text-xs text-muted-foreground">You can still download the file to view it on your device.</p>
                            </div>
                            <Button onClick={handleDownload} className="font-bold">
                                Download File
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
