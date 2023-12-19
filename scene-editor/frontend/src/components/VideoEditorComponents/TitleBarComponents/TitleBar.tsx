/**
 * TitleBar.tsx
 *
 * Description:
 * This component represents the title bar of the VideoEditor. It includes
 * features such as a back button to navigate to the assets tab and a way
 * to export the current video edit.
 *
 */

import React, { memo, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* Third Party Imports */
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { Button, Stack, Typography, CircularProgress } from "@mui/material";

/* Project Specific Imports */
import { useClipsContext } from "../ClipsContext";
import { useAssetsContext } from "../MediaLibraryComponents/AssetsContext";
import { exportVideoEdits } from "../../../util/api";
import SettingsDialog from "./VideoSettingsDialog";

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

const ExportButton = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const { state: clipsState } = useClipsContext();
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

  const handleExport = async (settings: any) => {
    setIsExporting(true);

    /* Parse edits */
    const edits =
      clipsState.clips.length > 0
        ? clipsState.clips.map((clip) => ({
            asset_id: clip.asset.id,
            start_time: clip.startTime.toFixed(3),
            duration: clip.duration.toFixed(3),
          }))
        : {};

    try {
      console.log("Exporting video edit:", edits, settings);
      const response = await exportVideoEdits(projectID, {
        edits: edits,
        settings: settings,
      });
      console.log("API Response: ", response.data);
      await fetchAssets();
    } catch (error) {
      console.error("Error exporting clips:", error);
    } finally {
      setIsExporting(false);
      handleCloseDialog();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={
          isExporting ? <CircularProgress size={20} /> : <UpgradeIcon />
        }
        disabled={clipsState.clips.length === 0}
        onClick={handleOpenDialog}
        sx={{
          backgroundColor: "aliceblue",
          color: "royalblue",
          "&:hover": { backgroundColor: "lightgrey" },
        }}
      >
        Export
      </Button>
      <SettingsDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        handleExport={handleExport}
      />
    </>
  );
};

const ToggleMediaLibraryButton = ({ onclick }: { onclick: () => void }) => {
  return (
    <Button
      variant="contained"
      onClick={onclick}
      startIcon={<VideoLibraryIcon />}
      sx={{
        backgroundColor: "aliceblue",
        color: "royalblue",
        "&:hover": { backgroundColor: "lightgrey" },
      }}
    >
      Media Library
    </Button>
  );
};

const TitleBar: React.FC<{ toggleMediaLibrary: () => void }> = memo(
  ({ toggleMediaLibrary }) => {
    return (
      <Stack
        direction="row"
        padding={{ xs: 1, md: 2 }}
        spacing={{ xs: 1, md: 2 }}
        justifyContent="space-between"
        sx={{ backgroundColor: "#2196f3" }}
      >
        <BackButton />
        <ToggleMediaLibraryButton onclick={toggleMediaLibrary} />
        <ExportButton />
      </Stack>
    );
  }
);

export default TitleBar;
