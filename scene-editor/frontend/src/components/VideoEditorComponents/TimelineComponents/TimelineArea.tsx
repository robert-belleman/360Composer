/**
 * TimelineArea.tsx
 *
 * Description:
 * This module describes the TimelineArea Component of the Timeline.
 * This file mostly focuses on the rendering of clips based on the
 * timeline settings (such as zoom, offset, etc).
 *
 * TODO: implement drag and drop for user experience.
 *
 */

import React from "react";

import { Box } from "@mui/material";

import { useClipsContext, visibleClipLengths } from "../ClipsContext";
import TimelineClip from "./TimelineClip";

type TimelineLayerProps = {
  bounds: number[];
};

const TimelineArea: React.FC<TimelineLayerProps> = ({ bounds }) => {
  const { state: clipsState } = useClipsContext();

  const [lower, upper, zoom] = bounds;

  const visibleLengths = visibleClipLengths(clipsState, lower, upper);

  const visibleClips = () => {
    let visibleClips = [];

    let index = 0;
    let current = clipsState.clips.head;
    while (current) {
      const length = visibleLengths[index];
      visibleClips.push(
        <TimelineClip
          key={index}
          clip={current.data}
          visibleLength={zoom === 0 ? current.data.duration : length}
        />
      );
      current = current.next;
      index++;
    }

    return visibleClips;
  };

  return (
    <Box width={1} sx={{ display: "flex", flexDirection: "row" }}>
      {visibleClips()}
    </Box>
  );
};

export default TimelineArea;
