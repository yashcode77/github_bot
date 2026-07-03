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
import { ActionStatusBadge } from "./ActionStatusBadge";
import { formatDashboardDate, formatLabel } from "@/lib/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="max-h-[400px]">
      <pre className="rounded bg-background p-4 text-xs">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </ScrollArea>
  );
}

export function ActionDetailsDrawer({ action, open, onOpenChange }) {
  if (!action) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Action Details</SheetTitle>
          <SheetDescription>
            View detailed information about this bot action.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Error Display */}
          {action.status === "FAILED" && action.errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                <div className="font-medium">Action Failed</div>
                <div className="mt-1 text-sm">{action.errorMessage}</div>
                {action.failureDetails && (
                  <div className="mt-2 text-xs">
                    {typeof action.failureDetails === 'string'
                      ? action.failureDetails
                      : JSON.stringify(action.failureDetails, null, 2)}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* General Information */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium">General Information</h3>
            <div className="space-y-2">
              <InfoRow label="Action Type" value={formatLabel(action.actionType)} />
              <InfoRow label="Repository" value={action.repositoryFullName} />
              <InfoRow label="Event Type" value={formatLabel(action.eventType)} />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                <span className="text-sm font-medium text-muted-foreground sm:w-32">
                  Status
                </span>
                <ActionStatusBadge status={action.status} />
              </div>
              <InfoRow label="Created At" value={formatDashboardDate(action.createdAt)} />
              <InfoRow label="Completed At" value={formatDashboardDate(action.completedAt)} />
            </div>
          </section>

          {/* Related Context */}
          {(action.ruleName || action.eventId) && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Related Context</h3>
              <div className="space-y-2">
                <InfoRow label="Rule" value={action.ruleName} />
                <InfoRow label="Event ID" value={action.eventId} />
              </div>
            </section>
          )}

          {/* Request Payload */}
          {action.requestPayload && (
            <CollapsibleSection title="Request Payload" defaultOpen={false}>
              <JsonDisplay data={action.requestPayload} />
            </CollapsibleSection>
          )}

          {/* Response Payload */}
          {action.responsePayload && (
            <CollapsibleSection title="Response Payload" defaultOpen={false}>
              <JsonDisplay data={action.responsePayload} />
            </CollapsibleSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
