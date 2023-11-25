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
  const {
    videoRef,
    isPlaying,
    setIsPlaying,
    currentIndex,
    currentTime,
    currentDuration,
    play,
    reset,
    seek,
  } = useVideoContext();

  /**
   * Pause or resume playback of the video.
   */
  const togglePlayback = () => {
    const { current: videoElem } = videoRef;
    if (videoElem) {
      if (videoElem.currentSrc) setIsPlaying(!isPlaying);

      if (currentDuration <= currentTime) reset();
      else if (isPlaying) videoElem.pause();
      else play(videoElem);
    }
  };

  /**
   * Add or subtract a number of seconds to the current time.
   * @param delta The number of seconds to add or subtract.
   */
  const addTime = (delta: number) => {
    const { current: videoElem } = videoRef;
    if (videoElem) {
      const newTime = videoElem.currentTime + delta;
      const exceedClipEnd = newTime > videoElem.duration;
      const exceedClipStart = newTime < 0;
      if (exceedClipEnd || exceedClipStart) {
        if (currentIndex !== null) seek(currentTime + delta);
      } else {
        videoElem.currentTime = newTime;
      }
    }
  };

  return (
    <Box height="auto" display="flex" justifyContent="center">
      <ControlButton
        onClick={() => seek(0)}
        ariaLabel="Rewind to start"
        icon={<SkipPreviousIcon />}
      />
      <ControlButton
        onClick={() => addTime(-5)}
        ariaLabel="Rewind 5 seconds"
        icon={<Replay5Icon />}
      />
      <ControlButton
        onClick={togglePlayback}
        ariaLabel={isPlaying ? "Pause" : "Play"}
        icon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      />
      <ControlButton
        onClick={() => addTime(5)}
        ariaLabel="Forward 5 seconds"
        icon={<Forward5Icon />}
      />
      <ControlButton
        onClick={() => seek(currentDuration - 1)}
        ariaLabel="Forward to end"
        icon={<SkipNextIcon />}
      />
    </Box>
  );
};

export default VideoControls;
