import React from "react";
import { PlanTypeList } from "./components/PlanTypeList";
import { TeamList } from "./components/TeamList";
import { ContentProviderAuthManager } from "./components/ContentProviderAuthManager";
import { GroupAdd } from "../groups/components";
import { Locale, PageHeader, Loading, ArrayHelper, UserHelper, Permissions } from "@churchapps/apphelper";
import { Box, Button, Grid, FormControlLabel, Switch } from "@mui/material";
import { Assignment as AssignmentIcon, Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { type GroupInterface, type GroupMemberInterface } from "@churchapps/helpers";
import { EmptyState } from "../components/ui";
import { NavigationTabs } from "../components/ui/NavigationTabs";
import UserContext from "../UserContext";
import { Link } from "react-router-dom";

export const ServingPage = () => {
  const [showAdd, setShowAdd] = React.useState(false);
  const [selectedMinistryId, setSelectedMinistryId] = React.useState<string | null>(null);
  const [showAllMinistries, setShowAllMinistries] = React.useState(false);
  const context = React.useContext(UserContext);
  const isAdmin = UserHelper.checkAccess(Permissions.membershipApi.roles.edit);

  const ministries = useQuery<GroupInterface[]>({
    queryKey: isAdmin ? ["/groups/tag/ministry", "MembershipApi"] : ["/groups/my/ministry", "MembershipApi"],
    placeholderData: []
  });

  const groupIds = React.useMemo(() => {
    return ministries.data && ministries.data.length > 0 ? ArrayHelper.getIds(ministries.data, "id") : [];
  }, [ministries.data]);

  const groupMembers = useQuery<GroupMemberInterface[]>({
    queryKey: ["/groupMembers", "MembershipApi", groupIds],
    enabled: isAdmin && groupIds.length > 0,
    placeholderData: [],
    queryFn: async () => {
      if (groupIds.length === 0) return [];
      const { ApiHelper } = await import("@churchapps/apphelper");
      return ApiHelper.get(`/groupMembers?groupIds=${groupIds}`, "MembershipApi");
    }
  });

  const handleShowAdd = () => setShowAdd(true);

  const handleAddUpdated = () => {
    setShowAdd(false);
    ministries.refetch();
  };

  const groups = isAdmin
    ? (ministries.data || []).filter((g) => {
      if (showAllMinistries) return true;
      const members = ArrayHelper.getAll(groupMembers.data || [], "groupId", g.id);
      const isMember = ArrayHelper.getOne(members, "personId", context.person?.id) !== null;
      return isMember || members.length === 0;
    })
    : (ministries.data || []);

  const selectedMinistry = groups.find((g) => g.id === selectedMinistryId);

  React.useEffect(() => {
    if (groups.length > 0) {
      const isCurrentSelectionValid = groups.some(g => g.id === selectedMinistryId);
      if (!selectedMinistryId || !isCurrentSelectionValid) {
        setSelectedMinistryId(groups[0].id);
      }
    }
  }, [groups, selectedMinistryId]);

  if (ministries.isLoading) return <Loading />;

  if (showAdd) {
    return (
      <>
        <PageHeader title={Locale.label("plans.plansPage.addMinistry")} subtitle={Locale.label("plans.plansPage.subtitle")} />
        <Box sx={{ p: 3 }}>
          <GroupAdd updatedFunction={handleAddUpdated} tags="ministry" categoryName="Ministry" />
        </Box>
      </>
    );
  }

  if (groups.length === 0) {
    return (
      <>
        <PageHeader title={Locale.label("plans.plansPage.selMin")} subtitle={Locale.label("plans.plansPage.subtitle")} />
        <Box sx={{ p: 3 }}>
          <EmptyState
            icon={<AssignmentIcon />}
            title={Locale.label("plans.ministryList.noMinMsg")}
            description={Locale.label("plans.ministryList.getStarted")}
            action={
              UserHelper.checkAccess(Permissions.membershipApi.groups.edit) && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleShowAdd} sx={{ fontSize: "1rem", py: 1.5, px: 3 }}>
                  {Locale.label("plans.plansPage.addMinistry")}
                </Button>
              )
            }
          />
        </Box>
      </>
    );
  }

  return (
    <>
      <PageHeader title={selectedMinistry?.name || Locale.label("components.wrapper.serving")} subtitle={Locale.label("plans.ministryPage.subtitle")}>
        {isAdmin && (
          <FormControlLabel
            control={
              <Switch
                checked={showAllMinistries}
                onChange={(e) => setShowAllMinistries(e.target.checked)}
                sx={{ color: "#FFF", "&.Mui-checked": { color: "#FFF" }, "& .MuiSwitch-track": { backgroundColor: "rgba(255,255,255,0.3)" } }}
              />
            }
            label={Locale.label("plans.servingPage.showAll")}
            sx={{ color: "#FFF", mr: 2 }}
          />
        )}
        {UserHelper.checkAccess(Permissions.membershipApi.groups.edit) && (
          <>
            {selectedMinistry && (
              <Button
                component={Link}
                to={`/groups/${selectedMinistry.id}?tag=ministry`}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                  color: "#FFF",
                  borderColor: "rgba(255,255,255,0.5)",
                  mr: 1,
                  "&:hover": {
                    borderColor: "#FFF",
                    backgroundColor: "rgba(255,255,255,0.1)"
                  }
                }}>
                {Locale.label("plans.plansPage.editMinistry")}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleShowAdd}
              sx={{
                color: "#FFF",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "#FFF",
                  backgroundColor: "rgba(255,255,255,0.1)"
                }
              }}>
              {Locale.label("plans.plansPage.addMinistry")}
            </Button>
          </>
        )}
      </PageHeader>

      {groups.length > 1 && (
        <NavigationTabs
          selectedTab={selectedMinistryId || ""}
          onTabChange={setSelectedMinistryId}
          tabs={groups.map((g) => ({ value: g.id, label: g.name }))}
        />
      )}

      <Box sx={{ p: 3 }}>
        {selectedMinistry && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <PlanTypeList ministry={selectedMinistry} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <TeamList ministry={selectedMinistry} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ContentProviderAuthManager key={selectedMinistry.id} ministryId={selectedMinistry.id} />
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
};
