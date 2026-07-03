import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RuleForm } from "./RuleForm";
import {
  ruleToFormValues,
  validateRuleForm,
  buildRulePayload,
  createEmptyRuleForm,
} from "@/lib/rules";

export function EditRuleDialog({ open, onOpenChange, repositories, rule, onUpdate }) {
  const [values, setValues] = useState(createEmptyRuleForm());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rule) {
      setValues(ruleToFormValues(rule));
      setErrors({});
    }
  }, [rule]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRuleForm(values, { isEdit: true });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const payload = buildRulePayload(values, { isEdit: true });
    const success = await onUpdate(rule.id, payload);

    setIsSubmitting(false);

    if (success) {
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rule</DialogTitle>
          <DialogDescription>
            Update the automation rule configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <RuleForm
            values={values}
            errors={errors}
            repositories={repositories}
            isEdit={true}
            onChange={setValues}
          />

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
