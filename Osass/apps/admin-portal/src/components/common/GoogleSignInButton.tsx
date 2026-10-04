import { GoogleSignInButton as SharedGoogleSignInButton } from "@osass/ui/google-sign-in-button";

export function GoogleSignInButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  return <SharedGoogleSignInButton clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} onCredential={onCredential} />;
}
