/**
 * VideoControls.tsx
 *
 * Description:
 * This React component represents a set of video control buttons, including
 * rewind, play/pause, and forward functionalities. It utilizes Material-UI's
 * IconButton and icons to provide a user interface for controlling video
 * playback.
 *
 */

import React from "react";

import { Box, IconButton } from "@mui/material";

import Forward5Icon from "@mui/icons-material/Forward5";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Replay5Icon from "@mui/icons-material/Replay5";
import { useVideoContext } from "../VideoContext";

const VideoControls: React.FC = () => {
  const { isPlaying, togglePlaybackState, adjustCurrentClipTimeByDelta } =
    useVideoContext();

  const RewindIconButton = React.memo(() => {
    return (
      <IconButton
        id="rewindButton"
        onClick={() => adjustCurrentClipTimeByDelta(-5)}
        color="primary"
        size="large"
        aria-label="Rewind 5 seconds"
      >
        <Replay5Icon />
      </IconButton>
    );
  });

  const PlayPauseIconButton = React.memo(() => {
    return (
      <IconButton
        id="playPauseButton"
        onClick={togglePlaybackState}
        color="primary"
        size="large"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    );
  });

  const ForwardIconButton = React.memo(() => {
    return (
      <IconButton
        id="forwardButton"
        onClick={() => adjustCurrentClipTimeByDelta(5)}
        color="primary"
        size="large"
        aria-label="Forward 5 seconds"
      >
        <Forward5Icon />
      </IconButton>
    );
  });

  return (
    <Box height="auto" display="flex" justifyContent="center">
      <RewindIconButton />
      <PlayPauseIconButton />
      <ForwardIconButton />
    </Box>
  );
};

export default VideoControls;
