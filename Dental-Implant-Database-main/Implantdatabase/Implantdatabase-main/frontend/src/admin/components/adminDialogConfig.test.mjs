import assert from "node:assert/strict";
import { buildAdminDialogOptions } from "./adminDialogConfig.js";

const alertOptions = buildAdminDialogOptions({
  type: "alert",
  title: "Saved",
  message: "The item has been saved.",
});

assert.equal(alertOptions.title, "Saved");
assert.equal(alertOptions.text, "The item has been saved.");
assert.equal(alertOptions.confirmButtonText, "OK");
assert.equal(alertOptions.customClass.popup, "adminDialogPopup");

const confirmOptions = buildAdminDialogOptions({
  type: "confirm",
  title: "Delete item?",
  message: "This action cannot be undone.",
  confirmText: "Delete",
  variant: "danger",
});

assert.equal(confirmOptions.showCancelButton, true);
assert.equal(confirmOptions.confirmButtonText, "Delete");
assert.equal(confirmOptions.customClass.confirmButton, "adminDialogConfirm adminDialogDanger");

const promptOptions = buildAdminDialogOptions({
  type: "prompt",
  title: "Add Level",
  label: "Level name",
  defaultValue: "Bone",
});

assert.equal(promptOptions.input, "text");
assert.equal(promptOptions.inputLabel, "Level name");
assert.equal(promptOptions.inputValue, "Bone");

console.log("admin dialog config tests passed");
