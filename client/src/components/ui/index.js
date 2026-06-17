/**
 * Central entry point for all custom UI components and behaviors.
 * 
 * Why use an index file?
 * 1. Clean Imports: Instead of importing components using multiple nested paths:
 *    `import Dialog from '../components/ui/Dialog'`
 *    `import Skeleton from '../components/ui/Skeleton'`
 * 
 *    We can import them in a single, clean line:
 *    `import { Dialog, Skeleton } from '../components/ui'`
 * 
 * 2. Encapsulation: Hides internal file paths and structure, presenting a unified interface
 *    to the rest of the application.
 */

export * from "./Skeleton";
export * from "./Dialog";
export * from "./Sheet";
export * from "./Separator";
export * from "./useDialogBehavior";
