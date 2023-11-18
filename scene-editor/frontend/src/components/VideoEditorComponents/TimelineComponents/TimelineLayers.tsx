/**
 * TimelineLayers.tsx
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Clip,
  MOVE_CLIP,
  thumbnailUrl,
  useClipsContext,
  visibleClips,
} from "../ClipsContext";
import { Box } from "@mui/material";
import { useTimelineContext } from "./TimelineContext";
import { TIMELINE_CLIP_HEIGHT } from "../Constants";
import { useVideoContext } from "../VideoContext";

interface TimelineClip {
  id: number;
  clip: Clip;
  width: number;
}

function SortableTimelineClip(item: TimelineClip) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [selected, setSelected] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleSelect = () => {
    item.clip.selected = !item.clip.selected;
    setSelected(!selected);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      height={TIMELINE_CLIP_HEIGHT}
      width={item.width}
      onClick={toggleSelect}
      boxSizing="border-box"
      border={item.clip.selected ? "4px solid lightgreen" : "none"}
      borderRadius={2}
      sx={{
        background: `url(${thumbnailUrl(item.clip)})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
      }}
    ></Box>
  );
}

const SortableTimelineLayer: React.FC = () => {
  const [items, setItems] = useState<TimelineClip[]>([]);

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      dispatch({ type: MOVE_CLIP, payload: { oldIndex, newIndex } });
      setReloading(!reloading);

      setItems((prevItems) => arrayMove(prevItems, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragCancel={() => console.log("Drag cancelled")}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <Box display="flex">
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
};

const TimelineLayers: React.FC = () => {
  return <SortableTimelineLayer />;
};

export default TimelineLayers;
