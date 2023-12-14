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
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

import defaultImage from "../../../static/images/default.jpg";
import { ActionTypes, createClip, useClipsContext } from "../ClipsContext";
import { MAX_CONCURRENT_INIT_HLS_CALLS } from "../Constants";
import { Asset, useAssetsContext } from "./AssetsContext";
import { changeViewType } from "../../../util/api";

const toDisplayTime = (seconds: number) => {
  let minutes = Math.floor(seconds / 60);
  let extraSeconds = seconds % 60;
  let strMinutes = minutes < 10 ? "0" + minutes : minutes;
  let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
  return `${strMinutes}:${strSeconds}`;
};

const viewTypeToValue = (viewtype: string) => {
  const viewtypeText = {
    "ViewType.mono": "mono",
    "ViewType.sidetoside": "sidetoside",
    "ViewType.toptobottom": "toptobottom",
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

type AssetViewProps = {
  asset: Asset;
  handleSetAlert: (message: string, severity: string) => void;
};

const LibraryAsset: React.FC<AssetViewProps> = ({ asset, handleSetAlert }) => {
  const [expanded, setExpanded] = useState(false);
  const [enablingHLS, setEnablingHLS] = useState(false);

  const { dispatch } = useClipsContext();
  const { activeApiCalls, attemptInitHLS, fetchAssets } = useAssetsContext();

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

  const handleChangeViewType = async (newViewType: string, assetId: string) => {
    try {
      await changeViewType(newViewType, assetId);
      handleSetAlert(
        `Asset's view type succesfully changed to ${newViewType}`,
        "success"
      );
      await fetchAssets();
    } catch (error) {
      console.log('An error occured whilst editing asset "view type"', error);
    }
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
              <Select
                labelId="viewtype"
                id="viewtype-select"
                value={viewTypeToValue(asset.view_type)}
                label="View Type"
                onChange={(event) =>
                  handleChangeViewType(event.target.value, asset.id)
                }
                autoWidth={true}
                variant="outlined"
                size="small"
              >
                <MenuItem value={"mono"}>Monoscopic</MenuItem>
                <MenuItem value={"sidetoside"}>Side by Side</MenuItem>
                <MenuItem value={"toptobottom"}>Top-Bottom</MenuItem>
              </Select>
              {/* <Typography>{`View type: ${viewType(
                asset.view_type
              )}`}</Typography> */}
            </CardContent>
          </>
        )}
      </Collapse>
    </Card>
  );
};

export default LibraryAsset;
