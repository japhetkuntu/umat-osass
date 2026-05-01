import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand
      closeButton
      duration={4500}
      gap={10}
      visibleToasts={4}
      icons={{
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
        loading: <Loader2 className="h-5 w-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: [
            "group toast pointer-events-auto",
            "flex items-start gap-3 w-full p-4 pr-10",
            "rounded-xl border shadow-xl backdrop-blur",
            "bg-background/95 text-foreground border-border",
            "data-[type=success]:border-l-4 data-[type=success]:border-l-[hsl(var(--success))]",
            "data-[type=success]:bg-[hsl(var(--success-light))] data-[type=success]:text-[hsl(var(--success))]",
            "data-[type=error]:border-l-4 data-[type=error]:border-l-[hsl(var(--destructive))]",
            "data-[type=error]:bg-[hsl(var(--destructive)/0.08)] data-[type=error]:text-[hsl(var(--destructive))]",
            "data-[type=warning]:border-l-4 data-[type=warning]:border-l-[hsl(var(--warning))]",
            "data-[type=warning]:bg-[hsl(var(--warning-light))] data-[type=warning]:text-[hsl(var(--warning-foreground))]",
            "data-[type=info]:border-l-4 data-[type=info]:border-l-[hsl(var(--info))]",
            "data-[type=info]:bg-[hsl(var(--info-light))] data-[type=info]:text-[hsl(var(--info))]",
            "data-[type=loading]:border-l-4 data-[type=loading]:border-l-[hsl(var(--primary))]",
          ].join(" "),
          title: "text-sm font-semibold leading-snug",
          description: "text-xs leading-relaxed text-foreground/75 mt-0.5",
          icon: [
            "shrink-0 mt-0.5 inline-flex items-center justify-center",
            "h-7 w-7 rounded-full",
            "data-[type=success]:bg-[hsl(var(--success))] data-[type=success]:text-white",
            "data-[type=error]:bg-[hsl(var(--destructive))] data-[type=error]:text-white",
            "data-[type=warning]:bg-[hsl(var(--warning))] data-[type=warning]:text-[hsl(var(--warning-foreground))]",
            "data-[type=info]:bg-[hsl(var(--info))] data-[type=info]:text-white",
            "data-[type=loading]:bg-[hsl(var(--primary)/0.12)] data-[type=loading]:text-[hsl(var(--primary))]",
          ].join(" "),
          actionButton:
            "group-[.toast]:bg-foreground group-[.toast]:text-background hover:group-[.toast]:opacity-90 rounded-md px-2.5 py-1 text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium",
          closeButton:
            "!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0 !bg-transparent !border-0 !text-foreground/60 hover:!text-foreground !shadow-none",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
