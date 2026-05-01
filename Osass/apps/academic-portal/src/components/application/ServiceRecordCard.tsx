import { useState } from "react";
import { Upload, ChevronDown, ChevronUp, FileText, X, Trash2, Briefcase, Calendar, Award, Info, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "../common/FilePreviewModal";

export interface ServiceRecordData {
  id: string;
  serviceTitle: string;
  serviceTypeId: string;
  role: string | null;
  duration: string | null;
  score: number; // Institutional weight / system-generated
  applicantScore: number | null;
  remark: string | null;
  evidence: string[];
  newFiles?: File[];
  removedDocuments?: string[];
  isActing?: boolean;
}

interface ServiceRecordCardProps {
  record: ServiceRecordData;
  positions: any[];
  onUpdate: (record: ServiceRecordData) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export const ServiceRecordCard = ({
  record,
  positions,
  onUpdate,
  onDelete,
  isReadOnly = false,
}: ServiceRecordCardProps) => {
  const [isExpanded, setIsExpanded] = useState(!record.serviceTitle);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const handleFieldChange = (field: keyof ServiceRecordData, value: any) => {
    const updated = { ...record, [field]: value };
    if (field === "serviceTypeId") {
      const position = positions.find(p => p.id === value);
      if (position) {
        updated.score = position.score;
      }
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
                {positions.find(p => p.id === record.serviceTypeId)?.serviceType || "Service"}
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
              {record.serviceTitle || "Untitled Service Contribution"}
            </h3>
            <div className="flex items-center gap-4 text-xs font-light text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-primary/60" />
                {positions.find(p => p.id === record.serviceTypeId)?.name || "Select Role"}
              </span>
              {record.duration && (
                <>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary/60" />
                    {record.duration}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 mb-1">Impact Value</span>
              <div className={cn(
                "px-4 py-1.5 rounded-xl border font-bold text-xl min-w-[60px] text-center transition-all shadow-sm",
                record.applicantScore !== null
                  ? "bg-primary/5 border-primary/30 text-primary scale-105"
                  : "bg-muted/50 border-border/50 text-muted-foreground"
              )}>
                {record.applicantScore !== null ? record.applicantScore : "—"}
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
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Activity / Initiative Title</Label>
                  <Input
                    placeholder="e.g. Chairperson, University ICT Committee"
                    value={record.serviceTitle || ""}
                    onChange={(e) => handleFieldChange("serviceTitle", e.target.value)}
                    disabled={isReadOnly}
                    className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Your Official Role / Position</Label>
                  <select
                    value={record.serviceTypeId || ""}
                    onChange={(e) => handleFieldChange("serviceTypeId", e.target.value)}
                    disabled={isReadOnly}
                    className="flex h-10 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-light disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a role benchmark</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Role / Position held</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        placeholder="e.g. Chairperson"
                        value={record.role || ""}
                        onChange={(e) => handleFieldChange("role", e.target.value)}
                        disabled={isReadOnly}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all font-light disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Duration / Period</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input
                        placeholder="e.g. 2020 - 2022"
                        value={record.duration || ""}
                        onChange={(e) => handleFieldChange("duration", e.target.value)}
                        disabled={isReadOnly}
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all font-light disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Impact & Contributions Narrative</Label>
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
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Institutional Weight</Label>
                    <div className="flex items-center gap-2">
                      <Award className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-bold text-secondary-dark italic">Benchmark: {record.score} Max</span>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-amber-200/60">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-foreground">Acting / Temporary Position?</Label>
                        <p className="text-[9px] text-amber-700 italic">Acting positions receive 50% of the stated score</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={record.isActing || false}
                        disabled={isReadOnly}
                        onChange={(e) => handleFieldChange("isActing", e.target.checked)}
                        className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.5"
                        value={record.applicantScore || 0}
                        onChange={(e) => handleFieldChange("applicantScore", parseFloat(e.target.value))}
                        disabled={isReadOnly}
                        className="flex-1 accent-primary h-1.5 rounded-full appearance-none bg-border/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border-2 border-primary/20 flex flex-col items-center justify-center shrink-0 group/score transition-transform hover:scale-110">
                        <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-1">Score</span>
                        <span className="text-2xl font-bold text-primary leading-none">{record.applicantScore || 0}</span>
                      </div>
                    </div>

                    {(record.applicantScore || 0) > 40 && (
                      <div className="flex gap-2 p-4 bg-white/80 backdrop-blur-md rounded-xl border border-secondary/20 shadow-sm animate-in zoom-in-95 duration-300">
                        <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-relaxed text-secondary-foreground font-medium italic">
                          High-weighted service requires proof of leadership, policy impact, or significant institutional outcomes.
                        </p>
                      </div>
                    )}
                    {record.isActing && record.applicantScore !== null && record.applicantScore > 0 && (
                      <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 shadow-sm animate-in zoom-in-95 duration-300">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-relaxed text-amber-800 font-medium italic">
                          Acting position — effective score will be <strong>{((record.applicantScore || 0) * 0.5).toFixed(1)}</strong> (50% of {record.applicantScore}).
                        </p>
                      </div>
                    )}
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
