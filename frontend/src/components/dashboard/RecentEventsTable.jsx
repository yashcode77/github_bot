import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDashboardDate,
  formatLabel,
  getEventStatusVariant,
} from "@/lib/dashboard";

function RecentEventsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyEventsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Inbox className="size-5" />
      </div>
      <p className="text-sm font-medium">No recent events</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Webhook events will appear here once repositories start sending
        activity.
      </p>
    </div>
  );
}

export function RecentEventsTable({ events, isLoading }) {
  if (isLoading) {
    return <RecentEventsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest webhook events received across connected repositories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyEventsState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="font-medium">
                      {formatLabel(event.eventType)}
                    </div>
                    {event.action ? (
                      <div className="text-xs text-muted-foreground">
                        {formatLabel(event.action)}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {event.repositoryFullName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEventStatusVariant(event.status)}>
                      {formatLabel(event.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDashboardDate(event.receivedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
