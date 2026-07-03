import { type InstructionItem } from "@churchapps/content-providers";
import { type PlanItemInterface } from "../../helpers";

/**
 * Recursively searches an instruction tree for a thumbnail.
 * Returns the first thumbnail found in the item or its descendants.
 */
export function findThumbnailRecursive(item: InstructionItem): string | undefined {
  if (item.thumbnail) return item.thumbnail;
  if (item.children) {
    for (const child of item.children) {
      const found = findThumbnailRecursive(child);
      if (found) return found;
    }
  }
  return undefined;
}

/** Handles undefined/null children arrays to avoid NaN. */
export function getNextChildSort(children: PlanItemInterface[] | undefined | null): number {
  return (children?.length ?? 0) + 1;
}

/** Item types: reads accept legacy aliases; writes emit current types only.
 * Mappings: lessonSection/section→providerSection, lessonAction/action→providerPresentation, lessonAddOn/addon/file→providerFile, song→arrangementKey. */
export const ITEM_TYPES = {
  // Current types
  HEADER: "header",
  ITEM: "item",
  ARRANGEMENT_KEY: "arrangementKey",
  PROVIDER_SECTION: "providerSection",
  PROVIDER_PRESENTATION: "providerPresentation",
  PROVIDER_FILE: "providerFile",

  LEGACY: {
    LESSON_SECTION: "lessonSection",
    LESSON_ACTION: "lessonAction",
    LESSON_ADDON: "lessonAddOn",
    SECTION: "section",
    ACTION: "action",
    ADDON: "addon",
    SONG: "song",
    FILE: "file"
  }
} as const;

const LABEL_TYPES = new Set([
  "header",
  "item",
  "lessonAction",
  "lessonSection",
  "lessonAddOn",
  "action",
  "section",
  "addon",
  "providerPresentation",
  "providerSection",
  "providerFile"
]);

const DESC_TYPES = new Set([
  "item",
  "lessonAction",
  "lessonSection",
  "lessonAddOn",
  "action",
  "section",
  "addon",
  "providerPresentation",
  "providerSection",
  "providerFile"
]);

const DURATION_TYPES = new Set([
  "item",
  "lessonAction",
  "lessonSection",
  "action",
  "section",
  "providerPresentation",
  "providerSection"
]);

export function shouldShowLabel(itemType: string | undefined, hasRelatedId: boolean): boolean {
  if (!itemType) return false;
  return LABEL_TYPES.has(itemType) || (itemType === "arrangementKey" && hasRelatedId);
}

export function shouldShowDescription(itemType: string | undefined, hasRelatedId: boolean): boolean {
  if (!itemType) return false;
  return DESC_TYPES.has(itemType) || (itemType === "arrangementKey" && hasRelatedId);
}

export function shouldShowDuration(itemType: string | undefined, hasRelatedId: boolean): boolean {
  if (!itemType) return false;
  return DURATION_TYPES.has(itemType) || (itemType === "arrangementKey" && hasRelatedId);
}

export function isSectionType(itemType: string | undefined): boolean {
  return ["providerSection", "lessonSection", "section"].includes(itemType || "");
}

export function isPresentationType(itemType: string | undefined): boolean {
  return ["providerPresentation", "lessonAction", "action"].includes(itemType || "");
}

export function isFileType(itemType: string | undefined): boolean {
  return ["providerFile", "lessonAddOn", "addon", "file"].includes(itemType || "");
}

export function isSongType(itemType: string | undefined): boolean {
  return ["song", "arrangementKey"].includes(itemType || "");
}
