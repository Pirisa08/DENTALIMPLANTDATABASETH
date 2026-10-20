import Swal from "sweetalert2";
import { buildAdminDialogOptions } from "./adminDialogConfig.js";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const adminAlert = async ({
  title = "Notice",
  message = "",
  icon = "info",
  confirmText = "OK",
} = {}) => {
  await Swal.fire(
    buildAdminDialogOptions({
      type: "alert",
      title,
      message,
      icon,
      confirmText,
    })
  );
};

export const adminConfirm = async ({
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
} = {}) => {
  const result = await Swal.fire(
    buildAdminDialogOptions({
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText,
      variant,
    })
  );

  return result.isConfirmed;
};

export const adminPrompt = async ({
  title = "Enter value",
  message = "",
  label = "Name",
  defaultValue = "",
  confirmText = "Save",
} = {}) => {
  const result = await Swal.fire(
    buildAdminDialogOptions({
      type: "prompt",
      title,
      message,
      label,
      defaultValue,
      confirmText,
    })
  );

  if (!result.isConfirmed) return null;
  return String(result.value || "").trim();
};

export const adminForm = async ({
  title = "Enter details",
  fields = [],
  confirmText = "Save",
} = {}) => {
  const html = fields
    .map(
      (field) => `
        <label class="adminDialogField">
          <span>${field.label || field.name}</span>
          <input
            id="admin-dialog-${field.name}"
            class="swal2-input adminDialogInlineInput"
            type="${field.type || "text"}"
            value="${escapeHtml(field.defaultValue)}"
            placeholder="${escapeHtml(field.placeholder)}"
          />
        </label>
      `
    )
    .join("");

  const result = await Swal.fire({
    ...buildAdminDialogOptions({
      type: "confirm",
      title,
      html,
      confirmText,
    }),
    focusConfirm: false,
    preConfirm: () => {
      const values = {};

      for (const field of fields) {
        const input = document.getElementById(`admin-dialog-${field.name}`);
        const value = String(input?.value || "").trim();

        if (field.required && !value) {
          Swal.showValidationMessage(`${field.label || field.name} is required`);
          return false;
        }

        values[field.name] = value;
      }

      return values;
    },
  });

  if (!result.isConfirmed) return null;
  return result.value;
};
