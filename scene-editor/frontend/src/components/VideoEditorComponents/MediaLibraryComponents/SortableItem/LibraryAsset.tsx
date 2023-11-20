/**
 * LibraryAsset.tsx
 *
 * Description:
 * This Component describes the appearance of an asset in the media library.
 *
 */

import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { IconButtonProps } from "@mui/material/IconButton";

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Asset } from "../AssetsContext";
import { APPEND_CLIP, createClip, useClipsContext } from "../../ClipsContext";
import defaultImage from "../../../../static/images/default.jpg";

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

function LibraryAsset({ asset }: { asset: Asset }) {
  const [expanded, setExpanded] = React.useState(false);

  const { dispatch } = useClipsContext();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleAppendClip = () => {
    dispatch({ type: APPEND_CLIP, payload: { clip: createClip(asset) } });
  };

  const imgPath = asset.thumbnail_path
    ? `/api/asset/${asset.id}/thumbnail`
    : defaultImage;

  return (
    <Card>
      <CardHeader
        avatar={<Avatar alt={asset.name} src={imgPath} />}
        action={
          <div>
            <IconButton onClick={handleAppendClip} aria-label="add to timeline">
              <AddIcon />
            </IconButton>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </div>
        }
        title={asset.name}
        subheader={toDisplayTime(asset.duration)}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardMedia
          component="img"
          height="auto"
          image={imgPath}
          alt={asset.name}
        />
        <CardContent>
          <Typography>{`View Type: ${viewType(asset.view_type)}`}</Typography>
          <Typography>{`Last Updated: ${asset.updated_at}`}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default LibraryAsset;
