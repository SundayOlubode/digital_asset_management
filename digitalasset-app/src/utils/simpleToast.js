/**
 * A simple toast notification system without external dependencies
 */

// Create toast container if it doesn't exist
const createToastContainer = () => {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  return container;
};

// Create a single toast element
const createToast = (message, type) => {
  const toast = document.createElement("div");

  // Set styles based on type
  toast.style.minWidth = "300px";
  toast.style.maxWidth = "500px";
  toast.style.margin = "10px";
  toast.style.padding = "15px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  toast.style.backgroundColor = "#1e293b";
  toast.style.color = "white";
  toast.style.fontFamily = "Inter, system-ui, sans-serif";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "all 0.3s ease";
  toast.style.display = "flex";
  toast.style.justifyContent = "space-between";
  toast.style.alignItems = "flex-start";

  // Add border based on type
  toast.style.borderLeft = "4px solid";

  switch (type) {
    case "success":
      toast.style.borderLeftColor = "#10b981";
      break;
    case "error":
      toast.style.borderLeftColor = "#ef4444";
      break;
    case "info":
      toast.style.borderLeftColor = "#3b82f6";
      break;
    case "warning":
      toast.style.borderLeftColor = "#f59e0b";
      break;
    default:
      toast.style.borderLeftColor = "#3b82f6";
  }

  // Create message container
  const messageDiv = document.createElement("div");
  messageDiv.style.flex = "1";
  messageDiv.textContent = message;

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.style.background = "none";
  closeButton.style.border = "none";
  closeButton.style.color = "#9ca3af";
  closeButton.style.fontSize = "18px";
  closeButton.style.cursor = "pointer";
  closeButton.style.marginLeft = "10px";
  closeButton.style.marginRight = "5px";
  closeButton.style.opacity = "0.7";
  closeButton.style.transition = "opacity 0.2s";
  closeButton.onmouseover = () => {
    closeButton.style.opacity = "1";
  };
  closeButton.onmouseout = () => {
    closeButton.style.opacity = "0.7";
  };
  closeButton.onclick = () => {
    removeToast(toast);
  };

  // Add message and close button to toast
  toast.appendChild(messageDiv);
  toast.appendChild(closeButton);

  return toast;
};

// Add toast to container
const showToast = (toast, container, duration = 5000) => {
  container.appendChild(toast);

  // Trigger reflow to enable transition
  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);

  // Auto-remove after duration
  if (duration !== Infinity) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }

  return toast;
};

// Remove toast with animation
const removeToast = (toast) => {
  toast.style.opacity = "0";
  toast.style.height = toast.offsetHeight + "px";

  setTimeout(() => {
    toast.style.padding = "0";
    toast.style.height = "0";
    toast.style.margin = "0";

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 300);
};

// Public API
const simpleToast = {
  // Success toast
  success: (message, duration = 5000) => {
    const container = createToastContainer();
    const toast = createToast(message, "success");
    return showToast(toast, container, duration);
  },

  // Error toast
  error: (message, duration = 5000) => {
    const container = createToastContainer();
    const toast = createToast(message, "error");
    return showToast(toast, container, duration);
  },

  // Info toast
  info: (message, duration = 5000) => {
    const container = createToastContainer();
    const toast = createToast(message, "info");
    return showToast(toast, container, duration);
  },

  // Warning toast
  warning: (message, duration = 5000) => {
    const container = createToastContainer();
    const toast = createToast(message, "warning");
    return showToast(toast, container, duration);
  },

  // Remove a specific toast
  dismiss: (toast) => {
    if (toast) {
      removeToast(toast);
    }
  },

  // Remove all toasts
  dismissAll: () => {
    const container = document.getElementById("toast-container");
    if (container) {
      const toasts = container.querySelectorAll("div");
      toasts.forEach((toast) => {
        removeToast(toast);
      });
    }
  },
};

export default simpleToast;
