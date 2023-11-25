/**
 * SortableList.tsx
 *
 * Description:
 * This component renders a DnD Context that contains TimelineClips that can
 * be sorted.
 *
 */

import React, { useEffect } from "react";
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
import { restrictToParentElement } from "@dnd-kit/modifiers";

import SortableItem from "./SortableItem/SortableItem";
import { ActionTypes, useClipsContext } from "../ClipsContext";
import { useVideoContext } from "../VideoContext";
import { useTimelineContext, TimelineItem } from "./TimelineContext";
import TimelineClip from "./SortableItem/TimelineClip";

const TimelineLayer = () => {
  const { state: clipsState, dispatch } = useClipsContext();
  const { reloading, setReloading } = useVideoContext();
  const { scale, items, setItems } = useTimelineContext();

  /**
   * If the clips update, change the items to render.
   */
  useEffect(() => {
    setItems(
      clipsState.clips.map((clip, index) => ({
        id: index + 1,
        length: clip.duration,
        content: <TimelineClip clip={clip} />,
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
      modifiers={[restrictToParentElement]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <div style={{ display: "flex", width: `${scale * 100}%` }}>
          {items.map((props: TimelineItem) => (
            <SortableItem key={props.id} {...props} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item: TimelineItem) => item.id === active.id
      );
      const newIndex = items.findIndex(
        (item: TimelineItem) => item.id === over.id
      );

      dispatch({ type: ActionTypes.MOVE_CLIP, payload: { oldIndex, newIndex } });
      setReloading(!reloading);

      setItems((prevItems: TimelineItem[]) =>
        arrayMove(prevItems, oldIndex, newIndex)
      );
    }
  }
};

export default TimelineLayer;
