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
import {
  CONDITION_FIELD_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
  createEmptyCondition,
} from "@/lib/rules";

export function ConditionBuilder({ conditions, onChange }) {
  const handleAddCondition = () => {
    onChange([...conditions, createEmptyCondition()]);
  };

  const handleRemoveCondition = (index) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index, field, value) => {
    onChange(
      conditions.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => (
        <div key={`condition-${index}`} className="space-y-2">
          <div className="flex gap-2">
            <Select
              value={condition.field}
              onValueChange={(value) =>
                handleConditionChange(index, "field", value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_FIELD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={condition.operator}
              onValueChange={(value) =>
                handleConditionChange(index, "operator", value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPERATOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveCondition(index)}
              disabled={conditions.length === 0}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <Input
            value={condition.value ?? ""}
            onChange={(e) =>
              handleConditionChange(index, "value", e.target.value)
            }
            placeholder="Value"
            className="w-full"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddCondition}
        className="w-full"
      >
        Add Condition
      </Button>
    </div>
  );
}
