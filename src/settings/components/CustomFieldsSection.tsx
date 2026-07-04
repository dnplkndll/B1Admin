import React from "react";
import { type PersonFieldInterface } from "../../helpers/Interfaces";
import { Locale, Loading } from "@churchapps/apphelper";
import { Box, Button, Card, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ListAlt as ListAltIcon, Add as AddIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { CountChip } from "../../components/ui";
import { CustomFieldEdit } from "./CustomFieldEdit";

// Custom field definition management (list + inline editor). Shared by the Settings
// landing's Custom Fields section and the standalone /settings/custom-fields page.
export const CustomFieldsSection: React.FC = () => {
  const [editField, setEditField] = React.useState<PersonFieldInterface | null>(null);

  const fields = useQuery<PersonFieldInterface[]>({
    queryKey: ["/personfields", "MembershipApi"],
    placeholderData: []
  });

  const handleUpdated = () => {
    setEditField(null);
    fields.refetch();
  };

  if (fields.isLoading) return <Loading />;

  const data = fields.data || [];

  const rows = data.map((f) => (
    <TableRow
      key={f.id}
      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "action.hover" }, transition: "background-color 0.2s ease" }}
      hover
      onClick={() => setEditField(f)}
      data-testid={`custom-field-row-${f.id}`}>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <ListAltIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{f.name}</Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">{f.fieldType || "—"}</Typography>
      </TableCell>
    </TableRow>
  ));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: editField ? 7 : 12 }}>
        <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: 1, borderColor: "var(--border-light)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ListAltIcon sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="h6">{Locale.label("settings.customFields.customFields")}</Typography>
              {data.length > 0 && <CountChip count={data.length} />}
            </Stack>
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setEditField({})} data-testid="add-custom-field-button">
              {Locale.label("settings.customFields.addField")}
            </Button>
          </Stack>
          {rows.length > 0 ? (
            <Table>
              <TableHead sx={{ backgroundColor: "var(--bg-sub)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{Locale.label("settings.customFieldEdit.name")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{Locale.label("settings.customFieldEdit.fieldType")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{rows}</TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <ListAltIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{Locale.label("settings.customFields.none")}</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setEditField({})} data-testid="add-custom-field-button-empty">
                {Locale.label("settings.customFields.addField")}
              </Button>
            </Box>
          )}
        </Card>
      </Grid>
      {editField && (
        <Grid size={{ xs: 12, md: 5 }}>
          <CustomFieldEdit field={editField} updatedFunction={handleUpdated} />
        </Grid>
      )}
    </Grid>
  );
};
