const buttonClass = (variant) =>
  variant === "danger"
    ? "adminDialogConfirm adminDialogDanger"
    : "adminDialogConfirm";

export const buildAdminDialogOptions = ({
  type = "alert",
  title = "",
  message = "",
  label = "",
  defaultValue = "",
  confirmText,
  cancelText = "Cancel",
  variant = "primary",
  icon,
  html,
} = {}) => {
  const base = {
    title,
    text: message,
    html,
    icon,
    background: "#ffffff",
    color: "#0f172a",
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
      popup: "adminDialogPopup",
      title: "adminDialogTitle",
      htmlContainer: "adminDialogBody",
      input: "adminDialogInput",
      actions: "adminDialogActions",
      confirmButton: buttonClass(variant),
      cancelButton: "adminDialogCancel",
    },
  };

  if (type === "confirm") {
    return {
      ...base,
      icon: icon || (variant === "danger" ? "warning" : "question"),
      showCancelButton: true,
      confirmButtonText: confirmText || "Confirm",
      cancelButtonText: cancelText,
    };
  }

  if (type === "prompt") {
    return {
      ...base,
      input: "text",
      inputLabel: label,
      inputValue: defaultValue,
      inputAutoFocus: true,
      showCancelButton: true,
      confirmButtonText: confirmText || "Save",
      cancelButtonText: cancelText,
      inputValidator: (value) =>
        String(value || "").trim() ? undefined : `${label || "Value"} is required`,
    };
  }

  return {
    ...base,
    icon: icon || "info",
    confirmButtonText: confirmText || "OK",
  };
};
