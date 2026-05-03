import { useEffect, useRef, useState } from "react";
import { FileText, FileUp, CheckCircle2, AlertCircle, Loader2, Download, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { nonAcademicService } from "@/services/nonAcademicService";
import { ApplicationDocuments } from "@/types/academic";

const ACCEPTED = ".pdf,.doc,.docx";
const MAX_BYTES = 15 * 1024 * 1024;

type FieldKey = "curriculumVitae" | "applicationLetter";

interface DocSlot {
  key: FieldKey;
  label: string;
  description: string;
  fileName: string;
  url: string;
  uploadedAt: string | null;
}

interface RequiredDocumentsCardProps {
  /** Application status string from the backend (e.g. "Draft", "Submitted", "Returned"). */
  applicationStatus?: string;
  /** When true the card is fully locked (no application started yet). Skips the document fetch. */
  locked?: boolean;
  /** Called after a successful upload so parents can refresh dependent state. */
  onUploaded?: (docs: ApplicationDocuments) => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
};

export const RequiredDocumentsCard = ({ applicationStatus, locked = false, onUploaded }: RequiredDocumentsCardProps) => {
  const [docs, setDocs] = useState<ApplicationDocuments | null>(null);
  const [loading, setLoading] = useState(!locked);
  const [uploading, setUploading] = useState<FieldKey | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const letterInputRef = useRef<HTMLInputElement>(null);

  const status = (applicationStatus || "").toLowerCase();
  const canEdit = !locked && (status === "" || status === "draft" || status === "returned" || status === "not-started");

  useEffect(() => {
    if (locked) return; // no application yet — skip
    let active = true;
    (async () => {
      try {
        const res = await nonAcademicService.getApplicationDocuments();
        if (active && res.success && res.data) setDocs(res.data);
      } catch (e) {
        console.error("Failed to load application documents", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handlePick = (key: FieldKey) => {
    if (!canEdit) return;
    if (key === "curriculumVitae") cvInputRef.current?.click();
    else letterInputRef.current?.click();
  };

  const handleUpload = async (key: FieldKey, file: File | null) => {
    if (!file) return;

    if (file.size > MAX_BYTES) {
      toast.error("File exceeds the 15 MB size limit");
      return;
    }
    const ext = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
    if (![".pdf", ".doc", ".docx"].includes(ext)) {
      toast.error("Only PDF or Word documents are allowed");
      return;
    }

    const formData = new FormData();
    formData.append(key === "curriculumVitae" ? "CurriculumVitae" : "ApplicationLetter", file);

    setUploading(key);
    try {
      const res = await nonAcademicService.uploadApplicationDocuments(formData);
      if (res.success && res.data) {
        setDocs(res.data);
        toast.success(
          key === "curriculumVitae"
            ? "Curriculum Vitae uploaded successfully"
            : "Application letter uploaded successfully",
        );
        onUploaded?.(res.data);
      } else {
        toast.error(res.message || "Failed to upload document");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while uploading");
    } finally {
      setUploading(null);
      if (cvInputRef.current) cvInputRef.current.value = "";
      if (letterInputRef.current) letterInputRef.current.value = "";
    }
  };

  const slots: DocSlot[] = [
    {
      key: "curriculumVitae",
      label: "Curriculum Vitae",
      description: "Your most recent CV in PDF or Word format (max 15 MB).",
      fileName: docs?.curriculumVitaeFileName || "",
      url: docs?.curriculumVitaeUrl || "",
      uploadedAt: docs?.curriculumVitaeUploadedAt || null,
    },
    {
      key: "applicationLetter",
      label: "Application Letter",
      description: "Letter addressed to the appropriate office formally requesting promotion.",
      fileName: docs?.applicationLetterFileName || "",
      url: docs?.applicationLetterUrl || "",
      uploadedAt: docs?.applicationLetterUploadedAt || null,
    },
  ];

  const allUploaded = !!docs?.curriculumVitaeFileName && !!docs?.applicationLetterFileName;

  return (
    <div className="card-elevated p-6 sm:p-8 space-y-5 animate-fade-in">
      <input
        ref={cvInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleUpload("curriculumVitae", e.target.files?.[0] || null)}
      />
      <input
        ref={letterInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleUpload("applicationLetter", e.target.files?.[0] || null)}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Required Documents
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Both documents must be uploaded before your application can be submitted for assessment.
            You may replace either file at any time while your application is in <span className="font-medium">Draft</span> or
            <span className="font-medium"> Returned</span> state.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0",
            allUploaded
              ? "bg-success-light text-success"
              : "bg-warning-light text-warning",
          )}
        >
          {allUploaded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              Action required
            </>
          )}
        </span>
      </div>

      {locked ? (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          Start your application above to unlock document uploads.
        </div>
      ) : !canEdit ? (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          Your application has been submitted. Documents can no longer be changed.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => {
          const uploaded = !!slot.fileName;
          const busy = uploading === slot.key;
          return (
            <div
              key={slot.key}
              className={cn(
                "border rounded-lg p-4 space-y-3 transition-colors",
                uploaded ? "border-success/40 bg-success-light/30" : "border-dashed border-border bg-muted/20",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    uploaded ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
                  )}
                >
                  {uploaded ? <CheckCircle2 className="w-5 h-5" /> : <FileUp className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{slot.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{slot.description}</p>
                </div>
              </div>

              {uploaded ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <p className="truncate font-medium text-foreground">{slot.fileName}</p>
                    {slot.uploadedAt && <p>Uploaded {formatDate(slot.uploadedAt)}</p>}
                  </div>
                  <div className="flex gap-2">
                    {slot.url && (
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <a href={slot.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!canEdit || busy}
                      onClick={() => handlePick(slot.key)}
                    >
                      {busy ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Uploading
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Replace
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="sm"
                  disabled={!canEdit || busy || loading}
                  onClick={() => handlePick(slot.key)}
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <FileUp className="w-3.5 h-3.5 mr-1.5" />
                      Upload {slot.label}
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
