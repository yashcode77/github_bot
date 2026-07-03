import { useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateRuleDialog } from "@/components/rules/CreateRuleDialog";
import { EditRuleDialog } from "@/components/rules/EditRuleDialog";
import { DeleteRuleDialog } from "@/components/rules/DeleteRuleDialog";
import { RulesTable } from "@/components/rules/RulesTable";
import { useRules } from "@/hooks/useRules";
import { useRepositories } from "@/hooks/useRepositories";
import {
  RULE_STATUS_FILTERS,
  ALL_EVENT_TYPE_FILTER,
  EVENT_TYPE_OPTIONS,
  filterRules,
} from "@/lib/rules";

export default function RulesPage() {
  const {
    rules,
    isLoading,
    error,
    refresh,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  } = useRules();

  const { repositories } = useRepositories();

  const [search, setSearch] = useState("");
  const [repositoryFilter, setRepositoryFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState(ALL_EVENT_TYPE_FILTER);
  const [statusFilter, setStatusFilter] = useState(RULE_STATUS_FILTERS[0].value);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const filteredRules = filterRules(rules, {
    search,
    repositoryFilter,
    eventTypeFilter,
    statusFilter,
  });

  const handleEditRequest = (rule) => {
    setSelectedRule(rule);
    setEditDialogOpen(true);
  };

  const handleDeleteRequest = (rule) => {
    setSelectedRule(rule);
    setDeleteDialogOpen(true);
  };

  const repositoryOptions = [
    { value: "all", label: "All Repositories" },
    ...repositories.map((repo) => ({
      value: repo.id,
      label: repo.fullName,
    })),
  ];

  const eventTypeOptions = [
    { value: ALL_EVENT_TYPE_FILTER, label: "All Event Types" },
    ...EVENT_TYPE_OPTIONS,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rules</h1>
          <p className="text-sm text-muted-foreground">
            Configure automation rules for webhook events.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Create Rule
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={repositoryFilter}
            onValueChange={setRepositoryFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Repository" />
            </SelectTrigger>
            <SelectContent>
              {repositoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={eventTypeFilter}
            onValueChange={setEventTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {RULE_STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RulesTable
        rules={filteredRules}
        repositories={repositories}
        isLoading={isLoading}
        onEdit={handleEditRequest}
        onDelete={handleDeleteRequest}
        onToggle={toggleRule}
      />

      <CreateRuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        repositories={repositories}
        onCreate={createRule}
      />

      <EditRuleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        repositories={repositories}
        rule={selectedRule}
        onUpdate={updateRule}
      />

      <DeleteRuleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        rule={selectedRule}
        onConfirm={deleteRule}
      />
    </div>
  );
}
