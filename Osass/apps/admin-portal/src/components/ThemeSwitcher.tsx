import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx"; // Utility for conditional class names

export const ThemeSwitcher = () => {
  try {
    const { theme, setTheme, isDark } = useTheme();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative w-9 h-9 hover:bg-white/20"
            title={`Current theme: ${theme}`}
          >
            {isDark ? (
              <Moon
                className={clsx(
                  "h-4 w-4 transition-all",
                  isDark ? "text-white" : "text-black"
                )}
              />
            ) : (
              <Sun
                className={clsx(
                  "h-4 w-4 transition-all",
                  isDark ? "text-white" : "text-black"
                )}
              />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Theme
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="gap-2 cursor-pointer"
          >
            <Sun className="h-4 w-4 text-black" />
            <span>Light</span>
            {theme === "light" && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="gap-2 cursor-pointer"
          >
            <Moon className="h-4 w-4 text-white" />
            <span>Dark</span>
            {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="gap-2 cursor-pointer"
          >
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span>System</span>
            {theme === "system" && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } catch (error) {
    console.error("ThemeSwitcher error:", error);
    return null;
  }
};
