import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImplementationGuidelineDownloadProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  fullWidth?: boolean;
}

export const ImplementationGuidelineDownload = ({
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
  fullWidth = false,
}: ImplementationGuidelineDownloadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      // Fetch the PDF file
      const response = await fetch("/implementation-guideline.pdf");

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Document Not Available",
            description:
              "The implementation guideline document is being prepared. Please contact the administration.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the file size to validate
      const contentLength = response.headers.get("content-length");
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

      if (fileSize < 1000) {
        // Less than 1KB likely means it's an error page
        toast({
          title: "Invalid File",
          description:
            "The downloaded file appears to be corrupted or invalid. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Create blob with explicit PDF MIME type
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });

      // Create object URL
      const url = URL.createObjectURL(pdfBlob);

      // Create and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "UMaT-Promotion-Guideline.pdf";
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();

      // Small delay before cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Success",
        description: "Guideline downloaded successfully.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description:
          "Failed to download the guideline. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`gap-2 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showIcon ? (
        <Download className="h-4 w-4" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isLoading ? "Downloading..." : "Download Implementation Guideline"}
    </Button>
  );
};
