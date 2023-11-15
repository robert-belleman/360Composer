/**
 * Timeline.tsx
 *
 * Description:
 * This module describes the Timeline Component of the VideoEditor.
 * This file mostly focuses on the menu options regarding the timeline.
 * Example options are: Cut/Trim, Delete, Duplicate, etc.
 *
 * The Timeline contains the following Components:
 *   - TimelineArea. A Box showing multiple clips and their edits.
 *
 */

import React, { useEffect, useState } from "react";

import {
  AppBar,
  Box,
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

import TimelineArea from "./TimelineComponents/TimelineArea";

import { TIMELINE_HEIGHT } from "./Constants";

import {
  DELETE_CLIPS,
  DUPLICATE_CLIPS,
  REDO,
  SPLIT_CLIP,
  UNDO,
  canRedo,
  canUndo,
  useClipsContext,
} from "./ClipsContext";
import { useVideoContext } from "./VideoContext";

/* The fraction that should be displayed per zoom level. */
const ZOOM_FRACTIONS_PER_LEVEL = [1, 0.8, 0.6, 0.4, 0.2];
/* The fraction to move the camera when moving left or right. */
const CAMERA_WINDOW_TICKS = 0.1;

const Timeline: React.FC = () => {
  const { state: clipsState, dispatch } = useClipsContext();
  const {  } = useVideoContext();

  const UndoButton = () => {
    const handleUndo = () => {
      dispatch({ type: UNDO });
    };
    return (
      <IconButton disabled={!canUndo(clipsState)} onClick={handleUndo}>
        <UndoIcon />
      </IconButton>
    );
  };

  const RedoButton = () => {
    const handleRedo = () => {
      dispatch({ type: REDO });
    };

    return (
      <IconButton disabled={!canRedo(clipsState)} onClick={handleRedo}>
        <RedoIcon />
      </IconButton>
    );
  };

  const SplitButton = () => {
    const handleSplitClip = (time: number) => {
      dispatch({ type: SPLIT_CLIP, payload: { time: time } });
    };
    return (
      <IconButton onClick={() => handleSplitClip(currentTime)}>
        <ContentCutIcon />
      </IconButton>
    );
  };

  const DeleteButton = () => {
    // TODO disable if nothing selected
    const handleDeleteClips = () => {
      dispatch({ type: DELETE_CLIPS });
    };
    return (
      <IconButton onClick={() => handleDeleteClips()}>
        <DeleteIcon />
      </IconButton>
    );
  };

  const DuplicateButton = () => {
    // TODO disable if nothing selected
    const handleDuplicateClips = () => {
      dispatch({ type: DUPLICATE_CLIPS });
    };
    return (
      <IconButton onClick={() => handleDuplicateClips()}>
        <ContentCopyIcon />
      </IconButton>
    );
  };

  const PlayPauseButton = () => {
    return (
      <IconButton>
        {/* {isPlaying ? <PauseIcon /> : <PlayArrowIcon />} */}
      </IconButton>
    );
  };

  const MoveLeftButton = () => {
    return (
      <IconButton>
        <ArrowBackIosNewIcon />
      </IconButton>
    );
  };

  const MoveRightButton = () => {
    return (
      <IconButton>
        <ArrowForwardIosIcon />
      </IconButton>
    );
  };

  const ZoomOutButton = () => {
    return (
      <IconButton>
        <ZoomOutIcon />
      </IconButton>
    );
  };

  const ZoomInButton = () => {
    return (
      <IconButton>
        <ZoomInIcon />
      </IconButton>
    );
  };

  const ZoomFitButton = () => {
    return (
      <IconButton>
        <CloseFullscreenIcon />
      </IconButton>
    );
  };

  const TimelineBar = () => {
    const Timer = () => {
      /* Convert seconds to minute:seconds */
      const toTime = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let extraSeconds = seconds % 60;
        let strMinutes = minutes < 10 ? "0" + minutes : minutes;
        let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
        return `${strMinutes}:${strSeconds}`;
      };

      let strCurrentTime = toTime(currentTime);
      let strTotalTime = toTime(totalTime);
      return (
        <Typography display="flex" alignItems="center" color={"black"}>
          {strCurrentTime}/{strTotalTime}
        </Typography>
      );
    };

    return (
      <AppBar position="static">
        <Toolbar variant="dense">
          <UndoButton />
          <RedoButton />
          <SplitButton />
          <DeleteButton />
          <DuplicateButton />
          <Box flexGrow={1} display="flex" justifyContent="center">
            <PlayPauseButton />
            <Timer />
          </Box>
          <MoveLeftButton />
          <MoveRightButton />
          <ZoomOutButton />
          <ZoomInButton />
          <ZoomFitButton />
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <Paper
      sx={{ height: TIMELINE_HEIGHT, display: "flex", flexFlow: "column" }}
    >
      <Box>
        <TimelineBar />
        <Box overflow={"hidden"}>
          {/* <Slider
            max={totalTime}
            value={currentTime}
            onChange={handleTimeChange}
            valueLabelFormat={(currentTime) => toTime(currentTime)}
            valueLabelDisplay="auto"
          /> */}
        </Box>
      </Box>
      <Box
        height={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        sx={{ backgroundColor: "cornflowerblue" }}
      >
        {/* <TimelineArea bounds={windowInfo()} /> */}
      </Box>
    </Paper>
  );
};

export default Timeline;
