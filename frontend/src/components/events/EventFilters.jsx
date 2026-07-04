import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EVENT_TYPE_FILTERS = [
  { label: "All Event Types", value: "" },
  { label: "Issues", value: "issues" },
  { label: "Pull Request", value: "pull_request" },
  { label: "Push", value: "push" },
];

const STATUS_FILTERS = [
  { label: "All Statuses", value: "" },
  { label: "Received", value: "RECEIVED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Processed", value: "PROCESSED" },
  { label: "Failed", value: "FAILED" },
  { label: "Skipped", value: "SKIPPED" },
];

export function EventFilters({
  search,
  onSearchChange,
  eventTypeFilter,
  onEventTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  repositoryFilter,
  onRepositoryFilterChange,
  repositories,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by repository, sender, or event type..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {repositories && repositories.length > 0 && (
          <Select
            value={repositoryFilter}
            onValueChange={onRepositoryFilterChange}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All Repositories">
                {repositoryFilter ? (
                  <span className="truncate">
                    {repositories.find((r) => r.id === repositoryFilter)?.fullName}
                  </span>
                ) : (
                  <span>All Repositories</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Repositories</SelectItem>
              {repositories.map((repo) => (
                <SelectItem key={repo.id} value={repo.id} className="max-w-[400px]">
                  <span className="truncate block" title={repo.fullName}>
                    {repo.fullName}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={eventTypeFilter} onValueChange={onEventTypeFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
