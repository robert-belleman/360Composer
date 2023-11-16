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

/* Third Party Imports */
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

/* Project Specific Imports */
import TimelineArea from "./TimelineComponents/TimelineArea";
import {
  MINIMUM_CLIP_LENGTH,
  TIMELINE_HEIGHT,
  TIMELINE_SLIDER_STEP,
} from "./Constants";
import {
  DELETE_CLIPS,
  DUPLICATE_CLIPS,
  REDO,
  SPLIT_CLIP,
  UNDO,
  canRedo,
  canSplit,
  canUndo,
  seekClip,
  useClipsContext,
} from "./ClipsContext";
import { useVideoContext } from "./VideoContext";

/* The fraction that should be displayed per zoom level. */
const ZOOM_FRACTIONS_PER_LEVEL = [1, 0.8, 0.6, 0.4, 0.2];
/* The fraction to move the window when moving left or right. */
const WINDOW_TICKS = 0.1;

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

const TimelineButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ disabled, onClick, icon }) => {
  return (
    <IconButton disabled={disabled} onClick={onClick}>
      {icon}
    </IconButton>
  );
};

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

  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);

  /* State of the timeline window that determines what is displayed. */
  const [zoomLevel, setZoomLevel] = useState(0);
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(1);

  /**
   * Change the video time whenever the Slider value changes.
   * @param event
   * @param time
   */
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

  const anySelected = () => {
    return selectedNodes.length == 0; // TODO: not checking for selected.
  };

  /* Clip manipulation functions. */
  const handleUndo = () => dispatch({ type: UNDO });
  const handleRedo = () => dispatch({ type: REDO });
  const handleSplitClip = () => {
    dispatch({ type: SPLIT_CLIP, payload: { time: currentTime } });
  };
  const handleDuplicateClips = () => {
    const amountSelected = selectedNodes.length;
    dispatch({ type: DUPLICATE_CLIPS, payload: { indices: selectedNodes } });

    /* Select the newly added nodes. */
    let current = clipsState.clips.tail;
    let newNodes = [];
    for (let i = 0; i < amountSelected; i++) {
      newNodes.push(current!.id);
      current = current!.prev;
    }
    setSelectedNodes(newNodes);
  };
  const handleDeleteClips = () => {
    const resetCurrentNode = currentNode?.selected || false;
    dispatch({ type: DELETE_CLIPS, payload: { indices: selectedNodes } });
    if (resetCurrentNode) setCurrentNode(clipsState.clips.head || undefined);

    /* Deselect all nodes */
    setSelectedNodes([]);
  };

  /* Window manipulation functions. */
  const canMoveLeft = () => lowerBound > 0 && clipsState.clips.length > 0;
  const canMoveRight = () => upperBound < 1 && clipsState.clips.length > 0;
  const canZoomOut = () => zoomLevel > 0 && clipsState.clips.length > 0;
  const canZoomIn = () => {
    return (
      zoomLevel < ZOOM_FRACTIONS_PER_LEVEL.length - 1 &&
      clipsState.clips.length > 0
    );
  };
  const canResetZoom = () => zoomLevel !== 0;
  const moveLeft = () => moveWindow(-WINDOW_TICKS);
  const moveRight = () => moveWindow(WINDOW_TICKS);
  const zoomOut = () => {
    if (canZoomOut()) {
      setZoomLevel(zoomLevel - 1);
      zoomWindow(-1);
    }
  };
  const zoomIn = () => {
    if (canZoomIn()) {
      setZoomLevel(zoomLevel + 1);
      zoomWindow(1);
    }
  };
  const resetZoom = () => {
    const zoomLvl = 0;
    setZoomLevel(zoomLvl);
    setLowerBound(0);
    setUpperBound(1);
  };

  const TimelineBar = () => {
    const DisplayTime = () => {
      return (
        <Typography display="flex" alignItems="center" color={"black"}>
          {toDisplayTime(currentTime)}/{toDisplayTime(currentDuration)}
        </Typography>
      );
    };

    return (
      <AppBar position="static">
        <Toolbar variant="dense">
          <TimelineButton
            disabled={!canUndo(clipsState)}
            onClick={handleUndo}
            icon={<UndoIcon />}
          />
          <TimelineButton
            disabled={!canRedo(clipsState)}
            onClick={handleRedo}
            icon={<RedoIcon />}
          />
          <TimelineButton
            disabled={!canSplit(clipsState)}
            onClick={handleSplitClip}
            icon={<ContentCutIcon />}
          />
          <TimelineButton
            disabled={!anySelected()}
            onClick={handleDeleteClips}
            icon={<DeleteIcon />}
          />
          <TimelineButton
            disabled={!anySelected()}
            onClick={handleDuplicateClips}
            icon={<ContentCopyIcon />}
          />
          <Box flexGrow={1} display="flex" justifyContent="center">
            <DisplayTime />
          </Box>
          <TimelineButton
            disabled={!canMoveLeft()}
            onClick={moveLeft}
            icon={<ArrowBackIosNewIcon />}
          />
          <TimelineButton
            disabled={!canMoveRight()}
            onClick={moveRight}
            icon={<ArrowForwardIosIcon />}
          />
          <TimelineButton
            disabled={!canZoomOut()}
            onClick={zoomOut}
            icon={<ZoomOutIcon />}
          />
          <TimelineButton
            disabled={!canZoomIn()}
            onClick={zoomIn}
            icon={<ZoomInIcon />}
          />
          <TimelineButton
            disabled={!canResetZoom()}
            onClick={resetZoom}
            icon={<CloseFullscreenIcon />}
          />
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
            step={TIMELINE_SLIDER_STEP}
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
        <TimelineArea
          bounds={frac2Seconds()}
          selected={selectedNodes}
          setSelected={setSelectedNodes}
        />
      </Box>
    </Paper>
  );
};

export default Timeline;
