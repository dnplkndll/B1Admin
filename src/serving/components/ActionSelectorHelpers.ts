import { type Instructions, type InstructionItem, type IProvider } from "@churchapps/content-providers";

export const generatePath = (indices: number[]): string => indices.join(".");

export async function getProviderInstructions(provider: IProvider, path: string, auth?: any): Promise<Instructions | null> {
  const capabilities = provider.capabilities;
  if (capabilities.instructions && provider.getInstructions) {
    return provider.getInstructions(path, auth);
  }
  return null;
}

export function extractSections(instructions: Instructions): InstructionItem[] {
  const sections: InstructionItem[] = [];

  function findSections(items: InstructionItem[]) {
    for (const item of items) {
      if (item.itemType === "section" && item.children && item.children.length > 0) {
        sections.push(item);
      }
      if (item.children) {
        findSections(item.children);
      }
    }
  }

  findSections(instructions.items);

  // Fallback: structure-based detection if itemType not found
  if (sections.length === 0) {
    for (const item of instructions.items) {
      if (item.children && item.children.length > 0) {
        const hasActionChildren = item.children.some(c =>
          c.itemType === "action" || c.itemType === "providerPresentation" ||
          !c.children || c.children.length === 0);
        if (hasActionChildren) {
          sections.push(item);
        }
      }
    }
  }

  return sections;
}

export interface ActionSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (actionId: string, actionName: string, seconds?: number, providerId?: string, itemType?: "providerSection" | "providerPresentation" | "providerFile", image?: string, mediaUrl?: string, providerPath?: string, providerContentPath?: string) => void;
  /** Provider-defined path to the leaf folder whose contents should be offered as actions. */
  contentPath?: string;
  /** Provider ID for the associated content */
  providerId?: string;
  /** Ministry ID for auth */
  ministryId?: string;
}
