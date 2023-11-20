/**
 * Media Library.tsx
 *
 * This component represents a media library that allows users to import media
 * assets and view them.
 *
 */

import React, { memo, useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

/* Third Party Imports */
import AddIcon from "@mui/icons-material/Add";
import { Button, Stack } from "@mui/material";

/* Project Specific Imports */
import NewAssetDialog from "../../ProjectComponents/AssetViewComponents/NewAssetDialog";
import { AssetsContext } from "./AssetsContext";
import AssetsLibrary from "./SortableItem/AssetsLibrary";

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
  const { fetchAssets } = useContext(AssetsContext)!;

  const [isImporting, setIsImporting] = useState(false);

  const { projectID } = useParams();

  /**
   * When an asset is created, fetch the assets again to rerender.
   */
  const handleAssetCreated = () => {
    setIsImporting(false);
    fetchAssets();
  };

  return (
    <Stack spacing={3}>
      <ImportMediaButton setIsImporting={setIsImporting} />
      <AssetsLibrary />
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
