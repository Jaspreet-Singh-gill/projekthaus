import { useEffect } from "react";

export function useDialogBehavior(open, onClose) {
  // Effect 1: Body Scroll Lock
  useEffect(() => {
    if (open) {
      // Temporarily lock body scroll to keep user focus on the dialog
      document.body.style.overflow = "hidden";
      
      // Cleanup: Restore scrollability when closed or unmounted
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Effect 2: Escape Key listener for a11y (Accessibility)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Listen to keydown events on the global document object
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup: Remove listener when closed or component unmounts to prevent memory leaks
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);
}
