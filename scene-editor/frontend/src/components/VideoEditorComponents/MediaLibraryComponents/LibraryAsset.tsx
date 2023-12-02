/**
 * LibraryAsset.tsx
 *
 * Description:
 * This Component describes the appearance of an asset in the media library.
 *
 */

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

import defaultImage from "../../../static/images/default.jpg";
import { ActionTypes, createClip, useClipsContext } from "../ClipsContext";
import { MAX_CONCURRENT_INIT_HLS_CALLS } from "../Constants";
import { Asset, useAssetsContext } from "./AssetsContext";

const toDisplayTime = (seconds: number) => {
  let minutes = Math.floor(seconds / 60);
  let extraSeconds = seconds % 60;
  let strMinutes = minutes < 10 ? "0" + minutes : minutes;
  let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
  return `${strMinutes}:${strSeconds}`;
};

const viewType = (viewtype: string) => {
  const viewtypeText = {
    "ViewType.mono": "monoscopic",
    "ViewType.sidetoside": "side-by-side",
    "ViewType.toptobottom": "top-bottom",
  }[viewtype];

  return viewtypeText === undefined ? "Unknown type" : viewtypeText;
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const LibraryAsset = ({ asset }: { asset: Asset }) => {
  const [expanded, setExpanded] = useState(false);
  const [enablingHLS, setEnablingHLS] = useState(false);

  const { dispatch } = useClipsContext();
  const { activeApiCalls, attemptInitHLS } = useAssetsContext();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleAppendClip = (asset: Asset) => {
    dispatch({
      type: ActionTypes.APPEND_CLIP,
      payload: { clip: createClip(asset) },
    });
  };

  const handleAddToTimeline = async () => {
    if (asset.hls_path === null) {
      setEnablingHLS(true);

      const updatedAsset = await attemptInitHLS(asset);
      if (updatedAsset !== null) handleAppendClip(updatedAsset);

      setEnablingHLS(false);
      return;
    }
    handleAppendClip(asset);
  };

  const imgPath = asset.thumbnail_path
    ? `/api/asset/${asset.id}/thumbnail`
    : defaultImage;

  return (
    <Card
      style={{
        margin: 4,
        borderLeft: "7px solid dodgerblue",
        borderRight: "7px solid crimson",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              overflow: "hidden",
              textOverflow: expanded ? "unset" : "ellipsis",
              whiteSpace: expanded ? "normal" : "nowrap",
            }}
          >
            {asset.name}
          </Typography>
          <Typography color="text.secondary">
            {toDisplayTime(asset.duration)}
          </Typography>
        </Stack>
        <Stack alignItems="center">
          {enablingHLS ? (
            <IconButton>
              <CircularProgress size={20} />
            </IconButton>
          ) : (
            <IconButton
              disabled={activeApiCalls >= MAX_CONCURRENT_INIT_HLS_CALLS}
              onClick={handleAddToTimeline}
              color="primary"
              aria-label="add to timeline"
            >
              <AddIcon />
            </IconButton>
          )}
          <ExpandMore
            color="primary"
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Stack>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {expanded && (
          <>
            <CardMedia
              component="img"
              height="auto"
              image={imgPath}
              alt={asset.name}
            />
            <CardContent>
              <Typography>{`Last updated: ${asset.updated_at}`}</Typography>
              <Typography>{`View type: ${viewType(
                asset.view_type
              )}`}</Typography>
            </CardContent>
          </>
        )}
      </Collapse>
    </Card>
  );
};

export default LibraryAsset;
