const EVENT_STATUS_VARIANTS = {
  RECEIVED: "secondary",
  PROCESSING: "outline",
  PROCESSED: "default",
  FAILED: "destructive",
  SKIPPED: "ghost",
};

const ACTION_STATUS_VARIANTS = {
  PENDING: "outline",
  SUCCESS: "default",
  FAILED: "destructive",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDashboardDate(value) {
  if (!value) {
    return "—";
  }

  return dateFormatter.format(new Date(value));
}

export function formatLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getEventStatusVariant(status) {
  return EVENT_STATUS_VARIANTS[status] ?? "outline";
}

export function getActionStatusVariant(status) {
  return ACTION_STATUS_VARIANTS[status] ?? "outline";
}

export function getBreakdownEntries(record = {}) {
  return Object.entries(record)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);
}

export function getBreakdownTotal(entries) {
  return entries.reduce((sum, entry) => sum + entry.count, 0);
}

export function getBreakdownPercent(count, total) {
  if (!total) {
    return 0;
  }

  return Math.round((count / total) * 100);
}
