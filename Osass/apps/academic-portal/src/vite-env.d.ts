/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IDENTITY_API_URL?: string;
  readonly VITE_ACADEMIC_API_URL?: string;
  // Landing-page links to sibling OSASS portals
  readonly VITE_ACADEMIC_PORTAL_URL?: string;
  readonly VITE_NON_ACADEMIC_PORTAL_URL?: string;
  readonly VITE_ACADEMIC_ASSESSMENT_PORTAL_URL?: string;
  readonly VITE_NON_ACADEMIC_ASSESSMENT_PORTAL_URL?: string;
  readonly VITE_ADMIN_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
