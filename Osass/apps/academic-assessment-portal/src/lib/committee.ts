// Committee type -> display name. There is no backend field for this yet
// (committee membership only stores the short type code), so this stays a
// frontend lookup - kept in one place to avoid drift between pages.
const COMMITTEE_DISPLAY_NAMES: Record<string, string> = {
  DAPC: "Departmental Teaching Staff Promotion Committee",
  FAPSC: "Faculty Teaching Staff Promotion Sub-Committee",
  UAPC: "University Teaching Staff Promotion Committee",
};

export const getCommitteeDisplayName = (type: string) => COMMITTEE_DISPLAY_NAMES[type] || type;
