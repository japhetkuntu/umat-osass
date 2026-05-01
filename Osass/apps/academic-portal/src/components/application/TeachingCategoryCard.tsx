import { useState } from "react";
import { Upload, ChevronDown, ChevronUp, FileText, X, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "../common/FilePreviewModal";

interface TeachingCategoryCardProps {
  id: string;
  title: string;
  description: string;
  score: number | null;
  remark: string;
  documents: string[];
  newFiles?: File[];
  onScoreChange: (id: string, score: number | null) => void;
  onRemarkChange: (id: string, remark: string) => void;
  onDocumentsChange: (id: string, documents: string[], newFiles?: File[], removedEvidenceKey?: string) => void;
  isReadOnly?: boolean;
}

export const TeachingCategoryCard = ({
  id,
  title,
  description,
  score,
  remark,
  documents,
  newFiles = [],
  onScoreChange,
  onRemarkChange,
  onDocumentsChange,
  isReadOnly = false,
}: TeachingCategoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(score !== null);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const handleScoreSelect = (s: number) => {
    if (isReadOnly) return;
    onScoreChange(id, s);
    if (!isExpanded) setIsExpanded(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onDocumentsChange(id, documents, [...newFiles, ...selectedFiles]);
    }
  };

  const handleRemoveDocument = (index: number, isNew: boolean) => {
    if (isNew) {
      onDocumentsChange(id, documents, newFiles.filter((_, i) => i !== index));
    } else {
      const removedDoc = documents[index];
      onDocumentsChange(
        id,
        documents.filter((_, i) => i !== index),
        newFiles,
        removedDoc // Pass the removed doc key
      );
    }
  };

  return (
    <div className={cn(
      "group transition-all duration-500 rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden",
      isExpanded ? "border-primary/30 shadow-2xl shadow-primary/5 ring-1 ring-primary/10" : "border-border/50 hover:border-primary/20"
    )}>
      {/* Header / Summary View */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 flex-1">
            <h3 className={cn(
              "text-lg font-bold transition-colors",
              isExpanded ? "text-primary" : "text-foreground group-hover:text-primary"
            )}>
              {title}
            </h3>
            <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          {/* Quick Score Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/50 rounded-xl border border-border/50">
            {[2, 4, 6, 8, 10].map((s) => (
              <button
                key={s}
                onClick={() => handleScoreSelect(s)}
                className={cn(
                  "w-9 h-9 rounded-lg text-[10px] font-black transition-all",
                  score === s
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
              >
                {s}
              </button>
            ))}
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isExpanded ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Justification */}
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Scholarly Justification</Label>
                <Textarea
                  placeholder="Provide a professional narrative justifying your self-assessment..."
                  value={remark}
                  onChange={(e) => onRemarkChange(id, e.target.value)}
                  disabled={isReadOnly}
                  className="min-h-[120px] bg-background/50 border-border/50 focus:ring-primary/10 focus:border-primary transition-all resize-none font-light disabled:opacity-70 disabled:cursor-not-allowed"
                />
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  Professional tone is recommended for evaluation.
                </div>
              </div>

              {/* Right: Evidence */}
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Evidentiary Documentation</Label>
                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div key={`existing-${idx}`} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/30 group/file hover:border-primary/30 transition-all">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({ url: doc, name: doc.split('/').pop() || "Document" })}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover/file:scale-110 transition-transform">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-foreground truncate max-w-[200px] group-hover/file:text-primary transition-colors">{doc.split('/').pop()}</span>
                      </button>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemoveDocument(idx, false)}
                          className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors rounded-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {newFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-secondary/20 group/file animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <Upload className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="text-xs font-medium text-secondary-dark truncate max-w-[140px]">{file.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveDocument(idx, true)}
                        className="p-1.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors rounded-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {!isReadOnly && (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-upload-teaching-${id}`}
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                      />
                      <label
                        htmlFor={`file-upload-teaching-${id}`}
                        className="w-full flex cursor-pointer flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group/upload"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                          <Upload className="w-4 h-4 text-muted-foreground group-hover/upload:text-primary" />
                        </div>
                        <p className="text-xs font-bold text-foreground">Upload Evidence</p>
                        <p className="text-[10px] text-muted-foreground mt-1">PDF, DOC (Max 10MB)</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fine-grained score slider */}
            <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">Precise Score</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={score || 0}
                disabled={isReadOnly}
                onChange={(e) => onScoreChange(id, parseFloat(e.target.value))}
                className="flex-1 accent-primary h-1.5 rounded-full appearance-none bg-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="w-10 text-center font-bold text-primary text-xl">{score || 0}</span>
            </div>
          </div>
        )}
      </div>
      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
        />
      )}
    </div>
  );
};
