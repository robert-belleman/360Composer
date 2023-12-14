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
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

const MAX_CHARACTERS_NAME = 128;

interface Settings {
  name: string;
  resolution: string;
  frame_rate: string;
  stereo_format: string;
  video_codec: string;
  video_bitrate: string;
  audio_codec: string;
  audio_bitrate: string;
}

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
  handleExport: (settings: Settings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  handleClose,
  handleExport,
}) => {
  const [settings, setSettings] = useState<Settings>({
    name: "",
    resolution: "3840x1920",
    frame_rate: "30",
    stereo_format: "2d",
    video_codec: "Default",
    video_bitrate: "Default",
    audio_codec: "Default",
    audio_bitrate: "Default",
  });

  const isExportButtonDisabled = settings.name.trim().length === 0;

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    settings.name = settings.name.trim()
    handleExport(settings);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Video Export Settings</DialogTitle>
      <DialogContent>
        <DialogContentText>Modify the settings as needed.</DialogContentText>
        <TextField
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
        />
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="resolution-label">Resolution</InputLabel>
          <Select
            labelId="resolution-label"
            id="resolution"
            value={settings.resolution}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("resolution", e.target.value)
            }
          >
            <MenuItem value="3840x1920">3840x1920</MenuItem>
            <MenuItem value="5760x2880">5760x2880</MenuItem>
            <MenuItem value="7680x3840">7680x3840</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="framerate-label">Frame Rate</InputLabel>
          <Select
            labelId="framerate-label"
            id="framerate"
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
          <InputLabel id="stereo-format-label">View Type</InputLabel>
          <Select
            labelId="stereo-format-label"
            id="stereo-format"
            value={settings.stereo_format}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("stereo_format", e.target.value)
            }
          >
            <MenuItem value="2d">Monoscopic</MenuItem>
            <MenuItem value="sbs">Side-by-Side (SBS)</MenuItem>
            <MenuItem value="tb">Top-Bottom (TB)</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="videocodec-label">Video Codec</InputLabel>
          <Select
            labelId="videocodec-label"
            id="videocodec"
            value={settings.video_codec}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("video_codec", e.target.value)
            }
          >
            <MenuItem value="Default">Default</MenuItem>
            <MenuItem value="H.264 (AVC)">H.264 (AVC)</MenuItem>
            <MenuItem value="H.265 (HEVC)">H.265 (HEVC)</MenuItem>
            <MenuItem value="VP9">VP9</MenuItem>
            <MenuItem value="AV1">AV1</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="audiocodec-label">Audio Codec</InputLabel>
          <Select
            labelId="audiocodec-label"
            id="audiocodec"
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
        <TextField
          label="Video Bitrate"
          fullWidth
          disabled={true}
          value={settings.video_bitrate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("video_bitrate", e.target.value)
          }
          sx={{ marginTop: 2 }}
        />
        <TextField
          label="Audio Bitrate"
          fullWidth
          disabled={true}
          value={settings.audio_bitrate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("audio_bitrate", e.target.value)
          }
          sx={{ marginTop: 2 }}
        />
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
