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

import Forward5Icon from "@mui/icons-material/Forward5";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Replay5Icon from "@mui/icons-material/Replay5";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { Box, IconButton } from "@mui/material";

import { useVideoContext } from "../VideoContext";

type ControlButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  icon: React.ReactNode;
};

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  ariaLabel,
  icon,
}) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label={ariaLabel}
      color="primary"
      size="large"
    >
      {icon}
    </IconButton>
  );
};

const VideoControls: React.FC = () => {
  const { isPlaying, videoTime, videoDuration, handleTogglePlayback, seek } =
    useVideoContext();

  return (
    <Box height="auto" display="flex" justifyContent="center">
      <ControlButton
        onClick={() => seek(0)}
        ariaLabel="Rewind to start"
        icon={<SkipPreviousIcon />}
      />
      <ControlButton
        onClick={() => seek(videoTime - 5)}
        ariaLabel="Rewind 5 seconds"
        icon={<Replay5Icon />}
      />
      <ControlButton
        onClick={handleTogglePlayback}
        ariaLabel={isPlaying ? "Pause" : "Play"}
        icon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      />
      <ControlButton
        onClick={() => seek(videoTime + 5)}
        ariaLabel="Forward 5 seconds"
        icon={<Forward5Icon />}
      />
      <ControlButton
        onClick={() => seek(videoDuration)}
        ariaLabel="Forward to end"
        icon={<SkipNextIcon />}
      />
    </Box>
  );
};

export default VideoControls;
