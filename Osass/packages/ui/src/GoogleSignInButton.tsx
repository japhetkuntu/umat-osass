interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (parent: HTMLElement, options: { theme: string; size: string; width: string }) => void;
    };
  };
}

import { useEffect, useRef } from "react";

export interface GoogleSignInButtonProps {
    clientId?: string;
    onCredential: (idToken: string) => void;
}

export const GoogleSignInButton = ({ clientId, onCredential }: GoogleSignInButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const google = (window as Window & { google?: GoogleIdentity }).google;
        if (!clientId || !google || !containerRef.current) {
            return;
        }

        google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => onCredential(response.credential),
        });

        google.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
        });
    }, [clientId, onCredential]);

    if (!clientId) {
        return null;
    }

    return <div ref={containerRef} className="w-full flex justify-center" />;
};
