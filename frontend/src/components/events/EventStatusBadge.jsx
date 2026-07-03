import { Badge } from "@/components/ui/badge";
import { formatLabel, getEventStatusVariant } from "@/lib/dashboard";

export function EventStatusBadge({ status }) {
  return (
    <Badge variant={getEventStatusVariant(status)}>
      {formatLabel(status)}
    </Badge>
  );
}
