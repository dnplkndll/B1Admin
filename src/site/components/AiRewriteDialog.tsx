import { useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { Locale } from "@churchapps/apphelper";

type Props = {
  open: boolean;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onRewrite: (instruction: string) => void;
};

const PRESET_KEYS = ["warmer", "shorter", "formal", "grammar"];

export function AiRewriteDialog(props: Props) {
  const [instruction, setInstruction] = useState("");

  const applyPreset = (key: string) => setInstruction(Locale.label("site.aiRewrite.preset_" + key));

  return (
    <Dialog open={props.open} onClose={props.onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{Locale.label("site.aiRewrite.title")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{Locale.label("site.aiRewrite.description")}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {PRESET_KEYS.map((key) => (
            <Chip key={key} label={Locale.label("site.aiRewrite.preset_" + key)} variant="outlined" onClick={() => applyPreset(key)} data-testid={"ai-rewrite-preset-" + key} />
          ))}
        </Stack>
        <TextField fullWidth multiline minRows={2} label={Locale.label("site.aiRewrite.instruction")} placeholder={Locale.label("site.aiRewrite.placeholder")} value={instruction} onChange={(e) => setInstruction(e.target.value)} disabled={props.busy} data-testid="ai-rewrite-instruction" />
        {props.error && <Alert severity="error" sx={{ mt: 2 }} data-testid="ai-rewrite-error">{props.error}</Alert>}
        {props.busy && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">{Locale.label("site.aiRewrite.working")}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} disabled={props.busy}>{Locale.label("common.cancel")}</Button>
        <Button variant="contained" onClick={() => props.onRewrite(instruction)} disabled={props.busy} data-testid="ai-rewrite-submit">{Locale.label("site.aiRewrite.rewrite")}</Button>
      </DialogActions>
    </Dialog>
  );
}
