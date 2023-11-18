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
import { useVideoContext } from "../VideoContext";

interface TimelineSettings {
  lowerBound: number;
  upperBound: number;
  zoomLevel: number;
  setLowerBound: React.Dispatch<React.SetStateAction<number>>;
  setUpperBound: React.Dispatch<React.SetStateAction<number>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  getBounds: () => {
    lowerBound: number;
    upperBound: number;
  };
}

const TimelineSettingsContext = React.createContext<
  TimelineSettings | undefined
>(undefined);

const TimelineSettingsProvider: React.FC = ({ children }) => {
  const [lowerBound, setLowerBound] = useState<number>(0);
  const [upperBound, setUpperBound] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  /**
   * Convert the fractions of the window bounds to seconds.
   * @returns Object with attributes `lowerBound` and `upperBound`.
   */
  const getBounds = () => {
    const { currentDuration } = useVideoContext();
    const lower = Math.floor(lowerBound * currentDuration);
    const upper = Math.ceil(upperBound * currentDuration);
    return { lowerBound: lower, upperBound: upper };
  };

  const timelineSettings: TimelineSettings = {
    lowerBound,
    upperBound,
    zoomLevel,
    setLowerBound,
    setUpperBound,
    setZoomLevel,
    getBounds,
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
