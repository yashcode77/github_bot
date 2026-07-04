import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTION_TYPE_FILTERS = [
  { label: "All Action Types", value: "" },
  { label: "Add Label", value: "ADD_LABEL" },
  { label: "Add Comment", value: "ADD_COMMENT" },
  { label: "Slack Notify", value: "SLACK_NOTIFY" },
];

const STATUS_FILTERS = [
  { label: "All Statuses", value: "" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Pending", value: "PENDING" },
];

export function ActionFilters({
  search,
  onSearchChange,
  actionTypeFilter,
  onActionTypeFilterChange,
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
          placeholder="Search by repository, action type, or event type..."
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

        <Select value={actionTypeFilter} onValueChange={onActionTypeFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPE_FILTERS.map((filter) => (
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
