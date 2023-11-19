/**
 * TimelineLayers.tsx
 *
 * Description:
 * This component implements a horizontal sortable list using the DnD Kit library.
 * It displays a list of draggable items (clips) with the ability to reorder them
 * through drag-and-drop interactions. The order of items is reflected in both the
 * UI and the underlying data structure.
 *
 */

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MOVE_CLIP, useClipsContext, visibleClips } from "../ClipsContext";
import { Box } from "@mui/material";
import { useTimelineContext } from "./TimelineContext";
import { useVideoContext } from "../VideoContext";

import {
  SortableTimelineClipProps,
  SortableTimelineClip,
} from "./SortableTimelineClip";

const SortableTimelineLayer: React.FC = () => {
  const [items, setItems] = useState<SortableTimelineClipProps[]>([]);

  const { state: clipsState, dispatch } = useClipsContext();
  const { reloading, setReloading } = useVideoContext();

  useEffect(() => {
    setItems(
      clipsState.clips.map((clip, index) => ({
        id: index + 1,
        clip: clip,
        width: clip.duration / clipsState.totalDuration,
      }))
    );
  }, [clipsState.clips]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 20 },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <Box display="flex" sx={{ backgroundColor: "dodgerblue" }}>
          {items.map((item) => (
            <SortableTimelineClip
              key={item.id}
              id={item.id}
              clip={item.clip}
              width={item.width}
            />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );

  function handleDragStart(event: any) {}

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      dispatch({ type: MOVE_CLIP, payload: { oldIndex, newIndex } });
      setReloading(!reloading);

      setItems((prevItems) => arrayMove(prevItems, oldIndex, newIndex));
    }
  }

  function handleDragCancel(event: any) {}
};

const TimelineLayers: React.FC = () => {
  return <SortableTimelineLayer />;
};

export default TimelineLayers;
