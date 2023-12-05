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

interface Settings {
  name: string;
  resolution: string;
  frame_rate: string;
  video_codec: string;
  video_bitrate: string;
  audio_codec: string;
  audio_bitrate: string;
}

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
  currentSettings: Settings;
  handleExport: (settings: Settings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  handleClose,
  handleExport,
  currentSettings,
}) => {
  const [settings, setSettings] = useState<Settings>({ ...currentSettings });

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    handleExport(settings);
    handleClose();
  };

  const commonlyUsedResolutions = [
    "3840x1920",
    "5760x2880",
    "7680x3840",
    // Add more resolutions as needed
  ];

  const commonlyUsedFrameRates = [
    "24",
    "30",
    "60",
    "120",
    "240",
    // Add more frame rates as needed
  ];

  const commonlyUsedVideoCodecs = [
    "Default",
    "H.264 (AVC)",
    "H.265 (HEVC)",
    "VP9",
    "AV1",
    // Add more video codecs as needed (also add the mapping to ffmpeg)
  ];

  const commonlyUsedAudioCodecs = [
    "Default",
    "AAC",
    "Opus",
    "Vorbis",
    "MP3",
    // Add more audio codecs as needed (also add the mapping to ffmpeg)
  ];

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Video Export Settings</DialogTitle>
      <DialogContent>
        <DialogContentText>Modify the settings as needed.</DialogContentText>
        <TextField
          label="Name"
          fullWidth
          value={settings.name}
          placeholder="Untitled Video"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("name", e.target.value)
          }
          sx={{ marginTop: 2 }}
        />
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="resolution-label">Resolution</InputLabel>
          <Select
            labelId="resolution-label"
            id="resolution"
            value={settings.resolution}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("resolution", e.target.value as string)
            }
          >
            {commonlyUsedResolutions.map((resolution) => (
              <MenuItem key={resolution} value={resolution}>
                {resolution}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel id="framerate-label">Frame Rate</InputLabel>
          <Select
            labelId="framerate-label"
            id="framerate"
            value={settings.frame_rate}
            onChange={(e: SelectChangeEvent<string>) =>
              handleChange("frame_rate", e.target.value as string)
            }
          >
            {commonlyUsedFrameRates.map((frameRate) => (
              <MenuItem key={frameRate} value={frameRate}>
                {frameRate} FPS
              </MenuItem>
            ))}
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
            {commonlyUsedVideoCodecs.map((codec) => (
              <MenuItem key={codec} value={codec}>
                {codec}
              </MenuItem>
            ))}
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
            {commonlyUsedAudioCodecs.map((codec) => (
              <MenuItem key={codec} value={codec}>
                {codec}
              </MenuItem>
            ))}
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
        <Button onClick={handleSave}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
