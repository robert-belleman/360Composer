/**
 * VideoSettingsDialog.tsx
 *
 * Description:
 * This component handles the logic and representation of the dialog that
 * concerns itself with the settings of the video edit.
 *
 */

import React, { useState, ChangeEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const MAX_CHARACTERS_NAME = 128;

interface Settings {
  name: string;
  resolution: string;
  width: string;
  height: string;
  frame_rate: string;
  stereo_format: string;
  projection_format: string;
  video_codec: string;
  audio_codec: string;
  copy: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
  handleExport: (settings: Settings) => void;
  invalidResolutionIndices: number[];
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  handleClose,
  handleExport,
  invalidResolutionIndices,
}) => {
  const [settings, setSettings] = useState<Settings>({
    name: "",
    resolution: "first",
    width: "",
    height: "",
    frame_rate: "30",
    stereo_format: "mono",
    projection_format: "equirect",
    video_codec: "Default",
    audio_codec: "Default",
    copy: true,
  });

  const isExportButtonDisabled =
    !settings.name.trim() ||
    (settings.resolution === "custom" && (!settings.width || !settings.height));

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    settings.name = settings.name.trim();
    handleExport(settings);
    handleClose();
  };

  const resolutionError =
    (settings.resolution === "first" && invalidResolutionIndices.includes(0)) ||
    ((settings.resolution === "min" || settings.resolution === "max") &&
      invalidResolutionIndices.length > 0);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Video Export Settings</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Modify these settings to your desired output.
        </DialogContentText>
        <TextField
          error={settings.name === ""}
          label="Name"
          required
          fullWidth
          value={settings.name}
          placeholder="Untitled Video"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("name", e.target.value)
          }
          sx={{ marginTop: 2 }}
          inputProps={{ maxLength: MAX_CHARACTERS_NAME }}
          helperText={
            settings.name === ""
              ? "Please provide a name to remember the asset by."
              : ""
          }
        />
        <FormControl fullWidth sx={{ marginTop: 2 }} error={resolutionError}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={settings.resolution}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("resolution", e.target.value)
            }
          >
            <MenuItem value="first">Resolution of first asset</MenuItem>
            <MenuItem value="min">Smallest resolution in video edit</MenuItem>
            <MenuItem value="max">Biggest resolution in video edit</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
          {settings.resolution === "custom" && (
            <Grid container spacing={2} alignItems="center" sx={{ mt: "1px" }}>
              <Grid item xs={6}>
                <TextField
                  label="Width"
                  variant="outlined"
                  required
                  fullWidth
                  value={settings.width}
                  onChange={(e) => handleChange("width", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Height"
                  variant="outlined"
                  required
                  fullWidth
                  value={settings.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </Grid>
            </Grid>
          )}
          {resolutionError && (
            <FormHelperText>
              Some assets in the video edit have unknown resolution. Please
              provide their resolution manually to use this option.
            </FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Frame Rate</InputLabel>
          <Select
            value={settings.frame_rate}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("frame_rate", e.target.value)
            }
          >
            <MenuItem value="24">24 FPS</MenuItem>
            <MenuItem value="30">30 FPS</MenuItem>
            <MenuItem value="60">60 FPS</MenuItem>
            <MenuItem value="120">120 FPS</MenuItem>
            <MenuItem value="240">240 FPS</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>View Type</InputLabel>
          <Select
            value={settings.stereo_format}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("stereo_format", e.target.value)
            }
          >
            <MenuItem value="mono">Monoscopic</MenuItem>
            <MenuItem value="sidetoside">Side-by-Side (SBS)</MenuItem>
            <MenuItem value="toptobottom">Top-Bottom (TB)</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Projection Format</InputLabel>
          <Select
            disabled={true}
            value={settings.projection_format}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("projection_format", e.target.value)
            }
          >
            <MenuItem value="equirect">Equirectangular</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Video Codec</InputLabel>
          <Select
            disabled={true}
            value={settings.video_codec}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("video_codec", e.target.value)
            }
          >
            <MenuItem value="Default">Default</MenuItem>
            <MenuItem value="H.264 (AVC)">H.264 (AVC)</MenuItem>
            {/* <MenuItem value="H.265 (HEVC)">H.265 (HEVC)</MenuItem> */}
            <MenuItem value="VP9">VP9</MenuItem>
            {/* <MenuItem value="AV1">AV1</MenuItem> */}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Audio Codec</InputLabel>
          <Select
            disabled={true}
            value={settings.audio_codec}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("audio_codec", e.target.value)
            }
          >
            <MenuItem value="Default">Default</MenuItem>
            <MenuItem value="AAC">AAC</MenuItem>
            <MenuItem value="Opus">Opus</MenuItem>
            <MenuItem value="Vorbis">Vorbis</MenuItem>
            <MenuItem value="MP3">MP3</MenuItem>
          </Select>
        </FormControl>
        <FormControl
          fullWidth
          sx={{ marginTop: 2, justifyContent: "center", alignItems: "center" }}
        >
          <Stack direction="row" alignItems="center">
            <Typography>Allow Copy for Basic Editing</Typography>
            <Switch
              checked={settings.copy}
              onChange={() => handleChange("copy", !settings.copy)}
              inputProps={{ "aria-label": "controlled" }}
            />
          </Stack>
          <FormHelperText>
            {settings.copy
              ? "Enabling this option will copy the input without re-encoding. "
              : "Disabling this option will perform re-encoding. "}
            This option only takes effect when the edit only consists of trims
            and concatenations.
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Save</Button>
        <Button onClick={handleSave} disabled={isExportButtonDisabled}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
