/*
Filename: MediaLibrary.tsx
Description:
This file describes media library component of the video editor.
The library acts as a place to see video assets of the user that
they want to use in their video edit.
 */

import React from "react";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";

import AddIcon from "@mui/icons-material/Add";

import { Skeleton } from "@mui/material";
import defaultImage from "../../static/images/default.jpg";

const cols = 2;

type MediaLibraryProps = {
  assets: never[];
  loading: boolean;
  width: number;
};

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  assets,
  loading,
  width,
}) => {
  console.log("Media Library Rendered");

  /* Convert seconds to minute:seconds */
  const toTime = (seconds: number) => {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    let strMinutes = minutes < 10 ? "0" + minutes : minutes;
    let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return `${strMinutes}:${strSeconds}`;
  };

  /* Describe how to render all assets. */
  const renderAssets = () => {
    return assets.map((asset: any) => (
      <ImageListItem key={asset.id} sx={{ width: width / 2 - 19 }}>
        <ImageListItemBar
          sx={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
              "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
          }}
          title={toTime(asset.duration)}
          position="top"
        />
        <img
          src={
            asset.thumbnail_path
              ? `/api/asset/${asset.id}/thumbnail`
              : defaultImage
          }
          alt={asset.name}
          loading="lazy"
        />
        <ImageListItemBar
          title={asset.name}
          position="below"
          actionIcon={
            <IconButton color="info" onClick={() => console.log("CLICKED")}>
              <AddIcon />
            </IconButton>
          }
        />
      </ImageListItem>
    ));
  };

  /* Render skeleton when assets are still being fetched. */
  const renderSkeletons = () => {
    return (
      <ImageList cols={cols}>
        <ImageListItem>
          <Skeleton variant="rectangular" width={width / 2 - 20} height={100} />
        </ImageListItem>
        <ImageListItem>
          <Skeleton variant="rectangular" width={width / 2 - 20} height={100} />
        </ImageListItem>
        <ImageListItem>
          <Skeleton variant="rectangular" width={width / 2 - 20} height={100} />
        </ImageListItem>
      </ImageList>
    );
  };

  /* Render list of assets. */
  const renderMedia = () => {
    if (loading) {
      return renderSkeletons();
    }
    return <ImageList cols={cols}>{renderAssets()}</ImageList>;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
      }}
    >
      <Container disableGutters sx={{ padding: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          // onClick={() => {}} // TODO: add to timeline
          fullWidth
        >
          Import Media
        </Button>
        {renderMedia()}
      </Container>
    </Drawer>
  );
};

export default React.memo(MediaLibrary);
