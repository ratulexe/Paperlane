document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navLinks = document.querySelectorAll(".primary-nav a[href]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const yearTargets = document.querySelectorAll("[data-year]");
const revealItems = document.querySelectorAll(".reveal");
const tabGroups = document.querySelectorAll("[data-tabs]");
const accordions = document.querySelectorAll("[data-accordion]");
const dialogClosers = document.querySelectorAll("[data-dialog-close]");
const toastTriggers = document.querySelectorAll("[data-toast]");
const filterButtons = document.querySelectorAll("[data-filter]");
const toolCards = document.querySelectorAll("[data-tool-card]");
const toolCount = document.querySelector("[data-tool-count]");
const emptyTools = document.querySelector("[data-empty-tools]");
const toolDialog = document.querySelector("#tool-dialog");
const openToolButtons = document.querySelectorAll(".open-tool-button");
const demoFileInput = document.querySelector("[data-demo-file]");
const browseFileButton = document.querySelector("[data-browse-file]");
const dropZone = document.querySelector("[data-drop-zone]");
const filePanel = document.querySelector("[data-file-panel]");
const fileName = document.querySelector("[data-file-name]");
const fileType = document.querySelector("[data-file-type]");
const fileSize = document.querySelector("[data-file-size]");
const removeDemoFileButton = document.querySelector("[data-remove-demo-file]");
const demoError = document.querySelector("[data-demo-error]");
const progressBar = document.querySelector("[data-progress-bar]");
const progressStatus = document.querySelector("[data-progress-status]");
const simulateButton = document.querySelector("[data-simulate-processing]");
const resetDemoButton = document.querySelector("[data-reset-demo]");
const homeFileInput = document.querySelector("[data-home-file-input]");
const homeDropZone = document.querySelector("[data-home-drop-zone]");
const homeFilePanel = document.querySelector("[data-home-file-panel]");
const homeFileIcon = document.querySelector("[data-home-file-icon]");
const homeFileName = document.querySelector("[data-home-file-name]");
const homeFileMeta = document.querySelector("[data-home-file-meta]");
const homeRemoveFileButton = document.querySelector("[data-home-remove-file]");
const homeUploadStatus = document.querySelector("[data-home-upload-status]");
const contactForm = document.querySelector("[data-contact-form]");
const contactSuccess = document.querySelector("[data-form-success]");

let activeDialog = null;
let lastFocusedElement = null;
let selectedDemoFile = null;
let selectedHomeFile = null;
let progressTimer = null;

const allowedDemoExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "txt"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const normalizePath = (path) => {
  let cleanPath = path.replace(/\/index\.html$/, "/");
  if (!cleanPath.endsWith("/")) cleanPath = `${cleanPath}/`;
  return cleanPath;
};

const currentPath = normalizePath(window.location.pathname);

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  const units = ["bytes", "KB", "MB", "GB"];
  const sizeIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** sizeIndex;
  return `${size.toFixed(sizeIndex === 0 ? 0 : 1)} ${units[sizeIndex]}`;
};

const getFileExtension = (file) => file?.name?.split(".").pop()?.toLowerCase() || "";

const isAcceptedDemoFile = (file) => file && allowedDemoExtensions.includes(getFileExtension(file));

const getReadableFileType = (file) => {
  const extension = getFileExtension(file);
  return file.type || (extension ? `.${extension.toUpperCase()} file` : "Unknown file type");
};

const getFocusableElements = (container) =>
  Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((item) => item.offsetParent !== null || item === document.activeElement);

const updateHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const openMobileMenu = () => {
  nav?.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuToggle?.setAttribute("aria-expanded", "true");
  menuToggle?.setAttribute("aria-label", "Close navigation menu");
};

const closeMobileMenu = () => {
  nav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation menu");
};

const showToast = (message) => {
  if (!message) return;

  let toastRegion = document.querySelector("[data-toast-region]");
  if (!toastRegion) {
    toastRegion = document.createElement("div");
    toastRegion.className = "toast-region";
    toastRegion.setAttribute("data-toast-region", "");
    toastRegion.setAttribute("aria-live", "polite");
    toastRegion.setAttribute("aria-label", "Notifications");
    document.body.appendChild(toastRegion);
  }

  const existing = Array.from(toastRegion.querySelectorAll(".toast")).find((toast) => toast.dataset.message === message);
  if (existing) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.message = message;
  toast.setAttribute("role", "status");
  toast.innerHTML = `<span>${message}</span><button type="button" aria-label="Dismiss notification">×</button>`;
  toastRegion.appendChild(toast);

  const dismiss = () => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  };

  toast.querySelector("button").addEventListener("click", dismiss);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(dismiss, 4200);
};

const openDialog = (dialog) => {
  if (!dialog) return;
  lastFocusedElement = document.activeElement;
  activeDialog = dialog;
  dialog.classList.add("is-open");
  dialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  getFocusableElements(dialog)[0]?.focus();
};

const closeDialog = (dialog = activeDialog) => {
  if (!dialog) return;
  dialog.classList.remove("is-open");
  dialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activeDialog = null;
  window.clearInterval(progressTimer);
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
};

