/**
 * Media Library.tsx
 *
 * This component represents a media library that allows users to import media,
 * view thumbnails with timestamps, and interact with assets through a dialog.
 *
 * Components:
 * - ImportMediaButton: Import additional video assets.
 * - Each video assets is displayed with:
 *   - Timestamp: Duration of the video asset.
 *   - Thumbnail: Thumbnail of the video asset.
 *   - Title: Title of the video asset.
 *
 * State:
 * - isImporting: State to check if the user is importing assets.
 *
 */

import React, { memo, useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

/* Third Party Imports */
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";

/* Project Specific Imports */
import NewAssetDialog from "../ProjectComponents/AssetViewComponents/NewAssetDialog";
import defaultImage from "../../static/images/default.jpg";
import {
  MEDIA_LIBRARY_COLS,
  MEDIA_LIBRARY_IMAGE_WIDTH,
  MEDIA_LIBRARY_WIDTH,
} from "./Constants";
import { Asset, AssetsContext, createClip } from "./AssetsContext";
import { APPEND_CLIP, useClipsContext } from "./ClipsContext";

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

const Timestamp: React.FC<{ duration: number }> = ({ duration }) => {
  /* Convert seconds to minute:seconds */
  const toTime = (seconds: number) => {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    let strMinutes = minutes < 10 ? "0" + minutes : minutes;
    let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return `${strMinutes}:${strSeconds}`;
  };

  return (
    <ImageListItemBar
      sx={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
          "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
      }}
      title={toTime(duration)}
      position="top"
    />
  );
};

const Thumbnail: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <img
      src={
        asset.thumbnail_path ? `/api/asset/${asset.id}/thumbnail` : defaultImage
      }
      alt={asset.name}
      loading="lazy"
    />
  );
};

const Title: React.FC<{ title: string; onClick: () => void }> = ({
  title,
  onClick,
}) => {
  return (
    <ImageListItemBar
      title={title}
      position="below"
      actionIcon={
        <IconButton color="info" onClick={onClick}>
          <AddIcon />
        </IconButton>
      }
    />
  );
};

const MediaLibrary: React.FC = () => {
  const { assets, loading, fetchAssets } = useContext(AssetsContext)!;
  const { dispatch } = useClipsContext();

  const [isImporting, setIsImporting] = useState(false);

  const { projectID } = useParams();

  const handleAppendClip = (asset: Asset) => {
    const newClip = createClip(asset);
    dispatch({ type: APPEND_CLIP, payload: { clip: newClip } });
  };

  /**
   * For each asset, render a thumbnail with a timestamp and title.
   */
  const renderAssets = useMemo(() => {
    if (loading) {
      return <CircularProgress />;
    }
    return assets.map((asset: Asset, i: number) => (
      <ImageListItem key={i} sx={{ width: MEDIA_LIBRARY_IMAGE_WIDTH }}>
        <Timestamp duration={asset.duration} />
        <Thumbnail asset={asset} />
        <Title title={asset.name} onClick={() => handleAppendClip(asset)} />
      </ImageListItem>
    ));
  }, [assets, loading]);

  /**
   * When an asset is created, fetch the assets again to rerender.
   */
  const handleAssetCreated = () => {
    setIsImporting(false);
    fetchAssets();
  };

  return (
    <Box width={MEDIA_LIBRARY_WIDTH} padding={1}>
      <Container disableGutters>
        <ImportMediaButton setIsImporting={setIsImporting} />
        <ImageList cols={MEDIA_LIBRARY_COLS}>{renderAssets}</ImageList>
      </Container>
      <NewAssetDialog
        activeProject={projectID!}
        open={isImporting}
        closeHandler={() => setIsImporting(false)}
        onAssetCreated={handleAssetCreated}
      />
    </Box>
  );
};

export default MediaLibrary;
