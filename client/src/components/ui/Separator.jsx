import React from "react";

/**
 * Separator component is a simple horizontal dividing line used to establish visual hierarchy
 * and separate different chunks of layout (e.g., separating sidebar categories).
 * 
 * Why use a Separator?
 * 1. Page Rhythm & Grouping: Dividing lines break up complex forms, pages, or lists into digestible blocks.
 * 2. Design System Consistency: Centralizes the border color (`bg-gray-200`) and height (`h-px`) so any future styling changes
 *    to borders apply globally.
 * 
 * Concepts applied:
 * - Accessibility (a11y): Setting `role="separator"` informs screen readers that this is a content divider,
 *   helping users navigate document sections.
 * - Flexibilty: Toggles between horizontal and vertical configurations using the `orientation` prop.
 * 
 * @param {object} props
 * @param {string} props.className - Custom Tailwind utility classes to override or append styles (e.g. margin).
 * @param {"horizontal"|"vertical"} props.orientation - Determines if the separator is a row or column line.
 */
export function Separator({ className = "", orientation = "horizontal", ...props }) {
  const isHorizontal = orientation === "horizontal";
  
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`bg-slate-200 dark:bg-slate-800 ${
        isHorizontal ? "h-px w-full" : "h-full w-px"
      } ${className}`}
      {...props}
    />
  );
}

export default Separator;
