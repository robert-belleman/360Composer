/**
 * VideoContext.tsx
 *
 * Description:
 * This file defines a React Context for the video, which is all the video
 * clips in the timeline combined. The context, VideoContext, encapsulates
 * the state of video clips between different files.
 *
 */

import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Clip, seekIndex, useClipsContext } from "./ClipsContext";

interface VideoContextProps {
  isPlaying: boolean;
  isSeeking: boolean;
  reloading: boolean;
  currentIndex: number | null;
  currentTime: number;
  currentDuration: number;
  videoClipTime: number;
  videoClipTimePlayed: number;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setIsSeeking: Dispatch<SetStateAction<boolean>>;
  setReloading: Dispatch<SetStateAction<boolean>>;
  setCurrentIndex: Dispatch<SetStateAction<number | null>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  setVideoClipTime: Dispatch<SetStateAction<number>>;
  setVideoClipTimePlayed: Dispatch<SetStateAction<number>>;
  play: (videoElem: HTMLVideoElement) => void;
  playNext: (videoElem: HTMLVideoElement) => void;
  seek: (time: number) => void;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

const VideoProvider: React.FC = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);

  const [videoClipTime, setVideoClipTime] = useState(0);
  const [videoClipTimePlayed, setVideoClipTimePlayed] = useState(0);

  const { state: clipsState } = useClipsContext();

  /* After any changes to the length, start on the head. */
  useEffect(() => {
    if (clipsState.clips.length === 1) {
      seek(0);
    } else if (clipsState.clips.length > 1) {
      seek(currentTime);
    }
  }, [clipsState.clips.length]);

  /* If the total time changes, update the state of the total time. */
  useEffect(() => {
    setCurrentDuration(clipsState.totalDuration);
  }, [clipsState.totalDuration]);

  /**
   * Play the video of `videoElem`. If the video ended, restart from time = 0.
   * @param videoElem element to play video of.
   */
  const play = (videoElem: HTMLVideoElement) => {
    const onCanPlay = () => {
      videoElem.removeEventListener("canplay", onCanPlay);
      videoElem.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    };

    if (currentDuration <= currentTime) {
      /* If play is clicked after finishing, then restart the entire video. */
      if (clipsState.clips) seek(0);
      videoElem.load();
      return;
    }

    // Check if the video is ready to play
    if (videoElem.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      // The video is ready to play, no need to wait for 'canplay'
      videoElem.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    } else {
      // Wait for the 'canplay' event before attempting to play
      videoElem.addEventListener("canplay", onCanPlay);
    }
  };

  /**
   * Play the next video clip. If there is no next clip, stop playing.
   * @param videoElem element to play video of.
   */
  const playNext = (videoElem: HTMLVideoElement) => {
    /* If there is no next video clip, then stop. */
    if (currentIndex === null || currentIndex === clipsState.clips.length - 1) {
      setIsPlaying(false);
      videoElem.pause();
      return;
    }

    /* Seek to the start of next clip. */
    seek(videoClipTimePlayed + clipsState.clips[currentIndex].duration);
  };

  /**
   * Go to a specific time in the entire video (all clips).
   * @param time time to got to.
   */
  const seek = (time: number) => {
    const { index, timeInClip } = seekIndex(clipsState, time);

    if (index !== null) {
      setIsSeeking(true);
      setVideoClipTimePlayed(time - timeInClip);
      setVideoClipTime(timeInClip);
      setCurrentIndex(index);
      setCurrentTime(time);
      return;
    }

    if (time < 0) {
      setIsSeeking(true);
      setVideoClipTimePlayed(0);
      setVideoClipTime(0);
      setCurrentTime(0);
      setCurrentIndex(clipsState.clips ? 0 : null);
      return;
    }

    if (time > clipsState.totalDuration) {
      setIsSeeking(true);
      setCurrentTime(clipsState.totalDuration);
      if (clipsState.clips) {
        const lastIndex = clipsState.clips.length - 1;
        const lastClip = clipsState.clips[lastIndex];
        setVideoClipTimePlayed(clipsState.totalDuration - lastClip.duration);
        setVideoClipTime(lastClip.duration);
        setCurrentIndex(lastIndex);
      }
      return;
    }
  };

  const value: VideoContextProps = {
    isPlaying,
    isSeeking,
    reloading,
    currentIndex,
    currentTime,
    currentDuration,
    videoClipTime,
    videoClipTimePlayed,
    setIsPlaying,
    setIsSeeking,
    setReloading,
    setCurrentIndex,
    setCurrentTime,
    setVideoClipTime,
    setVideoClipTimePlayed,
    play,
    playNext,
    seek,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

const useVideoContext = (): VideoContextProps => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};

export { VideoProvider, useVideoContext };
