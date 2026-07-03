import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTION_TYPE_OPTIONS,
  createEmptyAction,
} from "@/lib/rules";

export function ActionBuilder({ actions, onChange }) {
  const handleAddAction = () => {
    onChange([...actions, createEmptyAction()]);
  };

  const handleRemoveAction = (index) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (index, field, value) => {
    onChange(
      actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action,
      ),
    );
  };

  const handleActionTypeChange = (index, newType) => {
    onChange(
      actions.map((action, i) =>
        i === index ? createEmptyAction(newType) : action,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <div key={index} className="flex gap-2">
          <Select
            value={action.type}
            onValueChange={(value) => handleActionTypeChange(index, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {action.type === "ADD_LABEL" && (
            <Input
              value={action.value}
              onChange={(e) =>
                handleActionChange(index, "value", e.target.value)
              }
              placeholder="Label name"
              className="flex-1"
            />
          )}

          {action.type === "ADD_COMMENT" && (
            <Textarea
              value={action.value}
              onChange={(e) =>
                handleActionChange(index, "value", e.target.value)
              }
              placeholder="Comment text"
              className="flex-1 min-h-[80px] resize-none"
              rows={3}
            />
          )}

          {action.type === "SLACK_NOTIFY" && (
            <div className="flex-1 text-sm text-muted-foreground">
              Sends Slack notification
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveAction(index)}
            disabled={actions.length === 1}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddAction}
        className="w-full"
      >
        Add Action
      </Button>
    </div>
  );
}
