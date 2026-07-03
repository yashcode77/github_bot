import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initials = user?.githubLogin?.slice(0, 2).toUpperCase() ?? "GH";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Avatar size="sm">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.githubLogin} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-medium">
            {user?.displayName ?? user?.githubLogin}
          </p>
          {user?.displayName ? (
            <p className="truncate text-xs text-muted-foreground">
              @{user.githubLogin}
            </p>
          ) : null}
        </div>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
