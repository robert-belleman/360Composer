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
import { DLLNode } from "../../components/VideoEditorComponents/DoublyLinkedList";
import { Clip, seekClip, useClipsContext } from "./ClipsContext";

interface VideoContextProps {
  isPlaying: boolean;
  isSeeking: boolean;
  currentNode: DLLNode<Clip> | undefined;
  currentTime: number;
  currentDuration: number;
  videoClipTime: number;
  videoClipTimePlayed: number;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setIsSeeking: Dispatch<SetStateAction<boolean>>;
  setCurrentNode: Dispatch<SetStateAction<DLLNode<Clip> | undefined>>;
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
  const [currentNode, setCurrentNode] = useState<DLLNode<Clip>>();
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);

  const [videoClipTime, setVideoClipTime] = useState(0);
  const [videoClipTimePlayed, setVideoClipTimePlayed] = useState(0);

  const { state: clipsState } = useClipsContext();

  /* After any changes to the length, start on the head. */
  useEffect(() => {
    if (clipsState.clips.length === 1) {
      seek(0)
    } else if (clipsState.clips.length > 1) {
      seek(currentTime)
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
    if (currentDuration <= currentTime) {
      /* If play is clicked after finishing, then restart the entire video. */
      if (clipsState.clips.head) seek(0);
      videoElem.load();
    } else {
      videoElem.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  /**
   * Play the next video clip. If there is no next clip, stop playing.
   * @param videoElem element to play video of.
   */
  const playNext = (videoElem: HTMLVideoElement) => {
    /* If there is no next video clip, then stop. */
    if (!currentNode || !currentNode.next) {
      setIsPlaying(false);
      videoElem.pause();
      return;
    }

    /* Seek to the start of next clip. */
    seek(videoClipTimePlayed + currentNode.data.duration);
  };

  /**
   * Go to a specific time in the entire video (all clips).
   * @param time time to got to.
   */
  const seek = (time: number) => {
    const result = seekClip(clipsState, time);

    if (result.node) {
      /* If `time` is in range, go to it. */
      setIsSeeking(true);
      setVideoClipTimePlayed(time - result.offset);
      setVideoClipTime(result.offset);
      setCurrentNode(result.node);
      setCurrentTime(time);
      return;
    }

    if (time < 0) {
      setIsSeeking(true);
      setVideoClipTimePlayed(0);
      setVideoClipTime(0);
      setCurrentTime(0);
      if (clipsState.clips.head) setCurrentNode(clipsState.clips.head);
      return;
    }

    if (time > clipsState.totalDuration) {
      setIsSeeking(true);
      setCurrentTime(clipsState.totalDuration);
      if (clipsState.clips.tail) {
        const lastClip = clipsState.clips.tail.data;
        setVideoClipTimePlayed(clipsState.totalDuration - lastClip.duration);
        setVideoClipTime(lastClip.duration);
        setCurrentNode(clipsState.clips.tail);
      }
      return;
    }
  };

  const value: VideoContextProps = {
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
