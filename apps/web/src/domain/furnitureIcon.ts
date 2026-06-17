import type { FurnitureItem } from "./types";

/**
 * The board renders furniture as plain 2D top-view icons, not photo
 * thumbnails (PRD.md 12절 결정 사항) — so this maps a furniture category to a
 * fixed icon asset instead of deriving a silhouette from the segmented photo.
 */
const CATEGORY_ICONS: Record<string, string> = {
  desk: "/icons/desk.svg",
  bed: "/icons/bed.svg",
  chair: "/icons/chair.svg",
  storage: "/icons/storage.svg",
};

const DEFAULT_ICON = "/icons/generic.svg";

export function getIconForCategory(category: string): string {
  return CATEGORY_ICONS[category] ?? DEFAULT_ICON;
}

/** Sets iconImageUrl on a FurnitureItem based on its category, leaving everything else untouched. */
export function applyTopViewIcon(item: FurnitureItem): FurnitureItem {
  return { ...item, iconImageUrl: getIconForCategory(item.category) };
}
