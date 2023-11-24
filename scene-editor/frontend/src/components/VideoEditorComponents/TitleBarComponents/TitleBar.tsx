/**
 * TitleBar.tsx
 *
 * Description:
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
 */

import React, { memo, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* Third Party Imports */
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { Button, Stack, TextField, Typography } from "@mui/material";

/* Project Specific Imports */
import { Clip, exportClips, useClipsContext } from "../ClipsContext";
import { useAssetsContext } from "../MediaLibraryComponents/AssetsContext";

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
const useExportClips = (
  projectID: string,
  clips: Clip[],
  title: string,
  fetchAssets: () => Promise<void>
) => {
  return useCallback(async () => {
    try {
      // Wait for exportClips to complete before moving to the next step
      await exportClips(projectID, clips, title == "" ? DEFAULT_TITLE : title);
      await fetchAssets();
    } catch (error) {
      console.error("Error during export and fetch:", error);
    }
  }, [clips, title]);
};

/* Components */
const BackButton = memo(() => {
  const { projectID } = useParams<"projectID">();

  const goBack = useNavigateBack(projectID!);

  return (
    <Button
      variant="contained"
      startIcon={<ArrowBackIcon />}
      onClick={goBack}
      sx={{
        backgroundColor: "aliceblue",
        color: "royalblue",
        "&:hover": { backgroundColor: "lightgrey" },
      }}
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
        variant="outlined"
        sx={{
          flexGrow: 1,
          borderRadius: { xs: 0, md: 8 },
          backgroundColor: "aliceblue",
          overflow: "hidden",
        }}
        placeholder={DEFAULT_TITLE}
        onChange={changeTitle}
      />
    );
  }
);

const ExportButton = memo(({ title }: { title: string }) => {
  const { state } = useClipsContext();
  const { fetchAssets } = useAssetsContext();
  const { projectID } = useParams();

  // Show invalid button.
  if (!projectID) {
    return (
      <Button color="error" variant="contained" startIcon={<UpgradeIcon />}>
        <Typography noWrap>Invalid Project ID</Typography>
      </Button>
    );
  }

  const handleExport = useExportClips(
    projectID,
    state.clips,
    title,
    fetchAssets
  );

  return (
    <Button
      variant="contained"
      startIcon={<UpgradeIcon />}
      onClick={handleExport}
      sx={{
        backgroundColor: "aliceblue",
        color: "royalblue",
        "&:hover": { backgroundColor: "lightgrey" },
      }}
    >
      Export
    </Button>
  );
});

const ToggleMediaLibraryButton = ({ onclick }: { onclick: () => void }) => {
  return (
    <Button
      variant="contained"
      onClick={onclick}
      sx={{
        backgroundColor: "aliceblue",
        color: "royalblue",
        "&:hover": { backgroundColor: "lightgrey" },
      }}
    >
      <VideoLibraryIcon />
    </Button>
  );
};

const TitleBar: React.FC<{ toggleMediaLibrary: () => void }> = memo(
  ({ toggleMediaLibrary }) => {
    const [title, setTitle] = useState("");

    return (
      <Stack
        direction="row"
        padding={{ xs: 1, md: 2 }}
        spacing={{ xs: 1, md: 2 }}
        sx={{ backgroundColor: "#2196f3" }}
      >
        <ToggleMediaLibraryButton onclick={toggleMediaLibrary} />
        <BackButton />
        <TitleTextField setTitle={setTitle} />
        <ExportButton title={title} />
      </Stack>
    );
  }
);

export default TitleBar;
