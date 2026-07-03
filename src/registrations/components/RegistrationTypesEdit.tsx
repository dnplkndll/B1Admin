import React, { useEffect, useState } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { ApiHelper, Locale } from "@churchapps/apphelper";
import { AppIconButton } from "../../components/ui/AppIconButton";
import { type CommerceEventInterface, type RegistrationTypeInterface } from "../registrationCommerce";

interface Props {
  event: CommerceEventInterface;
}

export const RegistrationTypesEdit: React.FC<Props> = ({ event }) => {
  const [rows, setRows] = useState<RegistrationTypeInterface[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    ApiHelper.get(`/registrations/types/event/${event.id}?churchId=${event.churchId}`, "ContentApi")
      .then((data: RegistrationTypeInterface[]) => setRows((data || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))));
  };

  useEffect(() => { if (event.id) load(); }, [event.id]);

  const update = (i: number, field: keyof RegistrationTypeInterface, value: any) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { name: "", price: null, capacity: null, sort: prev.length + 1, active: true }]);

  const removeRow = async (i: number) => {
    const row = rows[i];
    if (row.id) await ApiHelper.delete(`/registrations/types/${row.id}`, "ContentApi");
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    const payload = rows.filter((r) => (r.name || "").trim()).map((r) => ({
      ...r,
      eventId: event.id,
      price: r.price === null || r.price === undefined || (r.price as any) === "" ? null : Number(r.price),
      capacity: r.capacity === null || r.capacity === undefined || (r.capacity as any) === "" ? null : Number(r.capacity),
      sort: r.sort === null || r.sort === undefined || (r.sort as any) === "" ? null : Number(r.sort)
    }));
    if (payload.length > 0) await ApiHelper.post("/registrations/types", payload, "ContentApi");
    setSaving(false);
    load();
  };

  return (
    <Stack spacing={1.5}>
      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">{Locale.label("registrations.commerce.noTypes")}</Typography>
      )}
      {rows.map((row, i) => (
        <Box key={row.id || i} data-testid="registration-type-row" sx={{ p: 1, border: "1px solid", borderColor: "grey.200", borderRadius: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
            <TextField label={Locale.label("registrations.commerce.name")} size="small" value={row.name || ""} onChange={(e) => update(i, "name", e.target.value)} data-testid="type-name" sx={{ flex: "1 1 140px" }} />
            <TextField label={Locale.label("registrations.commerce.price")} type="number" size="small" value={row.price ?? ""} onChange={(e) => update(i, "price", e.target.value)} data-testid="type-price" sx={{ flex: "1 1 90px" }} />
            <TextField label={Locale.label("registrations.commerce.capacity")} type="number" size="small" value={row.capacity ?? ""} onChange={(e) => update(i, "capacity", e.target.value)} data-testid="type-capacity" sx={{ flex: "1 1 90px" }} />
            <TextField label={Locale.label("registrations.commerce.sort")} type="number" size="small" value={row.sort ?? ""} onChange={(e) => update(i, "sort", e.target.value)} data-testid="type-sort" sx={{ flex: "0 1 70px" }} />
            <AppIconButton intent="remove" label={Locale.label("common.delete")} icon={<DeleteIcon />} onClick={() => removeRow(i)} />
          </Stack>
        </Box>
      ))}
      <Stack direction="row" spacing={1}>
        <Button size="small" startIcon={<AddIcon />} onClick={addRow} data-testid="add-registration-type">{Locale.label("registrations.commerce.addType")}</Button>
        <Button size="small" variant="contained" onClick={save} disabled={saving} data-testid="save-registration-types">{saving ? Locale.label("common.saving") : Locale.label("common.save")}</Button>
      </Stack>
    </Stack>
  );
};
