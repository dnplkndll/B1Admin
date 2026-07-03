import React, { useEffect, useState } from "react";
import { Box, Stack, TextField, Button, Typography, MenuItem, Chip } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { ApiHelper, Locale } from "@churchapps/apphelper";
import { AppIconButton } from "../../components/ui/AppIconButton";
import { type CommerceEventInterface, type RegistrationCouponInterface } from "../registrationCommerce";

interface Props {
  event: CommerceEventInterface;
}

const toNum = (v: any) => (v === null || v === undefined || v === "" ? null : Number(v));
const toLocalInput = (d: Date | string | undefined) => (d ? new Date(d).toISOString().slice(0, 16) : "");
const toDate = (v: string) => (v ? new Date(v) : null);

export const RegistrationCouponsEdit: React.FC<Props> = ({ event }) => {
  const [rows, setRows] = useState<RegistrationCouponInterface[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    ApiHelper.get(`/registrations/coupons/event/${event.id}`, "ContentApi")
      .then((data: RegistrationCouponInterface[]) => setRows(data || []));
  };

  useEffect(() => { if (event.id) load(); }, [event.id]);

  const update = (i: number, field: keyof RegistrationCouponInterface, value: any) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, { code: "", discountType: "percent", value: 0, active: true }]);

  const removeRow = async (i: number) => {
    const row = rows[i];
    if (row.id) await ApiHelper.delete(`/registrations/coupons/${row.id}`, "ContentApi");
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    const payload = rows.filter((r) => (r.code || "").trim()).map((r) => ({
      id: r.id,
      churchId: r.churchId,
      eventId: event.id,
      code: r.code,
      discountType: r.discountType || "percent",
      value: toNum(r.value) ?? 0,
      startDate: r.startDate ? new Date(r.startDate) : null,
      endDate: r.endDate ? new Date(r.endDate) : null,
      minMembers: toNum(r.minMembers),
      maxUses: toNum(r.maxUses),
      active: r.active !== false
    }));
    if (payload.length > 0) await ApiHelper.post("/registrations/coupons", payload, "ContentApi");
    setSaving(false);
    load();
  };

  return (
    <Stack spacing={1.5}>
      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">{Locale.label("registrations.commerce.noCoupons")}</Typography>
      )}
      {rows.map((row, i) => (
        <Box key={row.id || i} data-testid="registration-coupon-row" sx={{ p: 1, border: "1px solid", borderColor: "grey.200", borderRadius: 1 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
              <TextField label={Locale.label("registrations.commerce.code")} size="small" value={row.code || ""} onChange={(e) => update(i, "code", e.target.value)} data-testid="coupon-code" sx={{ flex: "1 1 120px" }} />
              <TextField select label={Locale.label("registrations.commerce.discountType")} size="small" value={row.discountType || "percent"} onChange={(e) => update(i, "discountType", e.target.value)} data-testid="coupon-type" sx={{ flex: "1 1 110px" }}>
                <MenuItem value="percent">{Locale.label("registrations.commerce.percent")}</MenuItem>
                <MenuItem value="amount">{Locale.label("registrations.commerce.amount")}</MenuItem>
              </TextField>
              <TextField label={Locale.label("registrations.commerce.value")} type="number" size="small" value={row.value ?? ""} onChange={(e) => update(i, "value", e.target.value)} data-testid="coupon-value" sx={{ flex: "1 1 80px" }} />
              <AppIconButton intent="remove" label={Locale.label("common.delete")} icon={<DeleteIcon />} onClick={() => removeRow(i)} />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField label={Locale.label("registrations.commerce.startDate")} type="datetime-local" size="small" InputLabelProps={{ shrink: true }} value={toLocalInput(row.startDate)} onChange={(e) => update(i, "startDate", toDate(e.target.value))} data-testid="coupon-start" sx={{ flex: "1 1 160px" }} />
              <TextField label={Locale.label("registrations.commerce.endDate")} type="datetime-local" size="small" InputLabelProps={{ shrink: true }} value={toLocalInput(row.endDate)} onChange={(e) => update(i, "endDate", toDate(e.target.value))} data-testid="coupon-end" sx={{ flex: "1 1 160px" }} />
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
              <TextField label={Locale.label("registrations.commerce.minMembers")} type="number" size="small" value={row.minMembers ?? ""} onChange={(e) => update(i, "minMembers", e.target.value)} data-testid="coupon-min-members" sx={{ flex: "1 1 90px" }} />
              <TextField label={Locale.label("registrations.commerce.maxUses")} type="number" size="small" value={row.maxUses ?? ""} onChange={(e) => update(i, "maxUses", e.target.value)} data-testid="coupon-max-uses" sx={{ flex: "1 1 90px" }} />
              <Chip size="small" label={Locale.label("registrations.commerce.usesSoFar").replace("{count}", String(row.uses ?? 0))} />
            </Stack>
          </Stack>
        </Box>
      ))}
      <Stack direction="row" spacing={1}>
        <Button size="small" startIcon={<AddIcon />} onClick={addRow} data-testid="add-registration-coupon">{Locale.label("registrations.commerce.addCoupon")}</Button>
        <Button size="small" variant="contained" onClick={save} disabled={saving} data-testid="save-registration-coupons">{saving ? Locale.label("common.saving") : Locale.label("common.save")}</Button>
      </Stack>
    </Stack>
  );
};
