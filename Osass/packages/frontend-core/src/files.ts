export const getEvidenceFileName = (url: string): string => {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(pathname.slice(pathname.lastIndexOf("/") + 1)) || "Document";
  } catch {
    return "Document";
  }
};

export const UPLOAD_ACCEPT = ".pdf,.png,.jpg,.jpeg,.docx,.xlsx";

export const validateUploadFiles = (files: File[]): string | null => {
  for (const file of files) {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!UPLOAD_ACCEPT.split(",").includes(extension)) {
      return `Unsupported file "${file.name}". Choose PDF, PNG, JPG, JPEG, DOCX or XLSX.`;
    }
    if (file.size > 20 * 1024 * 1024) {
      return `"${file.name}" exceeds the 20 MB limit.`;
    }
  }
  return null;
};
