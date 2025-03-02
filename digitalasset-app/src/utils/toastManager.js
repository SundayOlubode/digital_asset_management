// Import using named exports instead of default export
import { toast } from "react-toastify";

// A wrapper for toast functionality to prevent errors
const safeToast = {
  // Success notification
  success: (message, options = {}) => {
    if (typeof toast?.success === "function") {
      return toast.success(message, options);
    } else {
      console.log("Success:", message);
      return null;
    }
  },

  // Error notification
  error: (message, options = {}) => {
    if (typeof toast?.error === "function") {
      return toast.error(message, options);
    } else {
      console.error("Error:", message);
      return null;
    }
  },

  // Info notification
  info: (message, options = {}) => {
    if (typeof toast?.info === "function") {
      return toast.info(message, options);
    } else {
      console.info("Info:", message);
      return null;
    }
  },

  // Warning notification
  warning: (message, options = {}) => {
    if (typeof toast?.warning === "function") {
      return toast.warning(message, options);
    } else {
      console.warn("Warning:", message);
      return null;
    }
  },

  // Update an existing toast
  update: (id, options) => {
    if (id && typeof toast?.update === "function") {
      // Convert type string to the actual toast type if needed
      if (options.type && typeof options.type === "string" && toast.TYPE) {
        switch (options.type) {
          case "success":
            options.type = toast.TYPE.SUCCESS;
            break;
          case "error":
            options.type = toast.TYPE.ERROR;
            break;
          case "info":
            options.type = toast.TYPE.INFO;
            break;
          case "warning":
            options.type = toast.TYPE.WARNING;
            break;
        }
      }
      return toast.update(id, options);
    } else {
      console.log("Update toast:", options);
      return null;
    }
  },

  // Close a toast
  dismiss: (id) => {
    if (typeof toast?.dismiss === "function") {
      if (id) {
        return toast.dismiss(id);
      } else {
        return toast.dismiss();
      }
    } else {
      console.log("Dismiss toast:", id);
      return null;
    }
  },
};

export default safeToast;
