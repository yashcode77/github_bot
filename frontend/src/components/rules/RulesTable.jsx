import { MoreHorizontal, Power, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEventTypeLabel,
  getEventActionLabel,
  getRuleStatusLabel,
  getRuleStatusVariant,
  formatRuleDate,
  getRepositoryLabel,
} from "@/lib/rules";

function RulesTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Repository</TableHead>
          <TableHead>Event Type</TableHead>
          <TableHead>Event Action</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyRulesState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <p className="text-sm font-medium">No rules configured</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Create rules to automate actions based on webhook events.
      </p>
    </div>
  );
}

export function RulesTable({
  rules,
  repositories,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}) {
  if (isLoading) {
    return <RulesTableSkeleton />;
  }

  if (rules.length === 0) {
    return <EmptyRulesState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Repository</TableHead>
          <TableHead>Event Type</TableHead>
          <TableHead>Event Action</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell className="font-medium">{rule.name}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {getRepositoryLabel(repositories, rule.repositoryId)}
            </TableCell>
            <TableCell>{getEventTypeLabel(rule.eventType)}</TableCell>
            <TableCell>{getEventActionLabel(rule.eventAction)}</TableCell>
            <TableCell>
              <Badge variant={getRuleStatusVariant(rule.isEnabled)}>
                {getRuleStatusLabel(rule.isEnabled)}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatRuleDate(rule.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Switch
                  checked={rule.isEnabled}
                  onCheckedChange={() => onToggle(rule.id, !rule.isEnabled)}
                  aria-label="Toggle rule status"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(rule)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(rule)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
