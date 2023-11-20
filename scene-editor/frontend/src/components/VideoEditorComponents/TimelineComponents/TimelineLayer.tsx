/**
 * SortableList.tsx
 *
 * Description:
 * This component renders a DnD Context that contains TimelineClips that can
 * be sorted.
 *
 */

import React from "react";
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
import { MOVE_CLIP, useClipsContext } from "../ClipsContext";
import { useVideoContext } from "../VideoContext";
import { useTimelineContext, TimelineItem } from "./TimelineContext";

const TimelineLayer: React.FC = () => {
  const { state: clipsState, dispatch } = useClipsContext();
  const { reloading, setReloading } = useVideoContext();
  const { scale, items, setItems } = useTimelineContext();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 20 },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToParentElement]}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          <div
            style={{ display: "flex", width: clipsState.totalDuration * scale }}
          >
            {items.map((props: TimelineItem) => (
              <SortableItem key={props.id} {...props} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
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

      dispatch({ type: MOVE_CLIP, payload: { oldIndex, newIndex } });
      setReloading(!reloading);

      setItems((prevItems: TimelineItem[]) =>
        arrayMove(prevItems, oldIndex, newIndex)
      );
    }
  }
};

export default TimelineLayer;
