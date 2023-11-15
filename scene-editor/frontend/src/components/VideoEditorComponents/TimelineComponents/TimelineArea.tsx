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

import { Clip, useClipsContext, visibleClips } from "../ClipsContext";
import TimelineClip from "./TimelineClip";
import { DLLNode } from "../DoublyLinkedList";

type TimelineLayerProps = {
  bounds: number[];
};

const TimelineArea: React.FC<TimelineLayerProps> = ({ bounds }) => {
  const { state: clipsState } = useClipsContext();

  const [lower, upper, zoom] = bounds;

  const renderVisibleClips = () => {
    const components = visibleClips(clipsState, lower, upper).map(
      (result: { node: DLLNode<Clip>; length: number }) => (
        <TimelineClip
          key={result.node.id}
          clip={result.node.data}
          visibleLength={result.length}
        />
      )
    );
    return components;
  };

  return (
    <Box width={1} sx={{ display: "flex", flexDirection: "row" }}>
      {renderVisibleClips()}
    </Box>
  );
};

export default TimelineArea;
