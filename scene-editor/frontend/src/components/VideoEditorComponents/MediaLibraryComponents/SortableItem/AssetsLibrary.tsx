/**
 * AssetsLibrary.tsx
 *
 * Description:
 * Generate a sortable list of assets in the media library.
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
} from "@dnd-kit/sortable";

import SortableItem from "./SortableItem";
import { useAssetsContext } from "../AssetsContext";
import LibraryAsset from "./LibraryAsset";
import { Box } from "@mui/material";

export interface LibraryItem {
  id: number;
  content: JSX.Element;
}

const AssetsLibrary: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);

  const { assets } = useAssetsContext();

  /* Update the content whenever the assets update. */
  useEffect(() => {
    setItems(
      assets.map((asset, index) => ({
        id: index + 1,
        content: <LibraryAsset asset={asset} />,
      }))
    );
  }, [assets]);

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
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {items.map((props: LibraryItem) => (
            <SortableItem key={props.id} {...props} />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item: LibraryItem) => item.id === active.id
      );
      const newIndex = items.findIndex(
        (item: LibraryItem) => item.id === over.id
      );

      setItems((prevItems: LibraryItem[]) =>
        arrayMove(prevItems, oldIndex, newIndex)
      );
    }
  }
};

export default AssetsLibrary;
