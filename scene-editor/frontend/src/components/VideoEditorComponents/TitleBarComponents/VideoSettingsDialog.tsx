import React, { useState, ChangeEvent } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

interface Settings {
  name: string;
  resolution: string;
  frame_rate: string;
  video_codec: string;
  audio_codec: string;
  bitrate: string;
}

interface SettingsDialogProps {
  open: boolean;
  handleClose: () => void;
  currentSettings: Settings;
  handleExport: (settings: any) => void;
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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Settings</DialogTitle>
      <DialogContent>
        <DialogContentText>Modify the settings as needed.</DialogContentText>
        <TextField
          label="Name"
          fullWidth
          value={settings.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("name", e.target.value)
          }
        />
        <TextField
          label="Resolution"
          fullWidth
          value={settings.resolution}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("resolution", e.target.value)
          }
        />
        <TextField
          label="Frame Rate"
          fullWidth
          value={settings.frame_rate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("frame_rate", e.target.value)
          }
        />
        <TextField
          label="Video Codec"
          fullWidth
          value={settings.video_codec}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("video_codec", e.target.value)
          }
        />
        <TextField
          label="Audio Codec"
          fullWidth
          value={settings.audio_codec}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("audio_codec", e.target.value)
          }
        />
        <TextField
          label="Bitrate"
          fullWidth
          value={settings.bitrate}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("bitrate", e.target.value)
          }
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
