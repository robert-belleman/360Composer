/*
Filename: TimelineLine.tsx
Description:
This file describes a list of clips on the timeline.
 */

import React from "react";

import { Box } from "@mui/material";
import TimelineClip from "./TimelineClip";
import Clip from "../Classes/Clip";
import Clips from "../Classes/Clips";

type TimelineLineProps = {
  clips: Clips;
};

const TimelineLine: React.FC<TimelineLineProps> = ({ clips }) => {
  const renderClips = () => {
    return clips.data.map((clip: Clip, i: number) => (
      <TimelineClip key={i} clip={clip} />
    ));
  };

  return (
    <Box width={1} sx={{ display: "flex", flexDirection: "row" }}>
      {renderClips()}
    </Box>
  );
};

export default TimelineLine;
