import { useState, useEffect } from 'react';
import { X, BarChart3, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'osass_onboarding_v1_dismissed';

const HIGHLIGHTS = [
  {
    icon: CheckCircle2,
    title: 'Check Your Eligibility',
    description: 'See if you meet the criteria to apply for a promotion right now.',
  },
  {
    icon: FileText,
    title: 'Submit a Promotion Application',
    description: 'Upload your teaching, publications, and service records for committee review.',
  },
  {
    icon: BarChart3,
    title: 'Forecast Your Career Path',
    description: 'View a roadmap of future milestones and what you need to reach each rank.',
  },
];

export function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
            Welcome to OSASS
          </p>
          <h2 className="text-base font-semibold text-foreground">
            Here's what you can do on this portal
          </h2>
        </div>
        <button
          onClick={dismiss}
          className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-lg bg-background/60 border border-border/60 p-3"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={dismiss} className="text-xs">
          Got it, let me explore
        </Button>
      </div>
    </div>
  );
}
