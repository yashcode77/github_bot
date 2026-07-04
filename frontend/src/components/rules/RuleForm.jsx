import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ConditionBuilder } from "./ConditionBuilder";
import { ActionBuilder } from "./ActionBuilder";
import {
  EVENT_TYPE_OPTIONS,
  EVENT_ACTION_OPTIONS,
} from "@/lib/rules";

export function RuleForm({
  values,
  errors,
  repositories,
  isEdit,
  onChange,
}) {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Rule Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Label high-priority bugs"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Select
              value={values.repositoryId}
              onValueChange={(value) => handleChange("repositoryId", value)}
            >
              <SelectTrigger id="repository" className="w-full">
                <SelectValue placeholder="Select repository">
                  {values.repositoryId && (
                    <span className="truncate">
                      {repositories.find((r) => String(r.id) === values.repositoryId)?.fullName}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repository) => (
                  <SelectItem
                    key={repository.id}
                    value={String(repository.id)}
                    className="max-w-[420px]"
                  >
                    <span className="truncate block" title={repository.fullName}>
                      {repository.fullName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.repositoryId && (
              <p className="text-sm text-destructive">{errors.repositoryId}</p>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={values.eventType}
              onValueChange={(value) => handleChange("eventType", value)}
            >
              <SelectTrigger id="eventType">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="text-sm text-destructive">{errors.eventType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventAction">Event Action</Label>
            <Select
              value={values.eventAction}
              onValueChange={(value) => handleChange("eventAction", value)}
            >
              <SelectTrigger id="eventAction">
                <SelectValue placeholder="Select event action" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventAction && (
              <p className="text-sm text-destructive">{errors.eventAction}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Conditions</Label>
        <ConditionBuilder
          conditions={values.conditions}
          onChange={(conditions) => handleChange("conditions", conditions)}
        />
        {errors.conditions && (
          <p className="text-sm text-destructive">{errors.conditions}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Actions</Label>
        <ActionBuilder
          actions={values.actions}
          onChange={(actions) => handleChange("actions", actions)}
        />
        {errors.actions && (
          <p className="text-sm text-destructive">{errors.actions}</p>
        )}
      </div>
    </div>
  );
}
