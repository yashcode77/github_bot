import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const authError = searchParams.get("error");

  useEffect(() => {
    if (!authError) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSearchParams({}, { replace: true });
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [authError, setSearchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
          <CardDescription>
            Automate your GitHub repositories with configurable rules, webhook
            processing, and Slack notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError === "auth_failed" ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              GitHub authentication failed. Please try again.
            </p>
          ) : null}

          <Button className="w-full" size="lg" onClick={login}>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5 fill-current"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
