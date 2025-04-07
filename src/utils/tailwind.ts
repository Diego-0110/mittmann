import clsx from 'clsx';
import type { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// For special cases with conflicted custom classes
export function cnx (...classes: ClassValue[]) {
  return clsx(...classes)
}

const customTwMerge = extendTailwindMerge({ })
// For general use: merge multiple tailwind classes
export function cn (...classes: ClassValue[]) {
  return customTwMerge(clsx(...classes))
}
