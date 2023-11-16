import React, { useState, useCallback, memo } from "react";
import { useNavigate, useParams, NavigateFunction } from "react-router-dom";

import { AppBar, Button, TextField, Toolbar } from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UpgradeIcon from "@mui/icons-material/Upgrade";

import { Clip, exportClips, useClipsContext } from "./ClipsContext";
import { DoublyLinkedList } from "./DoublyLinkedList";

const DEFAULT_TITLE = "Untitled Video";

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
const useExportClips = (clips: DoublyLinkedList<Clip>, title: string) => {
  return useCallback(() => {
    exportClips(clips, title == "" ? DEFAULT_TITLE : title);
  }, [clips, title]);
};

const BackButton = memo(() => {
  const { projectID } = useParams();

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

type TitleTextFieldProps = {
  setTitle: React.Dispatch<React.SetStateAction<string>>;
};

const TitleTextField = memo(({ setTitle }: TitleTextFieldProps) => {
  const changeTitle = useTitleChange(setTitle);

  return (
    <TextField
      size="small"
      color="info"
      variant="outlined"
      sx={{ marginLeft: 2, marginRight: 2 }}
      placeholder={DEFAULT_TITLE}
      onChange={changeTitle}
      fullWidth
    />
  );
});

type ExportButtonProps = {
  title: string;
};

const ExportButton = memo(({ title }: ExportButtonProps) => {
  const { state } = useClipsContext();

  const handleExport = useExportClips(state.clips, title);

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
