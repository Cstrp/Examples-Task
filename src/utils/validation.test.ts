import test from "node:test";
import assert from "node:assert/strict";

import { validateTaskInput } from "./validation";

test("validateTaskInput rejects missing required fields", () => {
  const errors = validateTaskInput({
    title: "",
    description: "",
    dueAt: "2020-01-01T10:00",
    status: "New",
    locationAddress: "",
    latitude: "",
    longitude: "",
  });

  assert.equal(errors.title, "Task title is required.");
  assert.equal(errors.description, "Task description is required.");
  assert.equal(errors.dueAt, "Due date cannot be in the past.");
  assert.equal(errors.locationAddress, "Location address is required.");
});

test("validateTaskInput accepts valid task input", () => {
  const errors = validateTaskInput({
    title: "Meter inspection",
    description: "Verify the equipment and complete notes.",
    dueAt: new Date(Date.now() + 3600000).toISOString(),
    status: "In Progress",
    locationAddress: "17 Park Road",
    latitude: "-33.8688",
    longitude: "151.2093",
  });

  assert.deepEqual(errors, {});
});
