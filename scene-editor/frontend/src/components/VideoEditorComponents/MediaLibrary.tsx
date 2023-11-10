/*
Filename: MediaLibrary.tsx
Description:
This file describes media library component of the video editor.
The library acts as a place to see video assets of the user that
they want to use in their video edit.
 */

import axios from "axios";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Button,
  Container,
  Box,
  Drawer,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Skeleton,
  CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import defaultImage from "../../static/images/default.jpg";
import NewAssetDialog from "../ProjectComponents/AssetViewComponents/NewAssetDialog";
import Clip from "./Classes/Clip";
import Clips from "./Classes/Clips";

const cols = 2;

type MediaLibraryProps = {
  clips: Clips;
  setClips: React.Dispatch<React.SetStateAction<Clips>>;
  width: number;
};

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  clips,
  setClips,
  width,
}) => {
  console.log("Media Library Rendered");
  const { projectID } = useParams();

  const [assets, setAssets] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingAsset, setImportingAsset] = useState(false);
  let imageWidth = Math.floor(width / 2 - 19);

  /**
   * Fetch all assets that are in project `projectID`.
   *
   * Set the `isLoading` variable to true.
   * Assign the assets to the `assets` variable.
   * Set the `isLoading` variable to false.
   */
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/project/${projectID}/assets`, {});
      setAssets(res.data);
      return setIsLoading(false);
    } catch (e) {
      return console.log("error while fetching assets", e);
    }
  };

  /* Fetch the assets. */
  useEffect(() => {
    fetchAssets();
  }, [projectID]);

  /* Re-render the media library when an asset was imported */
  const onAssetImport = () => {
    setImportingAsset(false);
    fetchAssets();
  };

  /* Convert seconds to minute:seconds */
  const toTime = (seconds: number) => {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    let strMinutes = minutes < 10 ? "0" + minutes : minutes;
    let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return `${strMinutes}:${strSeconds}`;
  };

  const renderTimestamp = (asset: any) => {
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

  const renderImg = (asset: any) => {
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

  const renderImageTitle = (asset: any) => {
    return (
      <ImageListItemBar
        title={asset ? asset.name : "examplename.mp4"}
        position="below"
        actionIcon={
          <IconButton
            color="info"
            onClick={() => setClips(clips.append(new Clip(asset)))}
          >
            <AddIcon />
          </IconButton>
        }
      />
    );
  };

  /* Describe how to render all assets. */
  const renderAssets = () => {
    if (isLoading) {
      return <CircularProgress />;
    }
    return assets.map((asset: any, i: number) => (
      <ImageListItem key={i} sx={{ width: imageWidth }}>
        {renderTimestamp(asset)}
        {renderImg(asset)}
        {renderImageTitle(asset)}
      </ImageListItem>
    ));
  };

  return (
    <Box minWidth={width} maxWidth={width}>
      <Container disableGutters sx={{ padding: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setImportingAsset(true)}
          fullWidth
        >
          Import Media
        </Button>
        <ImageList cols={cols}>{renderAssets()}</ImageList>
      </Container>
      <NewAssetDialog
        activeProject={projectID!}
        open={importingAsset}
        closeHandler={() => setImportingAsset(false)}
        onAssetCreated={onAssetImport}
      />
    </Box>
  );
};

export default MediaLibrary;
