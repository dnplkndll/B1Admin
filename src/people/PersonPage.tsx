import React, { useContext, useCallback, useMemo } from "react";
import { Groups, PersonAttendance, PersonNotes, PersonDonations, GdprActions } from "./components";
import { type PersonInterface, type ConversationInterface } from "@churchapps/helpers";
import { ApiHelper, Locale, SocketHelper, SubscriptionManager, UserHelper } from "@churchapps/apphelper";
import { useParams } from "react-router-dom";
import { PersonBanner } from "./components/PersonBanner";
import { PersonNavigation } from "./components/PersonNavigation";
import { PersonDetails } from "./components/PersonDetails";
import UserContext from "../UserContext";
import { useQuery } from "@tanstack/react-query";

export const PersonPage = () => {
  const [selectedTab, setSelectedTab] = React.useState("");
  const context = useContext(UserContext);
  const params = useParams();
  const [inPhotoEditMode, setInPhotoEditMode] = React.useState<boolean>(false);
  const [editMode, setEditMode] = React.useState<string>("display");

  const personData = useQuery<PersonInterface>({
    queryKey: ["/people/" + params.id, "MembershipApi"],
    enabled: !!(params.id && params.id !== "add"),
    placeholderData: null
  });

  const refetch = useCallback(() => {
    personData.refetch();
  }, [personData]);

  // Stash refetch in ref to avoid subscription re-create on every react-query update.
  const refetchRef = React.useRef(refetch);
  React.useEffect(() => { refetchRef.current = refetch; }, [refetch]);

  React.useEffect(() => {
    if (!params.id || params.id === "add") return;
    const churchId = UserHelper.currentUserChurch?.church?.id;
    const personId = UserHelper.person?.id;
    if (!churchId) return;
    const room = `content-person-${params.id}`;
    SubscriptionManager.joinRoom(room, churchId, personId).catch(() => { /* ignore */ });
    const handlerId = `PersonPage-${params.id}`;
    SocketHelper.addHandler("conversationActivity", handlerId, (data: any) => {
      if (data?.contentType === "person" && data?.contentId === params.id) refetchRef.current();
    });
    return () => {
      SocketHelper.removeHandler(handlerId);
      SubscriptionManager.leaveRoom(room, churchId).catch(() => { /* ignore */ });
    };
  }, [params.id]);

  const person = useMemo(() => {
    if (params.id === "add" || !params.id) {
      return {
        name: {
          first: "",
          last: "",
          middle: "",
          nick: "",
          display: ""
        },
        contactInfo: {
          address1: "",
          address2: "",
          city: "",
          state: "",
          zip: "",
          email: "",
          homePhone: "",
          workPhone: "",
          mobilePhone: ""
        },
        membershipStatus: "Visitor",
        gender: "",
        birthDate: null,
        maritalStatus: "",
        nametagNotes: ""
      };
    }

    if (!personData.data) return null;
    const p: PersonInterface = personData.data;
    if (!p.contactInfo) p.contactInfo = { homePhone: "", workPhone: "", mobilePhone: "" };
    else {
      if (!p.contactInfo.homePhone) p.contactInfo.homePhone = "";
      if (!p.contactInfo.mobilePhone) p.contactInfo.mobilePhone = "";
      if (!p.contactInfo.workPhone) p.contactInfo.workPhone = "";
    }
    return p;
  }, [params.id, personData.data]);

  const handleCreateConversation = async () => {
    const conv: ConversationInterface = {
      allowAnonymousPosts: false,
      contentType: "person",
      contentId: person.id,
      title: person.name.display + Locale.label("people.personPage.notesSuffix"),
      visibility: "hidden"
    };
    const result: ConversationInterface[] = await ApiHelper.post("/conversations", [conv], "MessagingApi");
    const p = { ...person };
    p.conversationId = result[0].id;
    await ApiHelper.post("/people", [p], "MembershipApi");
    refetch();
    return result[0].id;
  };

  const defaultTab: string = "details";

  React.useEffect(() => {
    if (selectedTab === "" && defaultTab !== "") {
      setSelectedTab(defaultTab);
    }
  }, [selectedTab, defaultTab]);

  const getCurrentTab = () => {
    let currentTab: JSX.Element;
    // Guard against null person during query refetches.
    if (selectedTab !== "details" && !person?.id) {
      return <div key="loading" />;
    }
    switch (selectedTab) {
      case "details":
        currentTab = (
          <PersonDetails
            key="details"
            person={person}
            updatedFunction={refetch}
            inPhotoEditMode={inPhotoEditMode}
            setInPhotoEditMode={setInPhotoEditMode}
            editMode={editMode}
            setEditMode={setEditMode}
          />
        );
        break;
      case "notes": currentTab = <PersonNotes key={`notes-${person?.conversationId || "new"}`} context={context} conversationId={person?.conversationId} createConversation={handleCreateConversation} />; break;
      case "attendance": currentTab = <PersonAttendance key="attendance" personId={person.id} personName={person.name?.display} updatedFunction={refetch} />; break;
      case "donations": currentTab = <PersonDonations key="donations" personId={person.id} />; break;
      case "groups": currentTab = <Groups key="groups" personId={person?.id} updatedFunction={refetch} />; break;
      default: currentTab = <div key="default">{Locale.label("people.tabs.noImplement")}</div>; break;
    }
    return currentTab;
  };

  return (
    <>
      <PersonBanner
        person={person}
        togglePhotoEditor={setInPhotoEditMode}
      />
      <PersonNavigation
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      <div style={{ padding: "24px" }}>
        {getCurrentTab()}
        {selectedTab === "details" && editMode === "edit" && person?.id && (
          <GdprActions personId={person.id} personName={person.name?.display || Locale.label("people.personPage.thisPerson")} onAnonymized={refetch} />
        )}
      </div>
    </>
  );
};
