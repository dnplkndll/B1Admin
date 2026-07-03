// Wrappers around DoingApi permission tiers (tier constants in @churchapps/helpers); canEditCard is B1Admin-specific.
import { Permissions, UserHelper } from "@churchapps/apphelper";

// Missing tier degrades to "no access" instead of crashing.
const check = (perm?: { api: string; contentType: string; action: string }) => !!perm && UserHelper.checkAccess(perm);

export const canViewWorkflows = () => check(Permissions.doingApi?.tasks?.view);
export const canEditCards = () => check(Permissions.doingApi?.tasks?.edit);
export const canManageWorkflows = () => check(Permissions.doingApi?.tasks?.admin);

// Edit-assigned tier: full editors, or the person the card is assigned to.
export const canEditCard = (card: { assignedToType?: string; assignedToId?: string }) =>
  canEditCards() || (card?.assignedToType === "person" && !!card?.assignedToId && card.assignedToId === UserHelper.currentUserChurch?.person?.id);
