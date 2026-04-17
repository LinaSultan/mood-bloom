import { Link, useLocation } from "react-router-dom";
import { Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <Link to="/" className="font-serif text-2xl tracking-tight text-foreground">
          MindEase
        </Link>
        <nav className="flex items-center gap-1">
          <NavBtn to="/" active={pathname === "/"} icon={<Home className="h-4 w-4" />} label="Home" />
          <NavBtn to="/dashboard" active={pathname === "/dashboard"} icon={<BarChart3 className="h-4 w-4" />} label="Insights" />
        </nav>
      </header>
      <main className="flex-1 px-6 pb-10 pt-2">{children}</main>
    </div>
  );
};

const NavBtn = ({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
      active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
    )}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Link>
);
