/*
Filename: TimelineLine.tsx
Description:
This file describes a list of clips on the timeline.
 */

import React from "react";

import { Box } from "@mui/material";
import TimelineClip from "./TimelineClip";

type TimelineLineProps = {
  clips: any[];
};

const TimelineLine: React.FC<TimelineLineProps> = ({ clips }) => {
  const renderClips = () => {
    return clips.map((clip: any) => <TimelineClip key={clip.id} clip={clip} />);
  };

  return (
    <Box width={1} sx={{ display: "flex", flexDirection: "row" }}>
      {renderClips()}
    </Box>
  );
};

export default React.memo(TimelineLine);
