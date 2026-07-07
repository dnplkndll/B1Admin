import { memo } from "react";
import { UserHelper, Locale, Permissions } from "@churchapps/apphelper";
import { Box } from "@mui/material";
import { VolunteerActivism as DonationIcon } from "@mui/icons-material";

import { PageHeader } from "@churchapps/apphelper";
import { GivingDashboard } from "./GivingDashboard";

export const DonationsPage = memo(() => {
  if (!UserHelper.checkAccess(Permissions.givingApi.donations.viewSummary)) return <></>;

  return (
    <>
      <PageHeader icon={<DonationIcon />} title={Locale.label("donations.donationsPage.don")} subtitle={Locale.label("donations.donationsPage.subtitle")} />

      <Box sx={{ p: 3 }}>
        <GivingDashboard />
      </Box>
    </>
  );
});
