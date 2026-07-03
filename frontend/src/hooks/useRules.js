import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ruleService } from "@/services/rule.service";

export function useRules() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await ruleService.listRules();
      setRules(data.rules ?? []);
    } catch (requestError) {
      setRules([]);
      setError(requestError.message ?? "Failed to load rules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (payload) => {
      try {
        const { data } = await ruleService.createRule(payload);
        setRules((current) => [data.rule, ...current]);
        toast.success("Rule created successfully");
        return true;
      } catch (requestError) {
        toast.error(requestError.message ?? "Failed to create rule");
        return false;
      }
    },
    [],
  );

  const updateRule = useCallback(async (id, payload) => {
    try {
      const { data } = await ruleService.updateRule(id, payload);
      setRules((current) =>
        current.map((rule) => (rule.id === id ? data.rule : rule)),
      );
      toast.success("Rule updated successfully");
      return true;
    } catch (requestError) {
      toast.error(requestError.message ?? "Failed to update rule");
      return false;
    }
  }, []);

  const deleteRule = useCallback(async (id) => {
    try {
      await ruleService.deleteRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
      toast.success("Rule deleted successfully");
      return true;
    } catch (requestError) {
      toast.error(requestError.message ?? "Failed to delete rule");
      return false;
    }
  }, []);

  const toggleRule = useCallback(async (id, isEnabled) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, isEnabled } : rule,
      ),
    );

    try {
      await ruleService.updateRule(id, { isEnabled });
      toast.success(isEnabled ? "Rule enabled" : "Rule disabled");
      return true;
    } catch (requestError) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === id ? { ...rule, isEnabled: !isEnabled } : rule,
        ),
      );
      toast.error(requestError.message ?? "Failed to update rule status");
      return false;
    }
  }, []);

  return {
    rules,
    isLoading,
    error,
    refresh: fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
}
