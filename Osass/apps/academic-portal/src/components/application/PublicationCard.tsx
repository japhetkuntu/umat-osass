import { useState } from "react";
import { Upload, ChevronDown, ChevronUp, FileText, X, Trash2, Info, Clock, TrendingUp, Calendar, ImageIcon, FileIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "../common/FilePreviewModal";
import { getEffectivePublicationScore, calculatePublicationScore } from "@/lib/publicationScoring";

export interface PublicationData {
  id: string;
  title: string;
  year: number;
  publicationTypeId: string;
  score: number; // Baseline / system-generated
  applicantScore: number | null;
  remark: string | null;
  evidence: string[];
  newFiles?: File[];
  removedDocuments?: string[];
  isPresented?: boolean;
  presentationEvidence?: string[];
  newPresentationFiles?: File[];
  removedPresentationEvidence?: string[];
}

interface PublicationCardProps {
  publication: PublicationData;
  indicators: any[];
  onUpdate: (publication: PublicationData) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

const PUBLICATION_TYPE_SCORES: Record<string, number> = {
  "journal-international": 10,
  "journal-national": 7,
  "book": 8,
  "book-chapter": 5,
  "conference-international": 6,
  "conference-national": 4,
  "patent": 9,
  "other": 2,
};

export const getSystemScore = (type: string): number => {
  return PUBLICATION_TYPE_SCORES[type] || 2;
};

export const PublicationCard = ({
  publication,
  indicators,
  onUpdate,
  onDelete,
  isReadOnly = false,
}: PublicationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(!publication.title);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  const handleFieldChange = (field: keyof PublicationData, value: any) => {
    const updated = { ...publication, [field]: value };
    if (field === "publicationTypeId") {
      const indicator = indicators.find(i => i.id === value);
      if (indicator) {
        updated.score = indicator.score;
      }
    }
    onUpdate(updated);
  };

  const handleSelfScoreChange = (value: string) => {
    const numValue = value === "" ? null : Math.min(publication.score, Math.max(0, parseFloat(value) || 0));
    handleFieldChange("applicantScore", numValue);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const updatedFiles = [...(publication.newFiles || []), ...selectedFiles];
      handleFieldChange("newFiles", updatedFiles);
    }
  };

  const handlePresentationFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const updatedFiles = [...(publication.newPresentationFiles || []), ...selectedFiles];
      handleFieldChange("newPresentationFiles", updatedFiles);
    }
  };

  const handleRemovePresentationDocument = (index: number, isNew: boolean) => {
    if (isNew) {
      handleFieldChange("newPresentationFiles", (publication.newPresentationFiles || []).filter((_, i) => i !== index));
    } else {
      const removedKey = (publication.presentationEvidence || [])[index];
      const updatedEvidence = (publication.presentationEvidence || []).filter((_, i) => i !== index);
      const updatedRemoved = [...(publication.removedPresentationEvidence || []), removedKey];
      onUpdate({
        ...publication,
        presentationEvidence: updatedEvidence,
        removedPresentationEvidence: updatedRemoved
      });
    }
  };

  const isResearchType = () => {
    const indicator = indicators.find(i => i.id === publication.publicationTypeId);
    return indicator?.name?.toLowerCase().includes("research") ||
      indicator?.name?.toLowerCase().includes("journal") ||
      indicator?.name?.toLowerCase().includes("conference");
  };

  const getAdjustedBaseline = () => {
    const base = publication.score;
    return publication.isPresented ? base + 2 : base;
  };

  const handleRemoveDocument = (index: number, isNew: boolean) => {
    if (isNew) {
      handleFieldChange("newFiles", (publication.newFiles || []).filter((_, i) => i !== index));
    } else {
      const removedKey = publication.evidence[index];
      const updatedEvidence = publication.evidence.filter((_, i) => i !== index);
      const updatedRemoved = [...(publication.removedDocuments || []), removedKey];

      onUpdate({
        ...publication,
        evidence: updatedEvidence,
        removedDocuments: updatedRemoved
      });
    }
  };

  const isHighImpact = (publication.applicantScore || 0) >= 15;
  const scoreDifference = publication.applicantScore !== null
    ? publication.applicantScore - getAdjustedBaseline()
    : null;

  return (
    <div className={cn(
      "group transition-all duration-500 rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden",
      isExpanded ? "border-primary/30 shadow-2xl shadow-primary/5 ring-1 ring-primary/10" : "border-border/50 hover:border-primary/20",
      isHighImpact && isExpanded && "border-secondary/30 ring-secondary/5"
    )}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className={cn(
              "text-lg font-bold transition-colors truncate",
              isExpanded ? (isHighImpact ? "text-secondary-dark" : "text-primary") : "text-foreground group-hover:text-primary"
            )}>
              {publication.title || "Untitled Scholarly Work"}
            </h3>
            <div className="flex items-center gap-3 text-xs font-light text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {publication.year || "Year Not Specified"}
              </span>
              <div className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1 uppercase tracking-tighter font-medium">
                <FileText className="w-3 h-3" />
                {indicators.find(i => i.id === publication.publicationTypeId)?.name || "Select Category"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right px-4 py-2 bg-muted/30 rounded-xl border border-border/30 shadow-sm">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Academic Credit</p>
              <p className={cn(
                "font-bold text-xl",
                publication.applicantScore !== null ? "text-primary" : "text-muted-foreground"
              )}>
                {publication.applicantScore ?? "—"}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isExpanded ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Meta Information */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Full Publication Title</Label>
                  <Input
                    placeholder="Enter the complete title as it appears in the journal..."
                    value={publication.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    disabled={isReadOnly}
                    className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Year of Release</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 2024"
                      value={publication.year || ""}
                      onChange={(e) => handleFieldChange("year", parseInt(e.target.value) || 0)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Work Category</Label>
                    <select
                      value={publication.publicationTypeId}
                      onChange={(e) => handleFieldChange("publicationTypeId", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                      <option value="">Select Category</option>
                      {indicators.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Scholarly Impact Narrative</Label>
                  <Textarea
                    placeholder="Articulate the significance of this work, citation impact, or practical applications..."
                    value={publication.remark || ""}
                    onChange={(e) => handleFieldChange("remark", e.target.value)}
                    disabled={isReadOnly}
                    className="min-h-[120px] bg-background/50 border-border/50 focus:border-primary focus:ring-primary/10 transition-all resize-none font-light leading-relaxed disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Right Side: Scoring & Evidence */}
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6 shadow-inner">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Scoring Calibration</Label>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-bold text-secondary-dark italic">
                        Guideline Baseline: {publication.score}
                        {publication.isPresented && (
                          <>
                            <span className="text-primary/50 mx-1">+</span>
                            <span>2 Bonus</span>
                            <span className="text-primary/50 mx-1">=</span>
                            <span className="font-bold text-secondary">{getEffectivePublicationScore(publication.score, true)}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {isResearchType() && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-primary/10">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-foreground">Presented at Conference/Forum?</Label>
                          <p className="text-[9px] text-muted-foreground italic">Grants +2 points bonus (Evidence required)</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={publication.isPresented || false}
                          disabled={isReadOnly}
                          onChange={(e) => handleFieldChange("isPresented", e.target.checked)}
                          className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      {publication.isPresented && (
                        <>
                          <div className="flex items-center gap-2 p-2.5 bg-secondary/10 rounded-lg border border-secondary/20">
                            <TrendingUp className="w-3.5 h-3.5 text-secondary shrink-0" />
                            <div className="text-[10px] font-semibold text-secondary-dark flex items-center gap-1">
                              <span>Score impact:</span>
                              <span className="bg-white px-1.5 py-0.5 rounded font-bold">{publication.applicantScore ?? 0} + 2 = {(publication.applicantScore ?? 0) + 2}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-primary/60">Presentation Evidence</Label>
                            <p className="text-[9px] text-muted-foreground italic">Upload your certificate of presentation or supporting document.</p>

                            {(publication.presentationEvidence || []).map((doc, idx) => (
                            <div key={`pres-existing-${idx}`} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border/30 group/file shadow-sm hover:border-primary/30 transition-all">
                              <button
                                type="button"
                                onClick={() => setPreviewFile({ url: doc, name: doc.split('/').pop() || "Document" })}
                                className="flex items-center gap-2 flex-1 text-left"
                              >
                                <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover/file:scale-110 transition-transform">
                                  <FileText className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-medium text-foreground truncate max-w-[160px] font-light group-hover/file:text-primary transition-colors">{doc.split('/').pop()}</span>
                              </button>
                              {!isReadOnly && (
                                <button
                                  onClick={() => handleRemovePresentationDocument(idx, false)}
                                  className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors rounded-md"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}

                          {(publication.newPresentationFiles || []).map((file, idx) => (
                            <div key={`pres-new-${idx}`} className="flex items-center justify-between p-2.5 bg-secondary/10 rounded-xl border border-secondary/20 shadow-sm animate-pulse">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                  <Upload className="w-3.5 h-3.5 text-secondary" />
                                </div>
                                <span className="text-xs font-medium text-secondary-dark truncate max-w-[140px] font-light">{file.name}</span>
                              </div>
                              <button
                                onClick={() => handleRemovePresentationDocument(idx, true)}
                                className="p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors rounded-md"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {!isReadOnly && (
                            <div className="relative">
                              <input
                                type="file"
                                id={`pres-upload-${publication.id}`}
                                className="hidden"
                                onChange={handlePresentationFileUpload}
                                multiple
                              />
                              <label
                                htmlFor={`pres-upload-${publication.id}`}
                                className="w-full flex cursor-pointer justify-center items-center gap-2 p-3 border-2 border-dashed border-primary/20 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group/presupload"
                              >
                                <Upload className="w-3.5 h-3.5 text-muted-foreground group-hover/presupload:text-primary" />
                                <span className="text-xs font-medium text-muted-foreground group-hover/presupload:text-primary">Upload presentation certificate</span>
                              </label>
                            </div>
                          )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <input
                        type="range"
                        min="0"
                        max={publication.score || 20}
                        step="0.5"
                        value={publication.applicantScore || 0}
                        onChange={(e) => handleSelfScoreChange(e.target.value)}
                        disabled={isReadOnly}
                        className="flex-1 accent-primary h-1.5 rounded-full appearance-none bg-border/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-primary/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Proposed</span>
                        <span className="text-xl font-bold text-primary leading-none">{publication.applicantScore || 0}</span>
                      </div>
                    </div>

                    {scoreDifference !== null && scoreDifference !== 0 && (
                      <div className={cn(
                        "flex gap-2 p-3 rounded-xl border shadow-sm transition-all",
                        scoreDifference > 0 ? "bg-secondary/5 border-secondary/20" : "bg-muted/50 border-border/50"
                      )}>
                        {scoreDifference > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5 text-secondary-dark shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <p className={cn(
                          "text-[10px] leading-relaxed font-medium italic",
                          scoreDifference > 0 ? "text-secondary-dark" : "text-muted-foreground"
                        )}>
                          {scoreDifference > 0
                            ? `This proposal exceeds the baseline by ${scoreDifference} pts. ${publication.isPresented ? "Bonus +2 from presentation included." : ""} Ensure the narrative justifies high impact.`
                            : `Proposed value is ${Math.abs(scoreDifference)} pts below benchmark.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Supporting Evidence</Label>
                  {publication.evidence.map((doc, idx) => (
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

                  {publication.newFiles?.map((file, idx) => (
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
                        id={`file-upload-${publication.id}`}
                        className="hidden"
                        onChange={handleFileUpload}
                        multiple
                      />
                      <label
                        htmlFor={`file-upload-${publication.id}`}
                        className="w-full flex cursor-pointer ml-0 justify-center items-center flex-col p-6 border-2 border-dashed border-border/50 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group/upload"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                          <Upload className="w-4 h-4 text-muted-foreground group-hover/upload:text-primary" />
                        </div>
                        <p className="text-xs font-bold text-foreground">Add Manuscript / Evidence</p>
                        <p className="text-[10px] text-muted-foreground mt-1 text-center italic">
                          {publication.isPresented
                            ? "Please include certificate of presentation and manuscript."
                            : "Only peer-reviewed manuscripts or certificates are accepted."}
                        </p>
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
                  onClick={() => onDelete(publication.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-[10px] font-black uppercase tracking-widest"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Discard Scholarly Work
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

