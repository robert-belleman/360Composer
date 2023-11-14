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

import { Clip, useClipsContext } from "../ClipsContext";
import TimelineClip from "./TimelineClip";

type TimelineLayerProps = {
  bounds: number[];
};

const TimelineArea: React.FC<TimelineLayerProps> = ({ bounds }) => {
  const { clipsState } = useClipsContext();

  const [lower, upper, zoom] = bounds;

  const visibleLength = (clip: Clip, startTime: number) => {
    let length = 0;

    /* If the clip is not in range [lower, upper], return 0. */
    const endTime = startTime + clip.duration;
    if (endTime < lower || startTime > upper) {
      return length;
    }

    /* Otherwise, compute the visible length. */
    const start = Math.max(startTime, lower);
    const end = Math.min(endTime, upper);
    length = end - start;
    return length;
  };

  const visibleClips = () => {
    let visibleClips = [];

    let elapsedTime = 0;
    for (let i = 0; i < clipsState.clips.length; i++) {
      let length = visibleLength(clipsState.clips[i], elapsedTime);
      visibleClips.push(
        <TimelineClip
          key={i}
          clip={clipsState.clips[i]}
          visibleLength={zoom === 0 ? clipsState.clips[i].duration : length}
        />
      );
      elapsedTime += clipsState.clips[i].duration;
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
