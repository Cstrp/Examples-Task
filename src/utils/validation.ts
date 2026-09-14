import type { TaskDraft, ValidationErrors } from "../types";

export function validateTaskInput(draft: TaskDraft): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!draft.title.trim()) {
    errors.title = "Task title is required.";
  }

  if (!draft.description.trim()) {
    errors.description = "Task description is required.";
  }

  if (!draft.dueAt) {
    errors.dueAt = "Execution date and time is required.";
  } else {
    const dueDate = new Date(draft.dueAt);
    if (Number.isNaN(dueDate.getTime())) {
      errors.dueAt = "Please enter a valid date and time.";
    } else if (dueDate.getTime() < Date.now() - 60000) {
      errors.dueAt = "Due date cannot be in the past.";
    }
  }

  if (!draft.locationAddress.trim()) {
    errors.locationAddress = "Location address is required.";
  }

  if (draft.latitude.trim() || draft.longitude.trim()) {
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90.";
    }

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180.";
    }
  }

  return errors;
}

export function getReminderWarning(dueAt: string): string | null {
  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const minutesUntilDue = (dueDate.getTime() - Date.now()) / 60000;
  if (minutesUntilDue > 0 && minutesUntilDue < 30) {
    return "This task is due in under 30 minutes, so the reminder will be sent immediately as a fallback.";
  }

  return null;
}
