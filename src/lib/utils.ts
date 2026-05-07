import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function extractClaapId(url: string): string | null {
  // Match the full slug after the workspace, e.g. "le-role-...-c-SqPUB9WmVL-P7xPfL5hWXdo"
  const slugMatch = url.match(/app\.claap\.io\/[^/]+\/([^/?#]+)/);
  if (!slugMatch) return null;
  const slug = slugMatch[1];
  // Extract clip ID: everything after the last "-c-" separator
  const cMatch = slug.match(/-c-(.+)$/);
  return cMatch ? cMatch[1] : slug;
}
