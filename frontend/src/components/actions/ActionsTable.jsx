import { Inbox } from "lucide-react";
import { ActionStatusBadge } from "./ActionStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDashboardDate, formatLabel } from "@/lib/dashboard";

function ActionsTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function EmptyActionsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Inbox className="size-5" />
      </div>
      <p className="text-sm font-medium">No actions found</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        No bot actions match your current filters.
      </p>
    </div>
  );
}

export function ActionsTable({ actions, isLoading, onRowClick }) {
  if (isLoading) {
    return <ActionsTableSkeleton />;
  }

  if (actions.length === 0) {
    return <EmptyActionsState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action Type</TableHead>
            <TableHead>Repository</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Created At</TableHead>
            <TableHead className="text-right">Completed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => (
            <TableRow
              key={action.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(action)}
            >
              <TableCell className="font-medium">
                {formatLabel(action.actionType)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {action.repositoryFullName}
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {formatLabel(action.eventType)}
              </TableCell>
              <TableCell>
                <ActionStatusBadge status={action.status} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDashboardDate(action.createdAt)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDashboardDate(action.completedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
