import { getEvidenceFileName } from "@/lib/files";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Eye, Download } from "lucide-react";

export const EvidenceList = ({ evidenceUrls, onPreview }: { evidenceUrls: string[]; onPreview: (url: string, fileName?: string) => void }) => {
    if (!evidenceUrls || evidenceUrls.length === 0) {
      return <p className="text-sm text-muted-foreground">No evidence provided</p>;
    }

    return (
      <div className="space-y-2">
        {evidenceUrls.map((url, index) => {
          const fileName = getEvidenceFileName(url) || `Evidence ${index + 1}`;
          return (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate flex-1">{fileName}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onPreview(url, fileName)}
                      aria-label={`Preview ${fileName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      asChild
                    >
                      <a href={url} download target="_blank" rel="noopener noreferrer" aria-label={`Download ${fileName}`}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    );
  };

