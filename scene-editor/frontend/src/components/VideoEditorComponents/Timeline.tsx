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
  seekClip,
  useClipsContext,
} from "./ClipsContext";
import { useVideoContext } from "./VideoContext";

/* The fraction that should be displayed per zoom level. */
const ZOOM_FRACTIONS_PER_LEVEL = [1, 0.8, 0.6, 0.4, 0.2];
/* The fraction to move the window when moving left or right. */
const WINDOW_TICKS = 0.1;

const Timeline: React.FC = () => {
  const {
    isPlaying,
    isSeeking,
    currentNode,
    currentTime,
    currentDuration,
    videoClipTime,
    videoClipTimePlayed,
    setIsPlaying,
    setIsSeeking,
    setCurrentNode,
    setCurrentTime,
    setVideoClipTime,
    setVideoClipTimePlayed,
  } = useVideoContext();

  const { state: clipsState, dispatch } = useClipsContext();

  /* State of the timeline window that determines what is displayed. */
  const [zoomLevel, setZoomLevel] = useState(0);
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(1);

  /**
   * Convert seconds to a user friendly display format.
   * @param totalSeconds Total amount of seconds to convert.
   * @returns The time string.
   */
  const toDisplayTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    const strMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
    const strSeconds = seconds.padStart(5, "0");
    return `${strMinutes}:${strSeconds}`;
  };

  /**
   * Convert the fractions of the window bounds to seconds.
   * @returns Object with attributes `lowerBound` and `upperBound`.
   */
  const frac2Seconds = () => {
    const lower = Math.floor(lowerBound * currentDuration);
    const upper = Math.ceil(upperBound * currentDuration);
    return { lowerBound: lower, upperBound: upper };
  };

  /**
   * Move the window left or right by delta.
   * @param delta negative if moving left, positive if moving right.
   */
  const moveWindow = (delta: number) => {
    /* If the delta moves the lower too far, delta the upper bound. */
    if (lowerBound + delta < 0) {
      setLowerBound(0);
      setUpperBound(upperBound + delta - (lowerBound + delta));
      /* If the delta moves the upper too far, delta the lower bound. */
    } else if (upperBound + delta > 1) {
      setLowerBound(lowerBound + delta - (upperBound + delta - 1));
      setUpperBound(1);
    } else {
      setLowerBound(lowerBound + delta);
      setUpperBound(upperBound + delta);
    }
  };

  /**
   * Zoom the window in or out.
   * @param delta 1 if zooming in, 0 if zooming out.
   */
  const zoomWindow = (delta: number) => {
    /* Fraction of total video edit length visible. */
    let f = ZOOM_FRACTIONS_PER_LEVEL[zoomLevel + delta];
    const lo = f / 2;
    const hi = 1 - lo;
    let mid = currentTime / currentDuration;

    const lower = mid < lo ? 0 : mid > hi ? 1 - f : mid - lo;
    const upper = mid < lo ? f : mid > hi ? 1 : mid + lo;
    setLowerBound(lower);
    setUpperBound(upper);
  };

  const handleTimeChange = (event: Event, time: number | number[]) => {
    if (typeof time === "number") {
      const result = seekClip(clipsState, time);
      if (result.node) {
        setIsSeeking(true);
        setVideoClipTimePlayed(time - result.offset);
        setVideoClipTime(result.offset);
        setCurrentNode(result.node);
        setCurrentTime(time);
      }
    }
  };

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

  const MoveLeftButton = () => {
    const canMoveLeft = () => {
      return lowerBound > 0 && clipsState.clips.length > 0;
    };

    const moveLeft = () => moveWindow(-WINDOW_TICKS);

    return (
      <IconButton disabled={!canMoveLeft()} onClick={moveLeft}>
        <ArrowBackIosNewIcon />
      </IconButton>
    );
  };

  const MoveRightButton = () => {
    const canMoveRight = () => {
      return upperBound < 1 && clipsState.clips.length > 0;
    };

    const moveRight = () => moveWindow(WINDOW_TICKS);

    return (
      <IconButton disabled={!canMoveRight()} onClick={moveRight}>
        <ArrowForwardIosIcon />
      </IconButton>
    );
  };

  const ZoomOutButton = () => {
    const canZoomOut = () => {
      return zoomLevel > 0 && clipsState.clips.length > 0;
    };

    const zoomOut = () => {
      if (canZoomOut()) {
        setZoomLevel(zoomLevel - 1);
        zoomWindow(-1);
      }
    };

    return (
      <IconButton disabled={!canZoomOut()} onClick={zoomOut}>
        <ZoomOutIcon />
      </IconButton>
    );
  };

  const ZoomInButton = () => {
    const canZoomIn = () => {
      return (
        zoomLevel < ZOOM_FRACTIONS_PER_LEVEL.length - 1 &&
        clipsState.clips.length > 0
      );
    };

    const zoomIn = () => {
      if (canZoomIn()) {
        setZoomLevel(zoomLevel + 1);
        zoomWindow(1);
      }
    };

    return (
      <IconButton disabled={!canZoomIn()} onClick={zoomIn}>
        <ZoomInIcon />
      </IconButton>
    );
  };

  const ZoomFitButton = () => {
    const resetZoom = () => {
      const zoomLvl = 0;
      setZoomLevel(zoomLvl);
      setLowerBound(0);
      setUpperBound(1);
    };

    return (
      <IconButton disabled={zoomLevel === 0} onClick={() => resetZoom()}>
        <CloseFullscreenIcon />
      </IconButton>
    );
  };

  const TimelineBar = () => {
    const Timer = () => {
      return (
        <Typography display="flex" alignItems="center" color={"black"}>
          {toDisplayTime(currentTime)}/{toDisplayTime(currentDuration)}
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
          <Slider
            max={currentDuration}
            value={currentTime}
            onChange={handleTimeChange}
            valueLabelFormat={(currentTime) => toDisplayTime(currentTime)}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
      <Box
        height={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        sx={{ backgroundColor: "cornflowerblue" }}
      >
        <TimelineArea bounds={frac2Seconds()} />
      </Box>
    </Paper>
  );
};

export default Timeline;
