/**
 * TitleBar.tsx
 *
 * This component represents the title bar of the VideoEditor. It includes
 * features such as a back button to navigate to the assets tab, a text field
 * for setting the video title, and an export button to export the video clips.
 *
 * Components:
 * - BackButton: Navigates back to the assets tab on the project page.
 * - TitleTextField: Allows the user to input and edit the video title.
 * - ExportButton: Exports the video clips with the specified title.
 *
 * State:
 * - title: The current title of the video, managed using the useState hook.
 *
 * Hooks:
 * - useNavigateBack: Custom hook for navigating back to the assets tab.
 * - useTitleChange: Custom hook for handling changes to the video title.
 * - useExportClips: Custom hook for exporting video clips with the specified title.
 *
 */

import React, { memo, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* Third Party Imports */
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { AppBar, Button, TextField, Toolbar, Typography } from "@mui/material";

/* Project Specific Imports */
import { Clip, exportClips, useClipsContext } from "../ClipsContext";

const DEFAULT_TITLE = "Untitled Video";

/* Callback functions */
/**
 * Navigate back to assets tab on the project page.
 * @param projectID the ID of the project of the user.
 * @returns Callback function that redirects the user.
 */
const useNavigateBack = (projectID: string) => {
  const navigate = useNavigate();

  return useCallback(() => {
    navigate(`/app/project/${projectID}?activeTab=assets`);
  }, [projectID, navigate]);
};

/**
 * Trim the title and set it as the new state of `title`.
 * @param setTitle Function to change the state of `title`.
 * @returns Callback function that changes the title `title`.
 */
const useTitleChange = (
  setTitle: React.Dispatch<React.SetStateAction<string>>
) => {
  return useCallback(
    (e) => {
      const trimmedTitle = e.target.value.trim();
      setTitle(trimmedTitle == "" ? DEFAULT_TITLE : trimmedTitle);
    },
    [setTitle]
  );
};

/**
 * Export the clips `clips` with the title `title`.
 * @param clips clips to export.
 * @param title title of the video created from combining the clips.
 * @returns Callback function that exports the clips with title.
 */
const useExportClips = (projectID: string, clips: Clip[], title: string) => {
  return useCallback(() => {
    exportClips(projectID, clips, title == "" ? DEFAULT_TITLE : title);
  }, [clips, title]);
};

/* Components */
const BackButton = memo(() => {
  const { projectID } = useParams<'projectID'>();

  const goBack = useNavigateBack(projectID!);

  return (
    <Button
      color="success"
      variant="contained"
      startIcon={<ArrowBackIcon />}
      onClick={goBack}
    >
      Back
    </Button>
  );
});

const TitleTextField = memo(
  ({
    setTitle,
  }: {
    setTitle: React.Dispatch<React.SetStateAction<string>>;
  }) => {
    const changeTitle = useTitleChange(setTitle);

    return (
      <TextField
        size="small"
        color="info"
        variant="outlined"
        sx={{ marginLeft: 2, marginRight: 2, flexGrow: 1 }}
        placeholder={DEFAULT_TITLE}
        onChange={changeTitle}
      />
    );
  }
);

const ExportButton = memo(({ title }: { title: string }) => {
  const { state } = useClipsContext();
  const { projectID } = useParams();

  // Show invalid button.
  if (!projectID) {
    return (
      <Button color="error" variant="contained" startIcon={<UpgradeIcon />}>
        <Typography noWrap>Invalid Project ID</Typography>
      </Button>
    );
  }

  const handleExport = useExportClips(projectID, state.clips, title);

  return (
    <Button
      color="success"
      variant="contained"
      startIcon={<UpgradeIcon />}
      onClick={handleExport}
    >
      Export
    </Button>
  );
});

const TitleBar: React.FC = memo(() => {
  const [title, setTitle] = useState("");

  return (
    <AppBar position="static">
      <Toolbar>
        <BackButton />
        <TitleTextField setTitle={setTitle} />
        <ExportButton title={title} />
      </Toolbar>
    </AppBar>
  );
});

export default TitleBar;