const setSimulationBusy = (isBusy) => {
  [simulateButton, resetDemoButton, browseFileButton, removeDemoFileButton, demoFileInput].forEach((control) => {
    if (control) control.disabled = isBusy;
  });
};

const resetDemoState = () => {
  selectedDemoFile = null;
  window.clearInterval(progressTimer);
  setSimulationBusy(false);
  if (demoFileInput) demoFileInput.value = "";
  if (filePanel) filePanel.hidden = true;
  if (removeDemoFileButton) removeDemoFileButton.hidden = true;
  if (demoError) demoError.textContent = "";
  if (progressBar) progressBar.style.width = "0%";
  if (progressStatus) progressStatus.textContent = "Select a file to begin the demo.";
};

const setSelectedFile = (file) => {
  if (!file) return;
  selectedDemoFile = file;
  if (filePanel) filePanel.hidden = false;
  if (removeDemoFileButton) removeDemoFileButton.hidden = false;
  if (fileName) fileName.textContent = file.name;
  if (fileType) fileType.textContent = getReadableFileType(file);
  if (fileSize) fileSize.textContent = formatFileSize(file.size);
  if (demoError) demoError.textContent = "";
  if (progressBar) progressBar.style.width = "0%";
  if (progressStatus) progressStatus.textContent = "File selected. Ready to simulate the workflow.";
  showToast("File selected for demo.");
};

const resetHomeUpload = (returnFocus = false) => {
  selectedHomeFile = null;
  if (homeFileInput) homeFileInput.value = "";
  if (homeFilePanel) homeFilePanel.hidden = true;
  homeDropZone?.classList.remove("is-dragover", "is-invalid", "has-file");
  if (homeUploadStatus) homeUploadStatus.textContent = "Accepts PDF, DOC, DOCX, JPG, JPEG, PNG and TXT for interface demonstration.";
  if (returnFocus) homeDropZone?.focus();
};

const setHomeFile = (file) => {
  if (!file) return;
  if (!isAcceptedDemoFile(file)) {
    resetHomeUpload();
    homeDropZone?.classList.add("is-invalid");
    if (homeUploadStatus) homeUploadStatus.textContent = "Invalid file type. Choose PDF, DOC, DOCX, JPG, JPEG, PNG or TXT.";
    showToast("Choose a supported document or image file.");
    return;
  }

  selectedHomeFile = file;
  const extension = getFileExtension(file).toUpperCase();
  homeDropZone?.classList.remove("is-invalid");
  homeDropZone?.classList.add("has-file");
  if (homeFilePanel) homeFilePanel.hidden = false;
  if (homeFileIcon) homeFileIcon.textContent = extension || "FILE";
  if (homeFileName) homeFileName.textContent = file.name;
  if (homeFileMeta) homeFileMeta.textContent = `${getReadableFileType(file)} • ${formatFileSize(file.size)}`;
  if (homeUploadStatus) homeUploadStatus.textContent = "Demo-ready. No upload, reading or processing occurs.";
  showToast("File selected. Demo-ready.");
};

navLinks.forEach((link) => {
  const linkPath = normalizePath(new URL(link.getAttribute("href"), window.location.href).pathname);
  if (linkPath === currentPath && !link.classList.contains("btn")) link.setAttribute("aria-current", "page");
  link.addEventListener("click", closeMobileMenu);
});

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMobileMenu() : openMobileMenu();
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("menu-open")) return;
  if (nav?.contains(event.target) || menuToggle?.contains(event.target)) return;
  closeMobileMenu();
});

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

yearTargets.forEach((target) => {
  target.textContent = new Date().getFullYear();
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

tabGroups.forEach((group) => {
  const triggers = group.querySelectorAll("[data-tab-target]");
  const panels = group.querySelectorAll("[role='tabpanel']");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.dataset.tabTarget;
      triggers.forEach((item) => {
        const isActive = item === trigger;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      panels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    });
  });
});

accordions.forEach((accordion) => {
  const triggers = accordion.querySelectorAll(".accordion-trigger");
  triggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (panel) panel.hidden = trigger.getAttribute("aria-expanded") !== "true";
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      triggers.forEach((item) => {
        const itemPanel = document.getElementById(item.getAttribute("aria-controls"));
        item.setAttribute("aria-expanded", "false");
        if (itemPanel) itemPanel.hidden = true;
      });
      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        if (panel) panel.hidden = false;
      }
    });
  });
});

