/**
 * TimelineSettingsContext.tsx
 *
 * Description:
 * This module defines the TimelineSettingsContext and TimelineSettingsProvider,
 * providing a React context for managing state related to the timeline settings
 * in the VideoEditor. It includes information such as selected nodes, lower and
 * upper bounds, zoom level, and methods to update these settings.
 *
 */

import React, { useEffect, useState } from "react";
import { useClipsContext } from "../ClipsContext";
import TimelineClip from "./SortableItem/TimelineClip";

export interface TimelineItem {
  id: number;
  content: JSX.Element;
}

interface TimelineSettings {
  items: TimelineItem[];
  scale: number;
  setItems: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
  setScale: React.Dispatch<React.SetStateAction<number>>;
}

const TimelineSettingsContext = React.createContext<
  TimelineSettings | undefined
>(undefined);

const TimelineSettingsProvider: React.FC = ({ children }) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [scale, setScale] = useState(60);  // TODO set scale so it fits in container.

  const { state: clipsState } = useClipsContext();

  useEffect(() => {
    setItems(
      clipsState.clips.map((clip, index) => ({
        id: index + 1,
        content: <TimelineClip clip={clip} scale={scale} />,
      }))
    );
  }, [clipsState.clips, scale]);

  const timelineSettings: TimelineSettings = {
    items,
    scale,
    setItems,
    setScale,
  };

  return (
    <TimelineSettingsContext.Provider value={timelineSettings}>
      {children}
    </TimelineSettingsContext.Provider>
  );
};

const useTimelineContext = (): TimelineSettings => {
  const context = React.useContext(TimelineSettingsContext);
  if (!context) {
    throw new Error(
      "useTimelineContext must be used within a TimelineSettingsProvider"
    );
  }
  return context;
};

export { TimelineSettingsProvider, useTimelineContext };
