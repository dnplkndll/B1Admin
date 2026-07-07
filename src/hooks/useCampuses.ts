import { useQuery } from "@tanstack/react-query";
import { type CampusInterface } from "../settings/components/CampusInterface";

// Stable query key ensures all callers share one cached fetch.
export const useCampuses = (): CampusInterface[] => {
  const query = useQuery<CampusInterface[]>({ queryKey: ["/campuses", "MembershipApi"], placeholderData: [] });
  return query.data || [];
};
