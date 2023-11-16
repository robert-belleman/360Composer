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

interface TimelineSettings {
  selected: number;
  lowerBound: number;
  upperBound: number;
  zoomLevel: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setLowerBound: React.Dispatch<React.SetStateAction<number>>;
  setUpperBound: React.Dispatch<React.SetStateAction<number>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

const TimelineSettingsContext = React.createContext<
  TimelineSettings | undefined
>(undefined);

const TimelineSettingsProvider: React.FC = ({ children }) => {
  const [selected, setSelected] = useState<number>(0);
  const [lowerBound, setLowerBound] = useState<number>(0);
  const [upperBound, setUpperBound] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const timelineSettings: TimelineSettings = {
    selected,
    lowerBound,
    upperBound,
    zoomLevel,
    setSelected,
    setLowerBound,
    setUpperBound,
    setZoomLevel,
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

/**
 * Convert seconds to a user friendly display format.
 * @param totalSeconds Total amount of seconds to convert.
 * @returns The time string.
 */
const toDisplayTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2);
  const strMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
  const strSeconds = seconds.padStart(5, "0");
  return `${strMinutes}:${strSeconds}`;
};

export { TimelineSettingsProvider, toDisplayTime, useTimelineContext };
