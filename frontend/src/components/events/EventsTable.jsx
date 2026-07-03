import { Inbox } from "lucide-react";
import { EventStatusBadge } from "./EventStatusBadge";
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

function EventsTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

function EmptyEventsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Inbox className="size-5" />
      </div>
      <p className="text-sm font-medium">No events found</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        No webhook events match your current filters.
      </p>
    </div>
  );
}

export function EventsTable({ events, isLoading, onRowClick }) {
  if (isLoading) {
    return <EventsTableSkeleton />;
  }

  if (events.length === 0) {
    return <EmptyEventsState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Type</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Repository</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Received At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(event)}
            >
              <TableCell className="font-medium">
                {formatLabel(event.eventType)}
              </TableCell>
              <TableCell>
                {event.action ? formatLabel(event.action) : "—"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {event.repositoryFullName}
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {event.sender || "—"}
              </TableCell>
              <TableCell>
                <EventStatusBadge status={event.status} />
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDashboardDate(event.receivedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
