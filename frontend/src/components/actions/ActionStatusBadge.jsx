import { Badge } from "@/components/ui/badge";
import { formatLabel, getActionStatusVariant } from "@/lib/dashboard";

export function ActionStatusBadge({ status }) {
  return (
    <Badge variant={getActionStatusVariant(status)}>
      {formatLabel(status)}
    </Badge>
  );
}
