import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names and lets the last Tailwind class win (used by every shadcn component). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
