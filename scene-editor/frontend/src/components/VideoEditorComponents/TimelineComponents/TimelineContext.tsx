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

import React, { useState } from "react";

export interface TimelineItem {
  id: number;
  length: number;
  content: JSX.Element;
}

interface TimelineSettings {
  sliderValue: number;
  items: TimelineItem[];
  scale: number;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  setItems: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
  setScale: React.Dispatch<React.SetStateAction<number>>;
}

const TimelineSettingsContext = React.createContext<
  TimelineSettings | undefined
>(undefined);

const TimelineSettingsProvider: React.FC = ({ children }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [scale, setScale] = useState(1);

  const timelineSettings: TimelineSettings = {
    sliderValue,
    items,
    scale,
    setSliderValue,
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
