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
  lowerBound: number;
  upperBound: number;
  zoomLevel: number;
  setLowerBound: React.Dispatch<React.SetStateAction<number>>;
  setUpperBound: React.Dispatch<React.SetStateAction<number>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
}

const TimelineSettingsContext = React.createContext<
  TimelineSettings | undefined
>(undefined);

const TimelineSettingsProvider: React.FC = ({ children }) => {
  const [lowerBound, setLowerBound] = useState<number>(0);
  const [upperBound, setUpperBound] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const timelineSettings: TimelineSettings = {
    lowerBound,
    upperBound,
    zoomLevel,
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

export { TimelineSettingsProvider, useTimelineContext };
