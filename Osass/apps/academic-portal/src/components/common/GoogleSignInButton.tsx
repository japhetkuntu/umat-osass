import { useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
    onCredential: (idToken: string) => void;
}

export const GoogleSignInButton = ({ onCredential }: GoogleSignInButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId || !window.google || !containerRef.current) {
            return;
        }

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => onCredential(response.credential),
        });

        window.google.accounts.id.renderButton(containerRef.current, {
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
