import { Sun } from "lucide-react";

export const ThemeSwitcher = () => (
  <span title="Light theme" className="inline-flex items-center justify-center w-9 h-9">
    <Sun className="h-4 w-4" />
    <span className="sr-only">Light theme</span>
  </span>
);
