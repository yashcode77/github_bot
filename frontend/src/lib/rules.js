import { formatDashboardDate } from "@/lib/dashboard";

export const EVENT_TYPE_OPTIONS = [
  { value: "issues", label: "Issues" },
  { value: "pull_request", label: "Pull Request" },
];

export const EVENT_ACTION_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "opened", label: "Opened" },
];

export const CONDITION_FIELD_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "body", label: "Body" },
  { value: "sender", label: "Sender" },
  { value: "action", label: "Action" },
];

export const CONDITION_OPERATOR_OPTIONS = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts With" },
];

export const ACTION_TYPE_OPTIONS = [
  { value: "ADD_LABEL", label: "Add Label" },
  { value: "ADD_COMMENT", label: "Add Comment" },
  { value: "SLACK_NOTIFY", label: "Slack Notify" },
];

export const RULE_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

export const ALL_EVENT_TYPE_FILTER = "all";

export function createEmptyCondition() {
  return {
    field: "title",
    operator: "contains",
    value: "",
  };
}

export function createEmptyAction(type = "ADD_LABEL") {
  if (type === "SLACK_NOTIFY") {
    return { type: "SLACK_NOTIFY" };
  }

  return { type, value: "" };
}

export function createEmptyRuleForm() {
  return {
    name: "",
    repositoryId: "",
    eventType: "issues",
    eventAction: "any",
    conditions: [],
    actions: [createEmptyAction()],
  };
}

export function ruleToFormValues(rule) {
  return {
    name: rule.name ?? "",
    repositoryId: rule.repositoryId ?? "",
    eventType: rule.eventType ?? "issues",
    eventAction: rule.eventAction ?? "any",
    conditions: Array.isArray(rule.conditions)
      ? rule.conditions.map((condition) => ({ ...condition }))
      : [],
    actions: Array.isArray(rule.actions) && rule.actions.length > 0
      ? rule.actions.map((action) => ({ ...action }))
      : [createEmptyAction()],
  };
}

export function getEventTypeLabel(eventType) {
  return (
    EVENT_TYPE_OPTIONS.find((option) => option.value === eventType)?.label ??
    eventType
  );
}

export function getEventActionLabel(eventAction) {
  if (!eventAction || eventAction === "any") {
    return "Any";
  }

  return (
    EVENT_ACTION_OPTIONS.find((option) => option.value === eventAction)?.label ??
    eventAction
  );
}

export function getActionTypeLabel(type) {
  return (
    ACTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

export function getRuleStatusLabel(isEnabled) {
  return isEnabled ? "Enabled" : "Disabled";
}

export function getRuleStatusVariant(isEnabled) {
  return isEnabled ? "default" : "secondary";
}

export function formatRuleDate(value) {
  return formatDashboardDate(value);
}

export function getRepositoryLabel(repositories, repositoryId) {
  const repository = repositories.find((entry) => entry.id === repositoryId);

  if (!repository) {
    return "Unknown repository";
  }

  return repository.fullName ?? `${repository.owner}/${repository.name}`;
}

export function filterRules(rules, { search, repositoryFilter, eventTypeFilter, statusFilter }) {
  const query = search.trim().toLowerCase();

  return rules.filter((rule) => {
    const matchesSearch = !query || rule.name.toLowerCase().includes(query);

    const matchesRepository =
      !repositoryFilter ||
      repositoryFilter === "all" ||
      rule.repositoryId === repositoryFilter;

    const matchesEventType =
      !eventTypeFilter ||
      eventTypeFilter === ALL_EVENT_TYPE_FILTER ||
      rule.eventType === eventTypeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && rule.isEnabled) ||
      (statusFilter === "disabled" && !rule.isEnabled);

    return matchesSearch && matchesRepository && matchesEventType && matchesStatus;
  });
}

export function validateRuleForm(values, { isEdit = false } = {}) {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = "Rule name is required";
  }

  if (!isEdit && !values.repositoryId) {
    errors.repositoryId = "Repository is required";
  }

  if (!values.eventType) {
    errors.eventType = "Event type is required";
  }

  if (!values.eventAction) {
    errors.eventAction = "Event action is required";
  }

  const invalidConditions = values.conditions.some(
    (condition) => !condition.field || !condition.operator || !condition.value?.trim(),
  );

  if (invalidConditions) {
    errors.conditions = "Each condition must have a field, operator, and value";
  }

  if (!values.actions?.length) {
    errors.actions = "At least one action is required";
  } else {
    const invalidActions = values.actions.some((action) => {
      if (!action.type) {
        return true;
      }

      if (action.type === "SLACK_NOTIFY") {
        return false;
      }

      return !action.value?.trim();
    });

    if (invalidActions) {
      errors.actions = "Each action must be complete. Label and comment actions require a value.";
    }
  }

  return errors;
}

export function buildRulePayload(values, { isEdit = false } = {}) {
  const payload = {
    name: values.name.trim(),
    eventType: values.eventType,
    conditions: values.conditions.map((condition) => ({
      field: condition.field,
      operator: condition.operator,
      value: condition.value.trim(),
    })),
    actions: values.actions.map((action) => {
      if (action.type === "SLACK_NOTIFY") {
        return { type: "SLACK_NOTIFY" };
      }

      return {
        type: action.type,
        value: action.value.trim(),
      };
    }),
  };

  if (values.eventAction && values.eventAction !== "any") {
    payload.eventAction = values.eventAction;
  }

  if (!isEdit) {
    payload.repositoryId = values.repositoryId;
  }

  return payload;
}
