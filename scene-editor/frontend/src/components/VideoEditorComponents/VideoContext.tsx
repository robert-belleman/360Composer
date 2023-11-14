/**
 * VideoContext.tsx
 *
 * This file defines the VideoContext and VideoProvider Components, which manage
 * the state and behavior related to video playback within the VideoEditor.
 *
 * Components:
 * - VideoContext: A React context that provides the video-related state and functions.
 * - VideoProvider: A React component that wraps the application and provides the VideoContext.
 * - useVideoContext: A custom hook to access the VideoContext within functional components.
 *
 * Functionality:
 * - Manages video playback state, current clip, and current playback time.
 * - Provides functions to control video playback, adjust playback time, and load video sources.
 * - Listens to the video time update event to keep track of the current playback time.
 * - Logs errors and relevant information during video source loading.
 *
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Hls from "hls.js";
import { HlsContext } from "../../App";
import { Asset } from "./AssetsContext";
import { useClipsContext } from "./ClipsContext";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentClip: Asset | null;
  currentClipTime: number;
  isPlaying: boolean;
  togglePlaybackState: () => void;
  adjustCurrentClipTimeByDelta: (delta: number) => void;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const VideoProvider: React.FC = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentClip, setCurrentClip] = useState<Asset | null>(null);
  const [currentClipTime, setCurrentClipTime] = useState(0);

  const hls = useContext<Hls | undefined>(HlsContext);
  const { clipsState } = useClipsContext();

  /**
   * Stop or resume video playback of the clip in videoRef.
   */
  const togglePlaybackState = useCallback(() => {
    const { current: videoElement } = videoRef;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }

      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  /**
   * Add the delta to the current time. If the new time is over the duration
   * of the video or negative, try to change to a different clip. If that is
   * not possible, stay in the bounds of the video length.
   */
  const adjustCurrentClipTimeByDelta = useCallback(
    (delta: number) => {
      const { current: videoElement } = videoRef;

      if (videoElement) {
        const newTime = videoElement.currentTime + delta;
        const exceedClipEnd = newTime > videoElement.duration;
        const exceedClipStart = newTime < 0;

        if (exceedClipEnd) {
          // TODO: Handle exceed clip end
        } else if (exceedClipStart) {
          // TODO: Handle exceed clip start
        } else {
          videoElement.currentTime = newTime;
        }
      }
    },
    [videoRef]
  );

  // Set the currentClip based on clips
  useEffect(() => {
    if (clipsState.clips.length > 0) {
      setCurrentClip(clipsState.clips[clipsState.clips.length - 1].asset);
    }
  }, [clipsState.clips.length]);

  /* Set the currentClipTime based on video time. */
  useEffect(() => {
    const { current: videoElement } = videoRef;

    const handleTimeUpdate = () => {
      if (videoElement) {
        setCurrentClipTime(videoElement.currentTime);
      }
    };

    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [videoRef, setCurrentClipTime]);

  /* Load the source of the Clip `clip` with HLS whenever it changes. */
  useEffect(() => {
    const { current: videoElem } = videoRef;

    /* If there is no source to load, then stop. */
    if (!currentClip) {
      return;
    }

    if (!videoElem || !hls) {
      console.error(
        "Error loading video: Video element or HLS not available. Clip: ",
        currentClip
      );
      return;
    }

    const loadHlsSource = (source: string) => {
      try {
        hls.loadSource(source);
        hls.attachMedia(videoElem);
      } catch (error) {
        console.error("Error loading video:", error);
      }
    };

    const hlsSource = `/assets/${currentClip?.path}`;

    if (!hlsSource) {
      console.error(
        "Error loading video: HLS source URL is empty or undefined"
      );
      return;
    }

    /* Check if HLS is supported and load the video source. */
    if (Hls.isSupported()) {
      loadHlsSource(hlsSource);
    } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
      videoElem.src = hlsSource;
    } else {
      console.error("No HLS support");
    }

    console.log("Loaded HLS source:", hlsSource);
  }, [currentClip, hls]);

  return (
    <VideoContext.Provider
      value={{
        videoRef,
        currentClip,
        currentClipTime,
        isPlaying,
        togglePlaybackState,
        adjustCurrentClipTimeByDelta,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};