const updateToolFilter = (filter) => {
  let visibleCount = 0;
  toolCards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.category === filter;
    card.hidden = !isVisible;
    card.querySelectorAll("button, a, input, select, textarea").forEach((focusable) => {
      focusable.tabIndex = isVisible ? 0 : -1;
    });
    if (isVisible) visibleCount += 1;
  });
  if (emptyTools) emptyTools.hidden = visibleCount > 0;
  if (toolCount) toolCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "tool" : "tools"}`;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    updateToolFilter(button.dataset.filter);
  });
});

if (filterButtons.length) updateToolFilter("all");

openToolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-tool-card]");
    if (!card || !toolDialog) return;
    resetDemoState();
    toolDialog.querySelector("[data-dialog-icon]").textContent = card.dataset.toolIcon || "T";
    toolDialog.querySelector("[data-dialog-title]").textContent = card.dataset.toolName || "Tool preview";
    toolDialog.querySelector("[data-dialog-category]").textContent = card.querySelector(".badge")?.textContent || "Tool";
    toolDialog.querySelector("[data-dialog-description]").textContent = card.dataset.toolDescription || "";
    openDialog(toolDialog);
  });
});

browseFileButton?.addEventListener("click", () => demoFileInput?.click());
demoFileInput?.addEventListener("change", () => setSelectedFile(demoFileInput.files?.[0]));

["dragenter", "dragover"].forEach((eventName) => {
  dropZone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragover");
  });
  homeDropZone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    homeDropZone.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragover");
  });
  homeDropZone?.addEventListener(eventName, (event) => {
    event.preventDefault();
    homeDropZone.classList.remove("is-dragover");
  });
});

dropZone?.addEventListener("drop", (event) => setSelectedFile(event.dataTransfer?.files?.[0]));
dropZone?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    demoFileInput?.click();
  }
});
homeDropZone?.addEventListener("drop", (event) => setHomeFile(event.dataTransfer?.files?.[0]));
homeDropZone?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    homeFileInput?.click();
  }
});
homeFileInput?.addEventListener("change", () => setHomeFile(homeFileInput.files?.[0]));
homeRemoveFileButton?.addEventListener("click", () => {
  resetHomeUpload(true);
  showToast("File removed from demo.");
});

simulateButton?.addEventListener("click", () => {
  if (!selectedDemoFile) {
    showToast("Select a file before starting.");
    if (demoError) demoError.textContent = "Select a file before starting the simulated workflow.";
    if (progressStatus) progressStatus.textContent = "A selected file is required for this demo.";
    demoFileInput?.focus();
    return;
  }

  let progress = 0;
  window.clearInterval(progressTimer);
  setSimulationBusy(true);
  if (demoError) demoError.textContent = "";
  if (progressBar) progressBar.style.width = "0%";
  if (progressStatus) progressStatus.textContent = "Preparing demonstration...";

  progressTimer = window.setInterval(() => {
    progress = Math.min(progress + 10, 100);
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressStatus) {
      if (progress < 40) progressStatus.textContent = "Preparing demonstration...";
      else if (progress < 80) progressStatus.textContent = "Simulating workflow...";
      else if (progress < 100) progressStatus.textContent = "Completing demonstration...";
      else progressStatus.textContent = "Demo completed. No document conversion, upload or download occurred.";
    }
    if (progress === 100) {
      window.clearInterval(progressTimer);
      setSimulationBusy(false);
      showToast("Demo completed.");
    }
  }, 150);
});

resetDemoButton?.addEventListener("click", resetDemoState);
removeDemoFileButton?.addEventListener("click", () => {
  resetDemoState();
  demoFileInput?.focus();
  showToast("File removed from demo.");
});

dialogClosers.forEach((closer) => {
  closer.addEventListener("click", () => closeDialog(closer.closest("[data-dialog]")));
});

toastTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => showToast(trigger.dataset.toast));
});

const setFieldError = (field, message) => {
  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message;
};

const validateContactField = (field) => {
  const value = field.type === "checkbox" ? field.checked : field.value.trim();
  let message = "";
  if (field.required && !value) {
    message = field.type === "checkbox" ? "Please confirm the demo form notice." : "This field is required.";
  } else if (field.id === "full-name" && field.value.trim().length < 2) {
    message = "Full name must contain at least two characters.";
  } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
    message = "Enter a valid email address.";
  } else if (field.id === "subject" && field.value.trim().length < 3) {
    message = "Subject must contain at least three characters.";
  } else if (field.id === "message" && field.value.trim().length < 20) {
    message = "Message must be at least 20 characters.";
  }
  setFieldError(field, message);
  return !message;
};

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Array.from(contactForm.querySelectorAll("input, select, textarea"));
  let firstInvalid = null;
  fields.forEach((field) => {
    const isValid = validateContactField(field);
    if (!isValid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    if (contactSuccess) contactSuccess.hidden = true;
    showToast("Review the highlighted fields.");
    return;
  }
  if (contactSuccess) contactSuccess.hidden = false;
  contactSuccess?.focus();
  showToast("Demo form completed. No message was transmitted.");
});

contactForm?.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => validateContactField(field));
  field.addEventListener("change", () => validateContactField(field));
});

contactForm?.addEventListener("reset", () => {
  window.setTimeout(() => {
    contactForm.querySelectorAll("input, select, textarea").forEach((field) => setFieldError(field, ""));
    if (contactSuccess) contactSuccess.hidden = true;
  }, 0);
});

const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.type = "button";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.textContent = "↑";
document.body.appendChild(backToTop);
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
});

const updateBackToTop = () => {
  backToTop.classList.toggle("is-visible", window.scrollY > 520);
};

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) closeMobileMenu();
  if (!activeDialog) return;
  if (event.key === "Escape") {
    closeDialog();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = getFocusableElements(activeDialog);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
