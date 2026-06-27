import React from "react";
import { X } from "lucide-react";
import { useDialogBehavior } from "./useDialogBehavior";

/**
 * Dialog component represents a modal overlay used for critical user workflows,
 * forms, details, and confirm boxes.
 * 
 * Why design Dialogs this way?
 * 1. Focus Containment: Modals direct all visual focus onto a single task by placing
 *    a semi-transparent backdrop (`bg-black/50`) over the background.
 * 2. Click-Outside dismissal: Clicking the backdrop overlay dismisses the dialog.
 *    To ensure clicks *inside* the modal don't trigger this behavior, we use
 *    `event.stopPropagation()` on the panel container.
 * 3. Accessibility & Usability (a11y/u11y):
 *    - Body Scroll Lock: Prevents layout scrolling when the modal is open.
 *    - Escape Key Bindings: Quickly dismisses the modal using standard keystrokes.
 *    These behavioral side-effects are cleanly isolated within the `useDialogBehavior` hook.
 * 
 * @param {object} props
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {Function} props.onClose - Callback function triggered when the dialog wants to close.
 * @param {string} props.title - Optional heading text displayed in the header.
 * @param {React.ReactNode} props.children - Main content to render inside the dialog body.
 */
export function Dialog({ open, onClose, title, children }) {
  // Bind standard modal side effects (body scroll locking & Escape key navigation)
  useDialogBehavior(open, onClose);

  // Conditional Mounting: If the modal is not open, we completely omit it from the DOM.
  if (!open) return null;

  return (
    // Backdrop overlay: Uses flex and items-center justify-center to center the content
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Centered Panel Container */}
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 z-50 relative transition-colors duration-200"
        // Crucial: Stop click events from bubbling up to the overlay backdrop which would trigger onClose.
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section with optional title and explicit close button */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          {title ? (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          ) : (
            // Empty span/div to keep justify-between alignment valid if there is no title
            <span />
          )}
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            {/* Lucide X icon */}
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body containing child nodes */}
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dialog;
