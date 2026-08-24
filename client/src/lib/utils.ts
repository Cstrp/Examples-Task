import { twMerge } from "tailwind-merge"
import type { ClassValue } from "clsx"
import { clsx } from "clsx"

export const cn = (...inputs: ClassValue[]): string=> twMerge(clsx(inputs))
