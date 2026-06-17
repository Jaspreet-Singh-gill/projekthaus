import React from "react";
import { X } from "lucide-react";
import { useDialogBehavior } from "./useDialogBehavior";

/**
 * Sheet component represents a side-drawer or slide-over layout sliding from the left.
 * Commonly used for responsive sidebars, filter drawers, or detail panes.
 * 
 * Why design Sheets this way?
 * 1. Animation Continuity: Mounting and unmounting elements instantly breaks CSS transition animations.
 *    To ensure a smooth transition, we keep the component mounted in the DOM.
 * 2. Visual State Toggle: We use opacity to control the background backdrop fade-in and translate offset
 *    to control the panel slide-in:
 *    - `open ? 'translate-x-0' : '-translate-x-full'` for slide action.
 *    - `open ? 'opacity-100' : 'opacity-0 pointer-events-none'` for backdrop fade.
 * 3. Event Handling: Clicking on the overlay backdrop calls `onClose`.
 *    The panel is fixed on the left and has `z-50` to stay above the backdrop.
 * 4. Behavior Reuse: Hooks into `useDialogBehavior` for page scroll lock and Escape key handling.
 * 
 * @param {object} props
 * @param {boolean} props.open - Controls if the sheet panel is sliding in.
 * @param {Function} props.onClose - Triggered to close the drawer overlay.
 * @param {React.ReactNode} props.children - Main container content.
 */
export function Sheet({ open, onClose, children }) {
  // Bind standard modal side effects (body scroll locking & Escape key navigation)
  useDialogBehavior(open, onClose);

  return (
    // Outer wrapper: stays in the DOM, toggles opacity, and uses pointer-events-none when hidden
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop overlay: identical styling to Dialog (black/50, triggers onClose on click) */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sliding Panel: fixed on the left, slides via transition-transform */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] bg-white z-50 shadow-xl p-6 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header containing only the close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1 transition-colors"
            aria-label="Close sheet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body container with safe scrolling for overflow content */}
        <div className="text-sm text-gray-700 h-[calc(100%-2rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Sheet;
