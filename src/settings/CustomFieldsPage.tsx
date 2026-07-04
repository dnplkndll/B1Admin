import React from "react";
import { UserHelper, Permissions, Locale, PageHeader } from "@churchapps/apphelper";
import { Box } from "@mui/material";
import { PermissionDenied } from "../components";
import { CustomFieldsSection } from "./components/CustomFieldsSection";

export const CustomFieldsPage: React.FC = () => {
  const hasAccess = UserHelper.checkAccess(Permissions.membershipApi.settings.edit);

  if (!hasAccess) return <PermissionDenied permissions={[Permissions.membershipApi.settings.edit]} />;

  return (
    <>
      <PageHeader title={Locale.label("settings.customFields.customFields")} subtitle={Locale.label("settings.customFields.subtitle")} />
      <Box sx={{ p: 3 }}>
        <CustomFieldsSection />
      </Box>
    </>
  );
};
