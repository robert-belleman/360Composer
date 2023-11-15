/**
 * MediaLibrary.tsx
 *
 * Description:
 * This module describes the MediaLibrary Component of the VideoEditor.
 *
 * The MediaLibrary contains the following Components:
 *   - ImportMediaButton. A Button to add assets, in case the user forgot.
 *   - A Container filled with all the assets.
 *
 */

import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";

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

import NewAssetDialog from "../ProjectComponents/AssetViewComponents/NewAssetDialog";

import defaultImage from "../../static/images/default.jpg";
import {
  MEDIA_LIBRARY_COLS,
  MEDIA_LIBRARY_IMAGE_WIDTH,
  MEDIA_LIBRARY_WIDTH,
} from "./Constants";

import { Asset, AssetsContext } from "./AssetsContext";
import { APPEND_CLIP, SPLIT_CLIP, printClips, useClipsContext } from "./ClipsContext";

const MediaLibrary: React.FC = () => {
  const { assets, createClip, loading, fetchAssets } =
    useContext(AssetsContext)!;
  const { state, dispatch } = useClipsContext();

  const [importingAsset, setImportingAsset] = useState(false);

  const { projectID } = useParams();

  const handleAppendClip = (asset: Asset) => {
    const newClip = createClip(asset);
    dispatch({ type: APPEND_CLIP, payload: { clip: newClip } });
  };

  const ImportMediaButton = () => {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setImportingAsset(true)}
        fullWidth
      >
        Import Media
      </Button>
    );
  };

  const renderTimestamp = (asset: Asset) => {
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
        title={toTime(asset.duration)}
        position="top"
      />
    );
  };

  const renderTitle = (asset: Asset) => {
    return (
      <ImageListItemBar
        title={asset ? asset.name : "examplename.mp4"}
        position="below"
        actionIcon={
          <IconButton color="info" onClick={() => handleAppendClip(asset)}>
            <AddIcon />
          </IconButton>
        }
      />
    );
  };

  const renderThumbnail = (asset: Asset) => {
    return (
      <img
        src={
          asset.thumbnail_path
            ? `/api/asset/${asset.id}/thumbnail`
            : defaultImage
        }
        alt={asset.name}
        loading="lazy"
      />
    );
  };

  const renderAssets = () => {
    if (loading) {
      return <CircularProgress />;
    }
    return assets.map((asset: Asset, i: number) => (
      <ImageListItem key={i} sx={{ width: MEDIA_LIBRARY_IMAGE_WIDTH }}>
        {renderTimestamp(asset)}
        {renderThumbnail(asset)}
        {renderTitle(asset)}
      </ImageListItem>
    ));
  };

  return (
    <Box width={MEDIA_LIBRARY_WIDTH} padding={1}>
      <Container disableGutters>
        <ImportMediaButton />
        <ImageList cols={MEDIA_LIBRARY_COLS}>{renderAssets()}</ImageList>
      </Container>
      <NewAssetDialog
        activeProject={projectID!}
        open={importingAsset}
        closeHandler={() => setImportingAsset(false)}
        onAssetCreated={() => {
          setImportingAsset(false);
          fetchAssets();
        }}
      />
    </Box>
  );
};

export default MediaLibrary;
