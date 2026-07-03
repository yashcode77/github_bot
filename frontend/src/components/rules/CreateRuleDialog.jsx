import { useState } from "react";
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
  createEmptyRuleForm,
  validateRuleForm,
  buildRulePayload,
} from "@/lib/rules";

export function CreateRuleDialog({ open, onOpenChange, repositories, onCreate }) {
  const [values, setValues] = useState(createEmptyRuleForm());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRuleForm(values, { isEdit: false });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const payload = buildRulePayload(values, { isEdit: false });
    const success = await onCreate(payload);

    setIsSubmitting(false);

    if (success) {
      setValues(createEmptyRuleForm());
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setValues(createEmptyRuleForm());
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Rule</DialogTitle>
          <DialogDescription>
            Define automation rules for webhook events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <RuleForm
            values={values}
            errors={errors}
            repositories={repositories}
            isEdit={false}
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
              {isSubmitting ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
