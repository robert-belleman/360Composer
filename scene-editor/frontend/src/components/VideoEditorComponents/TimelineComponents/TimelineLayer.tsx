/*
Filename: TimelineLine.tsx
Description:
This file describes a list of clips on the timeline.
 */

import React from "react";

import { Box, duration } from "@mui/material";
import TimelineClip from "./TimelineClip";
import Clip from "../Classes/Clip";
import Clips from "../Classes/Clips";

type TimelineLayerProps = {
  clips: Clips;
  bounds: number[];
};

const TimelineLayer: React.FC<TimelineLayerProps> = ({ clips, bounds }) => {
  const renderClips = () => {
    const [lower, upper, zoom] = bounds;

    /* If not zoomed in, render all clips. */
    if (zoom === 0) {
      return clips.data.map((clip: any, i: number) => (
        <TimelineClip key={i} clip={clip} duration={clip.asset.duration} />
      ));
    }

    const inBounds = (lb: number, n: number, ub: number) => {
      return lb <= n && n <= ub;
    };

    /* Compute the visible parts of the clip in bounds [lower, upper].
     * Define t0, t1 as the start and end time of the clip respectively,
     * then there are four cases regarding the position of the boundaries:
     * Case 1:            Case 2:           Case 3:            Case 4:
     * ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
     * │  t0═══════╪═t1  │ t0═════t1 │  t0═╪═══════t1  │  t0═╪═══════════╪═t1
     * └───────────┘     └───────────┘     └───────────┘     └───────────┘
     */
    const computeVisibleLength = (clip: Clip) => {
      let lengthVisible = 0;
      let t0 = elapsedTime;
      let t1 = t0 + clip.asset.duration;
      /* For case 1, 2 and 3, t0 or t1 is within bounds [lower, upper]. */
      if (inBounds(lower, t0, upper) || inBounds(lower, t1, upper)) {
        t0 = Math.max(t0, lower);
        t1 = Math.min(t1, upper);
        lengthVisible = t1 - t0;
      /* For case 4. lower and upper are within bounds [t0, t1]. */
      } else if (inBounds(t0, lower, t1) && inBounds(t0, upper, t1)) {
        lengthVisible = upper - lower;
      }
      return lengthVisible;
    };

    let visibleClips = [];
    let elapsedTime = 0;
    for (let i = 0; i < clips.data.length; i++) {
      let clip = clips.data[i];
      let visibleLength = computeVisibleLength(clip);
      visibleClips.push(
        <TimelineClip key={i} clip={clip} duration={visibleLength} />
      );
      elapsedTime += clip.asset.duration;
    }
    return visibleClips;
  };

  return (
    <Box width={1} sx={{ display: "flex", flexDirection: "row" }}>
      {renderClips()}
    </Box>
  );
};

export default TimelineLayer;
