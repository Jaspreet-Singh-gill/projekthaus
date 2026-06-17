import React from "react";

/**
 * Skeleton component provides a low-fidelity preview (visual placeholder) of content
 * that is currently loading (e.g. text blocks, avatars, cards).
 * 
 * Why use Skeletons over full page Spinners?
 * 1. Cognitive Load: Spinners draw attention to the wait time. Skeletons create a visual structure
 *    that mimics the final content, making the loading process feel faster and more seamless.
 * 2. Layout Shift Mitigation: By providing pre-sized placeholders, we prevent layout reflows/shifts
 *    once the actual data finishes fetching and rendering.
 * 
 * Concepts applied:
 * - Pulse Animation (`animate-pulse`): A key Tailwind utility class that applies a CSS keyframe
 *   animation. It cycles the opacity of the element between 100% and 50% to signify background work.
 * - Flexibilty & Composition: This component is intentionally minimal. It does not dictate sizes or positions.
 *   Instead, the parent component passes utility classes like `h-10 w-10 rounded-full` or `h-4 w-full`
 *   via the `className` prop to shape and configure the skeleton placeholder.
 * 
*/
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
