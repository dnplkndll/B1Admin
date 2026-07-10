import React from "react";
import { GroupBanner, GroupDetailsEdit, GroupNavigation } from "./components";
import { type GroupInterface } from "@churchapps/helpers";
import { useParams } from "react-router-dom";
import { GroupMembersTab } from "./components/GroupMembersTab";
import { GroupSessionsTab } from "./components/GroupSessionsTab";
import { GroupCalendarTab } from "./components/GroupCalendarTab";
import { GroupHealthTab } from "./components/GroupHealthTab";
import { Grid } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export const GroupPage = () => {
  const params = useParams();

  const [selectedTab, setSelectedTab] = React.useState("");
  const [editMode, setEditMode] = React.useState(false);

  const group = useQuery<GroupInterface>({
    queryKey: [`/groups/${params.id}`, "MembershipApi"],
    placeholderData: {} as GroupInterface
  });
  const groupData = group.data as GroupInterface;

  React.useEffect(() => {
    if (selectedTab === "") {
      setSelectedTab("members");
    }
  }, [selectedTab]);

  const getCurrentTab = () => {
    switch (selectedTab) {
      case "sessions": return <GroupSessionsTab key="sessions" group={groupData} />;
      case "calendar": return <GroupCalendarTab key="calendar" group={groupData} />;
      case "health": return <GroupHealthTab key="health" group={groupData} />;
      default: return <GroupMembersTab key="members" group={groupData} />;
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleUpdated = () => {
    setEditMode(false);
    group.refetch();
  };

  return (
    <>
      <GroupBanner
        group={groupData}
        onEdit={handleEdit}
        editMode={editMode}
        tabs={<GroupNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} group={groupData} onHeader />}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <div id="mainContent">{editMode ? <GroupDetailsEdit id="groupDetailsBox" group={groupData} updatedFunction={handleUpdated} /> : getCurrentTab()}</div>
        </Grid>
      </Grid>
    </>
  );
};
