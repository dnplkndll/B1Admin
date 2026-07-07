import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiHelper } from "@churchapps/apphelper";
import type { SiteInterface } from "../../helpers";

export function useSiteSelection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sites, setSites] = useState<SiteInterface[]>([]);
  const siteId = searchParams.get("site") || "";

  const setSiteId = useCallback((id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set("site", id);
      else next.delete("site");
      return next;
    });
  }, [setSearchParams]);

  const reloadSites = useCallback(async () => {
    try {
      const data = await ApiHelper.get("/sites", "MembershipApi");
      setSites(Array.isArray(data) ? data : []);
    } catch {
      // Older APIs may not expose /sites — treat as "main website only".
      setSites([]);
    }
  }, []);

  useEffect(() => { reloadSites(); }, [reloadSites]);

  // Drop a stale ?site= value once the site list resolves without it.
  useEffect(() => {
    if (siteId && sites.length > 0 && !sites.some((s) => s.id === siteId)) setSiteId("");
  }, [siteId, sites, setSiteId]);

  const selectedSite = sites.find((s) => s.id === siteId);

  return { siteId, setSiteId, sites, selectedSite, reloadSites };
}
