import { useState } from "react";
import { Upload, ChevronDown, ChevronUp, FileText, X, Trash2, Briefcase, Award, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "../common/FilePreviewModal";
import { ServiceCategoryOption } from "@/types/academic";

export interface ServiceRecordData {
  id: string;
  categoryId: string;
  servicePositionId: string;
  committeeName: string | null;
  score: number; // System-computed, read-only
  remark: string | null;
  evidence: string[];
  newFiles?: File[];
  removedDocuments?: string[];
  isActing: boolean | null;
}

interface ServiceRecordCardProps {
  record: ServiceRecordData;
  category: ServiceCategoryOption;
  onUpdate: (record: ServiceRecordData) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export const ServiceRecordCard = ({
  record,
  category,
  onUpdate,
  onDelete,
  isReadOnly = false,
}: ServiceRecordCardProps) => {
  const [isExpanded, setIsExpanded] = useState(!record.servicePositionId);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const selectedPosition = category.positions.find(p => p.id === record.servicePositionId);

  const handleFieldChange = (field: keyof ServiceRecordData, value: any) => {
    const updated = { ...record, [field]: value };
    const position = field === "servicePositionId"
      ? category.positions.find(p => p.id === value)
      : selectedPosition;

    if (position) {
      const multiplier = category.requiresDesignation
        ? (updated.isActing ? category.actingScoreMultiplier : category.fullTimeScoreMultiplier)
        : 1;
      updated.score = position.score * multiplier;
    }
    onUpdate(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const updatedFiles = [...(record.newFiles || []), ...selectedFiles];
      handleFieldChange("newFiles", updatedFiles);
    }
  };

  const handleRemoveDocument = (index: number, isNew: boolean) => {
    if (isNew) {
      handleFieldChange("newFiles", (record.newFiles || []).filter((_, i) => i !== index));
    } else {
      const removedKey = record.evidence[index];
      const updatedEvidence = record.evidence.filter((_, i) => i !== index);
      const updatedRemoved = [...(record.removedDocuments || []), removedKey];

      onUpdate({
        ...record,
        evidence: updatedEvidence,
        removedDocuments: updatedRemoved
      });
    }
  };

  const cardTitle = category.requiresCommitteeName
    ? (record.committeeName || "Untitled Committee")
    : (selectedPosition?.name || "Untitled Position");

  return (
    <div className={cn(
      "group transition-all duration-500 rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden",
      isExpanded ? "border-primary/30 shadow-2xl shadow-primary/5 ring-1 ring-primary/10" : "border-border/50 hover:border-primary/20"
    )}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                isExpanded ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
              )}>
                {category.name}
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                Ref: {record.id.slice(0, 8)}
              </span>
            </div>
            <h3 className={cn(
              "text-xl font-bold transition-all truncate",
              isExpanded ? "text-primary translate-x-1" : "text-foreground group-hover:text-primary"
            )}>
              {cardTitle}
            </h3>
            <div className="flex items-center gap-4 text-xs font-light text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                {selectedPosition?.name || "Select Position"}
              </span>
              {category.requiresDesignation && record.isActing !== null && (
                <>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1.5 font-medium">
                    {record.isActing ? "Acting" : "Full-time"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 mb-1">Score</span>
              <div className={cn(
                "px-4 py-1.5 rounded-xl border font-bold text-xl min-w-[60px] text-center transition-all shadow-sm",
                selectedPosition
                  ? "bg-primary/5 border-primary/30 text-primary scale-105"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                {selectedPosition ? record.score : "—"}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                isExpanded
                  ? "bg-primary text-white rotate-0 shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:shadow-md"
              )}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Detail Inputs */}
              <div className="space-y-6">
                {category.requiresCommitteeName && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Committee Name / Title</Label>
                    <Input
                      placeholder="e.g. University ICT Committee"
                      value={record.committeeName || ""}
                      onChange={(e) => handleFieldChange("committeeName", e.target.value)}
                      disabled={isReadOnly}
                      className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Position</Label>
                  <select
                    value={record.servicePositionId || ""}
                    onChange={(e) => handleFieldChange("servicePositionId", e.target.value)}
                    disabled={isReadOnly}
                    className="flex h-10 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-light disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a position</option>
                    {category.positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.score} pts)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Comments</Label>
                  <Textarea
                    placeholder="Describe the institutional or community impact of your service..."
                    value={record.remark || ""}
                    onChange={(e) => handleFieldChange("remark", e.target.value)}
                    disabled={isReadOnly}
                    className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all resize-none font-light leading-relaxed disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Right: Scoring and Evidence */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl border border-primary/10 space-y-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Award className="w-20 h-20 text-primary" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">System-Computed Score</Label>
                  </div>

                  <div className="space-y-6 relative z-10">
                    {category.requiresDesignation && (
                      <div className="p-3 bg-white/50 rounded-xl border border-amber-200/60 space-y-3">
                        <Label className="text-xs font-bold text-foreground">Designation</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleFieldChange("isActing", false)}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                              record.isActing === false
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-border/50 text-muted-foreground hover:border-primary/40"
                            )}
                          >
                            Full-time
                            {selectedPosition && (
                              <span className="block text-[9px] font-normal opacity-80 mt-0.5">
                                {selectedPosition.score * category.fullTimeScoreMultiplier} pts
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleFieldChange("isActing", true)}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                              record.isActing === true
                                ? "bg-amber-500 text-white border-amber-500"
                                : "bg-white border-border/50 text-muted-foreground hover:border-amber-400"
                            )}
                          >
                            Acting
                            {selectedPosition && (
                              <span className="block text-[9px] font-normal opacity-80 mt-0.5">
                                {selectedPosition.score * category.actingScoreMultiplier} pts
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-[9px] text-amber-700 italic">
                          Acting positions receive {Math.round(category.actingScoreMultiplier * 100)}% of the position's score; full-time receives {Math.round(category.fullTimeScoreMultiplier * 100)}%.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-center">
                      <div className="w-24 h-24 rounded-2xl bg-white shadow-xl border-2 border-primary/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-1">Score</span>
                        <span className="text-3xl font-bold text-primary leading-none">{selectedPosition ? record.score : "—"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 p-3 bg-muted/40 rounded-xl border border-border/30">
                      <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed text-muted-foreground font-medium italic">
                        Scores are computed automatically based on the position you select. You don't need to enter a score yourself.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Supporting Evidence</Label>
                  {record.evidence.map((doc, idx) => (
                    <div key={`existing-${idx}`} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/30 group/file shadow-sm hover:border-primary/30 transition-all">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({ url: doc, name: doc.split('/').pop() || "Document" })}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover/file:scale-110 transition-transform">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-foreground truncate max-w-[200px] font-light group-hover/file:text-primary transition-colors">{doc.split('/').pop()}</span>
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

                  {record.newFiles?.map((file, idx) => (
                    <div key={`new-${idx}`} className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-secondary/20 group/file shadow-sm animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <Upload className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="text-xs font-medium text-secondary-dark truncate max-w-[140px] font-light">{file.name}</span>
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
                        id={`file-upload-service-${record.id}`}
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                      />
                      <label
                        htmlFor={`file-upload-service-${record.id}`}
                        className="w-full flex cursor-pointer ml-0 justify-center items-center flex-col p-6 border-2 border-dashed border-border/50 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group/upload"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                          <Upload className="w-4 h-4 text-muted-foreground group-hover/upload:text-primary" />
                        </div>
                        <p className="text-xs font-bold text-foreground">Add Document</p>
                        <p className="text-[10px] text-muted-foreground mt-1 text-center italic">Appointment letters, Certificates, or Impact reports.</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(record.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Service Record
                </Button>
              </div>
            )}
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
