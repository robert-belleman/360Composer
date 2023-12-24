/**
 * LibraryAsset.tsx
 *
 * Description:
 * This Component describes the appearance of an asset in the media library.
 *
 */

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconButtonProps } from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

import { viewTypeToValue } from "../../ProjectComponents/AssetView";
import defaultImage from "../../../static/images/default.jpg";
import { ActionTypes, createClip, useClipsContext } from "../ClipsContext";
import { Asset, useAssetsContext } from "./AssetsContext";
import { editAssetMeta } from "../../../util/api";

const toDisplayTime = (seconds: number) => {
  let minutes = Math.floor(seconds / 60);
  let extraSeconds = seconds % 60;
  let strMinutes = minutes < 10 ? "0" + minutes : minutes;
  let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
  return `${strMinutes}:${strSeconds}`;
};

const viewTypeToDisplay = (asset: Asset) => {
  const viewtypeText = {
    "ViewType.mono": "Monoscopic",
    "ViewType.sidetoside": "Side-by-Side (SBS)",
    "ViewType.toptobottom": "Top-Bottom (TB)",
  }[asset.view_type];

  return viewtypeText === undefined ? "Unknown type" : viewtypeText;
};

const projectionFormatToDisplay = (asset: Asset) => {
  const projectionFormatText = {
    equirect: "Equirectangular",
    c3x2: "Cubemap (3x2 layout)",
  }[asset.projection_format];

  return projectionFormatText ? projectionFormatText : "Unknown";
};

const resolutionToDisplay = (asset: Asset) => {
  if (!asset.width || !asset.height) {
    return `unknown`;
  }

  return `${asset.width}x${asset.height}`;
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
  const [editedMeta, setEditedMeta] = useState({
    name: asset.name,
    width: asset.width,
    height: asset.height,
    view_type: viewTypeToValue(asset.view_type),
    projection_format: asset.projection_format,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { dispatch } = useClipsContext();
  const { fetchAssets } = useAssetsContext();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleEditClick = () => {
    setEditedMeta({
      name: asset.name,
      width: asset.width,
      height: asset.height,
      view_type: viewTypeToValue(asset.view_type),
      projection_format: asset.projection_format,
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleChange = (field: keyof Asset, value: string) => {
    setEditedMeta((prevAsset) => ({
      ...prevAsset,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      console.log("Editing asset:", editedMeta);
      const response = await editAssetMeta(editedMeta, asset.id);
      await fetchAssets();
      handleSetAlert("Asset succesfully edited.", "success");
      console.log("Edited asset:", response.data);
    } catch (error) {
      handleSetAlert("An error occured while editing asset.", "error");
      console.log("Error editing asset meta.", error);
    }
    handleEditDialogClose();
  };

  const handleAppendClip = (asset: Asset) => {
    dispatch({
      type: ActionTypes.APPEND_CLIP,
      payload: { clip: createClip(asset) },
    });
  };

  const handleAddToTimeline = async () => {
    handleAppendClip(asset);
  };

  const imgPath = asset.thumbnail_path
    ? `/api/asset/${asset.id}/thumbnail`
    : defaultImage;

  return (
    <>
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
            <IconButton
              onClick={handleAddToTimeline}
              color="primary"
              aria-label="add to timeline"
            >
              <AddIcon />
            </IconButton>
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
              <CardContent sx={{ display: "flex", flexDirection: "column" }}>
                <Typography>{`Last updated: ${asset.updated_at}`}</Typography>
                <Typography>{`Resolution: ${resolutionToDisplay(
                  asset
                )}`}</Typography>
                <Typography>{`View Type: ${viewTypeToDisplay(
                  asset
                )}`}</Typography>
                <Typography>{`Projection Format: ${projectionFormatToDisplay(
                  asset
                )}`}</Typography>
                <div style={{ marginTop: "auto", alignSelf: "flex-end" }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Collapse>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Asset Information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Note that this only changes the information that is displayed and
            does not change the content of the video asset.
          </DialogContentText>
          <TextField
            label="Name"
            name="name"
            value={editedMeta.name}
            onChange={(e) => handleChange("name", e.target.value.trim())}
            fullWidth
            sx={{ mt: 2 }}
          />
          <FormControl
            fullWidth
            sx={{ marginTop: 2 }}
            error={!editedMeta.width || !editedMeta.height}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <TextField
                  type="number"
                  label="Width"
                  variant="outlined"
                  fullWidth
                  value={editedMeta.width ? editedMeta.width : 0}
                  onChange={(e) => handleChange("width", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Height"
                  variant="outlined"
                  fullWidth
                  value={editedMeta.height ? editedMeta.height : 0}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
              </Grid>
            </Grid>
            {(!editedMeta.width || !editedMeta.height) && (
              <FormHelperText>
                Resolution of the video is unknown.
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <InputLabel>View Type</InputLabel>
            <Select
              value={editedMeta.view_type}
              onChange={(e) => handleChange("view_type", e.target.value)}
            >
              <MenuItem value="mono">Monoscopic</MenuItem>
              <MenuItem value="sidetoside">Side-by-Side (SBS)</MenuItem>
              <MenuItem value="toptobottom">Top-Bottom (TB)</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            fullWidth
            sx={{ marginTop: 2 }}
            error={!editedMeta.projection_format}
          >
            <InputLabel>Projection Format</InputLabel>
            <Select
              value={editedMeta.projection_format}
              onChange={(e) =>
                handleChange("projection_format", e.target.value)
              }
            >
              <MenuItem value="">Unknown</MenuItem>
              <MenuItem value="equirect">Equirectangular</MenuItem>
              <MenuItem value="c3x2">Cubemap (3x2 layout)</MenuItem>
            </Select>
            {!editedMeta.projection_format && (
              <FormHelperText>
                Projection format is unknown. This could result in unintended
                output when concatenating videos with different projection
                formats.
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LibraryAsset;
