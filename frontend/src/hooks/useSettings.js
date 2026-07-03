import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { settingsService } from "@/services/settings.service";

export function useSettings() {
  const [slackSettings, setSlackSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlackSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await settingsService.getSlackSettings();
      setSlackSettings(data.data || {});
    } catch (requestError) {
      setSlackSettings({});
      setError(requestError.message ?? "Failed to load Slack settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlackSettings();
  }, [fetchSlackSettings]);

  const updateSlackSettings = useCallback(
    async (payload) => {
      try {
        await settingsService.updateSlackSettings(payload);
        toast.success("Slack settings updated successfully");
        await fetchSlackSettings();
        return true;
      } catch (requestError) {
        toast.error(requestError.message ?? "Failed to update Slack settings");
        return false;
      }
    },
    [fetchSlackSettings],
  );

  return {
    slackSettings,
    isLoading,
    error,
    refresh: fetchSlackSettings,
    updateSlackSettings,
  };
}
