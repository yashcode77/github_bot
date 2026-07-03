import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { slackSettings, isLoading, updateSlackSettings } = useSettings();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slackSettings?.webhookUrl) {
      setWebhookUrl(slackSettings.webhookUrl);
    }
  }, [slackSettings]);

  const handleSave = async () => {
    setError("");

    if (!webhookUrl.trim()) {
      setError("Webhook URL is required");
      return;
    }

    if (!isValidWebhookUrl(webhookUrl)) {
      setError("Please enter a valid Slack webhook URL");
      return;
    }

    setIsSaving(true);
    const success = await updateSlackSettings({ webhookUrl: webhookUrl.trim() });
    setIsSaving(false);

    if (success) {
      setError("");
    }
  };

  const isValidWebhookUrl = (url) => {
    try {
      const parsed = new URL(url);
      return (
        parsed.protocol === "https:" &&
        parsed.hostname.includes("slack.com") &&
        parsed.pathname.includes("services")
      );
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your integration settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>
            Configure Slack incoming webhook to receive notifications for bot
            actions and events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Slack Incoming Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              disabled={isLoading || isSaving}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Create an incoming webhook in your Slack workspace and paste the
              URL here.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
