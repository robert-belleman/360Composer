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
import { DLLNode } from "../DoublyLinkedList";
import TimelineClip from "./TimelineClip";

type TimelineLayerProps = {
  bounds: { lowerBound: number; upperBound: number };
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
};

const TimelineArea: React.FC<TimelineLayerProps> = ({
  bounds,
  selected,
  setSelected,
}) => {
  const { state: clipsState } = useClipsContext();

  const renderVisibleClips = () => {
    const components = visibleClips(
      clipsState,
      bounds.lowerBound,
      bounds.upperBound
    ).map((result: { node: DLLNode<Clip>; length: number }) => (
      <TimelineClip
        key={result.node.id}
        node={result.node}
        visibleLength={result.length}
        selected={selected}
        setSelected={setSelected}
      />
    ));
    return components;
  };

  return (
    <Box width={1} sx={{ display: "flex", flexDirection: "row" }}>
      {renderVisibleClips()}
    </Box>
  );
};

export default TimelineArea;
