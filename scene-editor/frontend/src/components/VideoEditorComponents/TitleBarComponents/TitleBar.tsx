/**
 * TitleBar.tsx
 *
 * Description:
 * This component represents the title bar of the VideoEditor. It includes
 * features such as a back button to navigate to the assets tab and a way
 * to export the current video edit.
 *
 */

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
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
  const isMountedRef = useRef<boolean>(true);

  /* Keep track of whether the component is mounted. */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  /**
   * This function transforms the array of clips into a Object that is JSON
   * serializable. It only sends the `id` of the `asset`, to reduce the
   * amount of updates that have to be done in the frontend.
   *
   * For instance, when the resolution of an asset is changed, all
   * clips in the array that use that asset have to be updated and
   * rerendered. Instead, the asset is updated in the database and
   * we find the asset in the backend using its id.
   */
  const handleExport = async (settings: any) => {
    setIsExporting(true);

    /* Parse edits */
    const edits =
      clipsState.clips.length > 0
        ? clipsState.clips.map((clip) => ({
            asset_id: clip.asset.id,
            start_time: clip.startTime.toFixed(3),
            duration: clip.duration.toFixed(3),
            width: clip.asset.width,
            height: clip.asset.height,
          }))
        : {};

    try {
      console.log("Exporting video edit:", edits, settings);
      const response = await exportVideoEdits(projectID, {
        edits: edits,
        settings: settings,
      });
      console.log("Edited video:", response.data);
    } catch (error) {
      console.error("Error exporting clips:", error);
    } finally {
      /* Only change state if the component is mounted. */
      if (isMountedRef.current) {
        await fetchAssets();
        setIsExporting(false);
        handleCloseDialog();
      }
    }
  };

  const invalidResolutionIndices = clipsState.clips
    .map((clip, index) =>
      !clip.asset.width || !clip.asset.height ? index : undefined
    )
    .filter((index) => typeof index === "number") as number[];

  return (
    <>
      <Button
        variant="contained"
        startIcon={
          isExporting ? <CircularProgress size={20} /> : <UpgradeIcon />
        }
        disabled={isExporting || clipsState.clips.length === 0}
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
        invalidResolutionIndices={invalidResolutionIndices}
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
