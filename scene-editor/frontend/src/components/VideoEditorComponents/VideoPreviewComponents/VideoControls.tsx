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

type VideoControlsProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  play: (videoElem: HTMLVideoElement) => void;
};

const RewindIconButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <IconButton
      id="rewindButton"
      onClick={onClick}
      color="primary"
      size="large"
      aria-label="Rewind 5 seconds"
    >
      <Replay5Icon />
    </IconButton>
  );
};

const PlayPauseIconButton: React.FC<{
  onClick: () => void;
  isPlaying: boolean;
}> = ({ onClick, isPlaying }) => {
  return (
    <IconButton
      id="playPauseButton"
      onClick={onClick}
      color="primary"
      size="large"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );
};

const ForwardIconButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <IconButton
      id="forwardButton"
      onClick={onClick}
      color="primary"
      size="large"
      aria-label="Forward 5 seconds"
    >
      <Forward5Icon />
    </IconButton>
  );
};

const VideoControls: React.FC<VideoControlsProps> = ({ videoRef, play }) => {
  const { isPlaying, setIsPlaying, currentNode, currentTime, seek } =
    useVideoContext();

  /**
   * Pause or resume playback of the video.
   */
  const togglePlayback = () => {
    const { current: videoElem } = videoRef;
    if (videoElem) {
      if (isPlaying) {
        videoElem.pause();
      } else {
        play(videoElem);
      }
      setIsPlaying(!isPlaying);
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
        if (currentNode) seek(currentTime + delta);
      } else {
        videoElem.currentTime = newTime;
      }
    }
  };

  return (
    <Box height="auto" display="flex" justifyContent="center">
      <RewindIconButton onClick={() => addTime(-5)} />
      <PlayPauseIconButton isPlaying={isPlaying} onClick={togglePlayback} />
      <ForwardIconButton onClick={() => addTime(5)} />
    </Box>
  );
};

export default VideoControls;
