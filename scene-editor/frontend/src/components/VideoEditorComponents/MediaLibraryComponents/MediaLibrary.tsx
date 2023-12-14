/**
 * Media Library.tsx

 * Description:
 * This module combines the different Components of a media library into a
 * React Functional Component.
 *
 * In the files related to the video editor will use the following terms:
 *   - Asset, a 'project asset' from the database.
 *   - Clip, a wrapper around an Asset with a start time and a duration.
 *
 * The Media Library has four main Components:
 *   - Import Button
 *     - Import new assets in case the user forgot.
 *   - Filtering Options
 *     - Provide options to filter the assets in the library.
 *   - Sorting Options
 *     - Provide options to sort the assets in the library.
 *   - Library
 *     - Render the filtered and sorted assets.
 *
 */

import React, { useState } from "react";
import { useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  AlertColor,
  Button,
  Grid,
  Snackbar,
  Stack,
} from "@mui/material";

import NewAssetDialog from "../../ProjectComponents/AssetViewComponents/NewAssetDialog";
import { Asset, useAssetsContext } from "./AssetsContext";
import FilterOptions from "./FilterOptions";
import LibraryAsset from "./LibraryAsset";
import SortingOptions from "./SortOptions";

const ImportMediaButton: React.FC<{
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsImporting }) => (
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => setIsImporting(true)}
    fullWidth
    sx={{
      backgroundColor: "dodgerblue",
      color: "aliceblue",
    }}
  >
    Import Media
  </Button>
);

const MediaLibrary: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const { assets, fetchAssets, sortAssets, filterAssets } = useAssetsContext();
  const { projectID } = useParams();
  const sortedFilteredAssets = sortAssets(filterAssets(assets));

  const handleAssetCreated = () => {
    setIsImporting(false);
    fetchAssets();
  };

  const handleSetAlert = (message: string, severity: string) => {
    setAlert({
      open: true,
      message: message,
      severity: severity,
    });
  };

  const AlertSnackbar = ({
    open,
    handleClose,
    message,
    severity,
  }: {
    open: boolean;
    handleClose: () => void;
    message: string;
    severity: string;
  }) => {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={severity as AlertColor}>
          {message}
        </Alert>
      </Snackbar>
    );
  };

  return (
    <Stack
      height={1}
      boxSizing="border-box"
      padding={{ xs: 0, md: 2 }}
      spacing={{ xs: 0, md: 2 }}
    >
      <ImportMediaButton setIsImporting={setIsImporting} />

      <Grid container justifyContent="center">
        <Grid item xs={12} lg={6}>
          <FilterOptions />
        </Grid>
        <Grid item xs={12} lg={6}>
          <SortingOptions />
        </Grid>
      </Grid>

      <div style={{ height: "100%", overflowY: "auto" }}>
        {sortedFilteredAssets.map((asset: Asset, index: number) => (
          <LibraryAsset
            key={index}
            asset={asset}
            handleSetAlert={handleSetAlert}
          />
        ))}
      </div>

      <NewAssetDialog
        activeProject={projectID!}
        open={isImporting}
        closeHandler={() => setIsImporting(false)}
        onAssetCreated={handleAssetCreated}
      />
      <AlertSnackbar
        open={alert.open}
        handleClose={() => setAlert({ ...alert, open: false })}
        message={alert.message}
        severity={alert.severity}
      />
    </Stack>
  );
};

export default React.memo(MediaLibrary);
