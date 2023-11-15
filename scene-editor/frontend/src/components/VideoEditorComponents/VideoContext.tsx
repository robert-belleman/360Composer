/**
 * VideoContext.tsx
 *
 * This file defines the VideoContext and VideoProvider Components, which manage
 * the state and behavior related to video playback within the VideoEditor.
 *
 * Components:
 * - VideoContext: Context that provides the video-related state and functions.
 * - VideoProvider: Component that wraps the application and provides the VideoContext.
 * - useVideoContext: Hook to access the VideoContext within functional components.
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
import { Clip, useClipsContext } from "./ClipsContext";
import { DLLNode } from "./DoublyLinkedList";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  currentClipNode: DLLNode<Clip> | undefined;
  isPlaying: boolean;
  togglePlaybackState: () => void;
  adjustCurrentClipTimeByDelta: (delta: number) => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

/**
 * Get the source of a Clip `clip`.
 * @param clip Clip to get the source of.
 * @returns Source of the Clip `clip`.
 */
const getClipSource = (clip: Clip) => `/assets/${clip.asset.path}`;

/**
 * Load a source into a HTMLVideoElement using Hls.
 * @param videoElem HTML element to load the source into.
 * @param hls Hls class instance
 * @param source Source to load into the HTML element.
 */
const loadClipSourceWithHls = (
  videoElem: HTMLVideoElement,
  hls: Hls,
  source: string
) => {
  try {
    hls.loadSource(source);
    hls.attachMedia(videoElem);
    console.log("Loaded HLS source:", source);
  } catch (error) {
    console.error("Error loading video:", error);
  }
};

export const VideoProvider: React.FC = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* State variables for the video edit (all clips combined). */
  const [currentTotalTime, setCurrentTotalTime] = useState(0);
  const [currentTotalDuration, setCurrentTotalDuration] = useState(0);
  const [currentTotalTimePlayed, setCurrentTotalTimePlayed] = useState(0);

  /* State variables for a single clip. */
  const [currentClipNode, setCurrentClipNode] = useState<DLLNode<Clip>>();
  const [currentClipTime, setCurrentClipTime] = useState(0);

  const hls = useContext<Hls | undefined>(HlsContext);
  const { state: clipsState } = useClipsContext();

  /**
   * Start playback of the video element.
   * @param videoElem Element to start playback of.
   */
  const play = (videoElem: HTMLVideoElement) => {
    // Now you can safely call videoElem.play()
    videoElem.play().catch((error) => {
      console.error("Error playing video:", error);
    });
  };

  /* Update state variabels when loading a new Clip `clip`. */
  const loadNewClipNode = (
    videoElem: HTMLVideoElement,
    node: DLLNode<Clip>
  ) => {
    videoElem.currentTime = node.data.startTime;
    setCurrentClipNode(node);
    setCurrentClipTime(0);

    /* If it was playing, continue playing. */
    if (isPlaying) play(videoElem);
  };

  const loadNextClip = (videoElem: HTMLVideoElement) => {
    if (currentClipNode && currentClipNode.next) {
      const timePlayed = currentClipNode.data.duration;
      setCurrentTotalTimePlayed(currentTotalTimePlayed + timePlayed);
      loadNewClipNode(videoElem, currentClipNode.next);
    } else {
      setIsPlaying(false);

      /* If the video edit finished, rewind to the start of the video edit. */
      if (currentTotalDuration <= currentTotalTime) {
        setCurrentTotalTimePlayed(0);
        setCurrentClipNode(clipsState.clips.head!);
      }
    }
  };

  /**
   * Load a source into a HTMLVideoElement.
   * @param videoElem HTML element to load the source into.
   * @param hls Hls class instance to load with Hls when it is supported.
   * @param source Source to load into the HTML element.
   */
  const loadClipSource = (
    videoElem: HTMLVideoElement,
    hls: Hls,
    source: string
  ) => {
    setIsLoading(true);

    if (Hls.isSupported()) {
      loadClipSourceWithHls(videoElem, hls, source);
    } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
      videoElem.src = source;
    } else {
      console.error("No HLS support");
    }

    setIsLoading(false);
  };

  /* When a new clip is played, load the source and settings. */
  useEffect(() => {
    const { current: videoElem } = videoRef;

    if (!currentClipNode || !videoElem || !hls) {
      console.error("Error loading video: Video element or HLS not available.");
      return;
    }

    const currentClip = currentClipNode.data;
    const hlsSource = getClipSource(currentClip);
    if (!hlsSource) {
      console.error(
        "Error loading video: HLS source URL is empty or undefined"
      );
      return;
    }

    loadClipSource(videoElem, hls, hlsSource);
    loadNewClipNode(videoElem, currentClipNode);
  }, [currentClipNode, hls]);

  /* Whenever a change is made to the video edit, update the total duration. */
  useEffect(() => {
    setCurrentTotalDuration(clipsState.totalDuration);
  }, [clipsState]);

  const onEnded = () => {
    const { current: videoElem } = videoRef;

    if (!videoElem) {
      console.error("OnEnded Error: Video element not available");
      return;
    }

    loadNextClip(videoElem);
  };

  /* On every time update, update the time state variables. */
  const onTimeUpdate = () => {
    const { current: videoElem } = videoRef;

    if (!videoElem || !currentClipNode) {
      console.error("TimeUpdate Error: Video element not available");
      return;
    }

    /* Update state variables for time. */
    setCurrentClipTime(videoElem.currentTime);
    setCurrentTotalTime(currentTotalTimePlayed + videoElem.currentTime);

    /* If there is a next clip, play it. */
    const currentClipDuration = currentClipNode.data.duration;
    if (currentClipDuration <= currentClipTime) loadNextClip(videoElem);
  };

  const togglePlaybackState = useCallback(() => {
    const { current: videoElem } = videoRef;
    if (videoElem) {
      if (isPlaying) {
        videoElem.pause();
      } else {
        play(videoElem);
      }

      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  const adjustCurrentClipTimeByDelta = useCallback(
    (delta: number) => {
      // const { current: videoElement } = videoRef;
      // if (videoElement) {
      //   const newTime = videoElement.currentTime + delta;
      //   const exceedClipEnd = newTime > videoElement.duration;
      //   const exceedClipStart = newTime < 0;
      //   if (exceedClipEnd) {
      //     // TODO: Handle exceed clip end
      //   } else if (exceedClipStart) {
      //     // TODO: Handle exceed clip start
      //   } else {
      //     videoElement.currentTime = newTime;
      //   }
      // }
    },
    [videoRef]
  );

  // Set the currentClip based on clips
  useEffect(() => {
    if (clipsState.clips.length == 1) {
      setCurrentClipNode(clipsState.clips.head!);
      setCurrentClipTime(0);
    }
  }, [clipsState.clips.length]);

  return (
    <VideoContext.Provider
      value={{
        videoRef,
        isPlaying,
        currentClipNode,
        togglePlaybackState,
        adjustCurrentClipTimeByDelta,
        onTimeUpdate,
        onEnded,
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
