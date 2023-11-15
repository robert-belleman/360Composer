// VideoContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { DLLNode } from "../../components/VideoEditorComponents/DoublyLinkedList";
import { Clip, useClipsContext } from "./ClipsContext";

interface VideoContextProps {
  isPlaying: boolean;
  currentNode: DLLNode<Clip> | undefined;
  currentTime: number;
  currentDuration: number;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setCurrentNode: Dispatch<SetStateAction<DLLNode<Clip> | undefined>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const VideoProvider: React.FC = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNode, setCurrentNode] = useState<DLLNode<Clip>>();
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);

  const { state: clipsState } = useClipsContext();

  /* After any changes to the length, start on the head. */
  useEffect(() => {
    if (clipsState.clips.length > 0) setCurrentNode(clipsState.clips.head!);
  }, [clipsState.clips.length]);

  /* If the total time changes, update the state of the total time. */
  useEffect(() => {
    setCurrentDuration(clipsState.totalDuration);
  }, [clipsState.totalDuration]);

  const value: VideoContextProps = {
    isPlaying,
    currentNode,
    currentTime,
    currentDuration,
    setIsPlaying,
    setCurrentNode,
    setCurrentTime,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

export const useVideoContext = (): VideoContextProps => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};
