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
      className={`fixed inset-0 z-[100] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      {/* Backdrop overlay: identical styling to Dialog (black/50, triggers onClose on click) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Sliding Panel: fixed on the left, slides via transition-transform */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900/60 z-50 shadow-2xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Floating Close Button */}
        <div className="absolute top-4 right-4 z-[60]">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-lg p-1.5 transition-colors focus:outline-none cursor-pointer"
            aria-label="Close sheet"
            
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body container: full size for seamless sidebar integration */}
        <div className="h-full w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Sheet;
