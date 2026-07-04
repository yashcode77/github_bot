import { NavLink } from "react-router-dom";
import {
  Activity,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/repositories", label: "Repositories", icon: GitBranch },
  { to: "/rules", label: "Rules", icon: ListChecks },
  { to: "/events", label: "Events", icon: Activity },
  { to: "/actions", label: "Actions", icon: Zap },
  { to: "/settings", label: "Slack Settings", icon: Settings },
];

export function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
          Automation
        </p>
        <h2 className="mt-1 text-lg font-semibold">{APP_NAME}</h2>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
