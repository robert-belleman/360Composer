/**
 * TitleBar.tsx
 *
 * Description:
 * This module describes the TitleBar Component of the VideoEditor.
 *
 * The TitleBar contains the following Components:
 *   - BackButton. A Button that redirects the user to the projects page.
 *   - TitleTextField. A TextField where the user can change the title.
 *   - ExportButton. A Button that exports the video edit.
 *
 */

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppBar, Button, TextField, Toolbar } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UpgradeIcon from "@mui/icons-material/Upgrade";

import { EXPORT_CLIPS, useClips } from "./ClipsContext";

const TitleBar: React.FC = () => {
  const { dispatch } = useClips();

  const [title, setTitle] = useState("Untitled Video");

  const { projectID } = useParams();

  const navigate = useNavigate();

  const handleExportClips = (title: string) => {
    dispatch({ type: EXPORT_CLIPS, payload: { title: title } });
  };

  const BackButton = () => (
    <Button
      color="success"
      variant="contained"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(`/app/project/${projectID}?activeTab=assets`)}
    >
      Back
    </Button>
  );

  const TitleTextField = () => {
    return (
      <TextField
        size="small"
        color="info"
        variant="outlined"
        sx={{ marginLeft: 2, marginRight: 2 }}
        placeholder="Untitled Video"
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
    );
  };

  const ExportButton = () => (
    <Button
      color="success"
      variant="contained"
      startIcon={<UpgradeIcon />}
      onClick={() => handleExportClips(title)}
    >
      Export
    </Button>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <BackButton />
        {TitleTextField()}
        <ExportButton />
      </Toolbar>
    </AppBar>
  );
};

export default TitleBar;
