import { useState } from "react";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "./EventStatusBadge";
import { formatDashboardDate, formatLabel } from "@/lib/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";

function InfoRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <span className="text-sm font-medium text-muted-foreground sm:w-32">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium hover:text-foreground"
      >
        {isOpen ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
        {title}
      </button>
      {isOpen && <div className="rounded-md border bg-muted/50 p-4">{children}</div>}
    </div>
  );
}

function JsonDisplay({ data }) {
  return (
    <pre className="max-h-[400px] overflow-auto rounded bg-background p-4 text-xs">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}

export function EventDetailsDrawer({ event, open, onOpenChange }) {
  if (!event) return null;

  const hasAiInfo =
    event.aiSummary || event.aiPriority || event.aiSuggestedLabel;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Event Details</SheetTitle>
          <SheetDescription>
            View detailed information about this webhook event.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error Display */}
          {event.status === "FAILED" && event.errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                <div className="font-medium">Processing Failed</div>
                <div className="mt-1 text-sm">{event.errorMessage}</div>
                {event.failedAt && (
                  <div className="mt-2 text-xs">
                    Failed at: {formatDashboardDate(event.failedAt)}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* General Information */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium">General Information</h3>
            <div className="space-y-2">
              <InfoRow label="Repository" value={event.repositoryFullName} />
              <InfoRow label="Event Type" value={formatLabel(event.eventType)} />
              <InfoRow label="Action" value={event.action ? formatLabel(event.action) : null} />
              <InfoRow label="Sender" value={event.sender} />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-muted-foreground sm:w-32">
                  Status
                </span>
                <EventStatusBadge status={event.status} />
              </div>
              <InfoRow label="Received At" value={formatDashboardDate(event.receivedAt)} />
              <InfoRow label="Processed At" value={formatDashboardDate(event.processedAt)} />
            </div>
          </section>

          {/* AI Information */}
          {hasAiInfo && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium">AI Information</h3>
              <div className="space-y-2">
                {event.aiSummary && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      AI Summary
                    </span>
                    <p className="text-sm">{event.aiSummary}</p>
                  </div>
                )}
                {event.aiPriority && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <span className="text-sm font-medium text-muted-foreground sm:w-32">
                      AI Priority
                    </span>
                    <Badge variant="outline">{event.aiPriority}</Badge>
                  </div>
                )}
                {event.aiSuggestedLabel && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <span className="text-sm font-medium text-muted-foreground sm:w-32">
                      Suggested Label
                    </span>
                    <Badge>{event.aiSuggestedLabel}</Badge>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Raw Payload */}
          <CollapsibleSection title="Raw Event Payload" defaultOpen={false}>
            {event.payload ? (
              <JsonDisplay data={event.payload} />
            ) : (
              <p className="text-sm text-muted-foreground">No payload data available.</p>
            )}
          </CollapsibleSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
