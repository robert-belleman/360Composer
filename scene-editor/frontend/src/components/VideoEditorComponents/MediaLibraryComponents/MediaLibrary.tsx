/**
 * Media Library.tsx
 *
 * This component represents a media library that allows users to import media
 * assets and view them.
 *
 */

import React, { memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/* Third Party Imports */
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack } from "@mui/material";

/* Project Specific Imports */
import NewAssetDialog from "../../ProjectComponents/AssetViewComponents/NewAssetDialog";
import { useAssetsContext } from "./AssetsContext";
import AssetsLibrary from "./SortableItem/AssetsLibrary";
import SortingOptions from "./Selects/SortingOptions";
import FilterOptions from "./Selects/FilterOptions";

/* Components */
const ImportMediaButton: React.FC<{
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
}> = memo(({ setIsImporting }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={() => setIsImporting(true)}
      fullWidth
    >
      Import Media
    </Button>
  );
});

const MediaLibrary: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);

  const { assets, fetchAssets, sortAssets, filterAssets } = useAssetsContext();

  const { projectID } = useParams();

  const sortedFilteredAssets = sortAssets(filterAssets(assets));

  /**
   * When an asset is created, fetch the assets again to rerender.
   */
  const handleAssetCreated = () => {
    setIsImporting(false);
    fetchAssets();
  };

  return (
    <Stack height={1} boxSizing="border-box" padding={2} spacing={2}>
      <ImportMediaButton setIsImporting={setIsImporting} />
      <Stack direction="row">
        <FilterOptions />
        <SortingOptions />
      </Stack>
      <Box height={1}>
        <AssetsLibrary assets={sortedFilteredAssets} />
      </Box>
      <NewAssetDialog
        activeProject={projectID!}
        open={isImporting}
        closeHandler={() => setIsImporting(false)}
        onAssetCreated={handleAssetCreated}
      />
    </Stack>
  );
};

export default MediaLibrary;
