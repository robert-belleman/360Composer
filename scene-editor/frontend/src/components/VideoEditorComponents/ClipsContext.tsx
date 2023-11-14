/**
 * ClipsContext.tsx
 *
 * Description:
 * This file defines a React Context and a corresponding reducer for managing
 * clips in a timeline. The context, ClipsContext, encapsulates the state of
 * clips and provides a dispatch function for handling different actions,
 * such as appending, removing, inserting, splitting, deleting, duplicating,
 * and exporting clips. The state includes information about each clip, such
 * as its asset details, start time, duration.
 *
 * Contents:
 * - Asset: Interface defining the structure of video assets.
 * - Clip: Interface defining the structure of clips.
 * - ClipsState: Interface defining the state structure, including an array of clips.
 * - Action: Type defining the possible actions that can be dispatched to modify the state.
 * - ContextType: Interface defining the shape of the context values.
 * - ClipsContext: React Context for the application state and dispatch function.
 * - initialState: The initial state of the application, containing an empty array of clips.
 * - thumbnailUrl: Function to find the thumbnail URL of a clip.
 * - seekIndex: Function to seek the index of a clip that intersects with a given time.
 * - reducer: Reducer function responsible for handling state modifications based on dispatched actions.
 * - ClipsProvider: Context provider component to wrap the application and make the state and dispatch accessible.
 * - useClips: Custom hook for conveniently accessing the context values.
 *
 */

import React, { ReactNode, createContext, useContext, useReducer } from "react";

import defaultImage from "../../static/images/default.jpg";
import { Asset } from "./AssetsContext";
import { CLIP_UNDO_STATES, MINIMUM_CLIP_LENGTH } from "./Constants";

export interface Clip {
  asset: Asset; // Reference to an asset.
  startTime: number; // Start time within the asset.
  duration: number; // Duration of the clip in seconds.
  selected: boolean; // Indicate if the clip is selected.
}

interface ClipsState {
  clips: Clip[];
  past: ClipsState[];
  future: ClipsState[];
}

/* The state of Clips can be altered using these action types. */
export const APPEND_CLIP = "APPEND_CLIP";
export const REMOVE_CLIP = "REMOVE_CLIP";
export const INSERT_CLIP = "INSERT_CLIP";
export const SPLIT_CLIP = "SPLIT_CLIP";
export const DELETE_CLIPS = "DELETE_CLIPS";
export const DUPLICATE_CLIPS = "DUPLICATE_CLIPS";
export const EXPORT_CLIPS = "EXPORT_CLIPS";
export const UNDO = "UNDO";
export const REDO = "REDO";

type Action =
  | { type: typeof APPEND_CLIP; payload: { clip: Clip } }
  | { type: typeof REMOVE_CLIP; payload: { index: number } }
  | { type: typeof INSERT_CLIP; payload: { index: number; clip: Clip } }
  | { type: typeof SPLIT_CLIP; payload: { time: number } }
  | { type: typeof DELETE_CLIPS; payload?: { indices: number[] } }
  | { type: typeof DUPLICATE_CLIPS; payload?: { indices: number[] } }
  | { type: typeof EXPORT_CLIPS; payload: { title: string } }
  | { type: typeof UNDO }
  | { type: typeof REDO };

interface ClipsContextProps {
  clipsState: ClipsState;
  dispatch: React.Dispatch<Action>;
}

const ClipsContext = createContext<ClipsContextProps | undefined>(undefined);

const initialState: ClipsState = { clips: [], past: [], future: [] };

/**
 * Find the thumbnail URL of a Clip `clip`.
 * @param clip Clip to find the thumbnail URL of.
 * @returns thumbnail URL or defaultImage when not found.
 */
const thumbnailUrl = (clip: Clip) => {
  return clip.asset.thumbnail_path
    ? `/api/asset/${clip.asset.id}/thumbnail`
    : defaultImage;
};

/**
 * Seek the index of a Clip that intersects with time `time` in State `state`.
 * @param clipsState state of the clips.
 * @param time time of intersection.
 * @returns [index, elapsedTime] or [null, null] when no intersection found.
 */
const seekIndex = (clipsState: ClipsState, time: number) => {
  let elapsedTime = 0;
  for (let i = 0; i < clipsState.clips.length; i++) {
    if (time < elapsedTime + clipsState.clips[i].duration) {
      return [i, elapsedTime];
    }

    elapsedTime += clipsState.clips[i].duration;
  }
  return [null, null];
};

/**
 * Check if the state can be undone.
 * Used for disabling buttons in certain situations.
 * @param clipsState
 * @returns boolean
 */
const canUndo = (clipsState: ClipsState): boolean => {
  return !!(clipsState.past && clipsState.past.length > 0);
};

/**
 * Check if the state can be redone.
 * Used for disabling buttons in certain situations.
 * @param clipsState
 * @returns boolean
 */
const canRedo = (clipsState: ClipsState): boolean => {
  return !!(clipsState.future && clipsState.future.length > 0);
};

/**
 * Record the current state in the history.
 * @param clipsState the current state to record.
 * @param maxPastStates number of states to store at most.
 * @returns the new states of the past and future.
 */
const setState = (clipsState: ClipsState, maxPastStates: number = CLIP_UNDO_STATES) => {
  const newPast = [...clipsState.past, clipsState].slice(-maxPastStates);
  const newFuture = [] as ClipsState[];
  return [newPast, newFuture];
};

const reducer = (clipsState: ClipsState, action: Action): ClipsState => {
  switch (action.type) {
    case APPEND_CLIP: {
      const [newPast, newFuture] = setState(clipsState);
      const newState = {
        ...clipsState,
        clips: [...clipsState.clips, action.payload.clip],
      };
      return { ...newState, past: newPast, future: newFuture };
    }

    case REMOVE_CLIP: {
      const [newPast, newFuture] = setState(clipsState);
      const { index } = action.payload;
      const newState = {
        ...clipsState,
        clips: [...clipsState.clips.filter((_, i) => i !== index)],
      };
      return { ...newState, past: newPast, future: newFuture };
    }

    case INSERT_CLIP: {
      const [newPast, newFuture] = setState(clipsState);
      const { index, clip } = action.payload;
      const clipsBefore = clipsState.clips.slice(0, index);
      const clipsAfter = clipsState.clips.slice(index);
      const newState = {
        ...clipsState,
        clips: [...clipsBefore, clip, ...clipsAfter],
      };
      return { ...newState, past: newPast, future: newFuture };
    }

    case SPLIT_CLIP: {
      const [newPast, newFuture] = setState(clipsState);
      const { time } = action.payload;

      /* Find the index of the clip that intersects with time `time`. */
      const [index, elapsedTime] = seekIndex(clipsState, time);
      if (index === null) {
        return { ...clipsState };
      }

      /* Get the clips before and after the clip at index `index`.  */
      const clipsBefore = clipsState.clips.slice(0, index);
      const clipsAfter = clipsState.clips.slice(index + 1);

      /* Initialize variables to split the clip at index `index` into.  */
      let clipA = clipsState.clips[index];
      let clipB = { ...clipsState.clips[index] };

      /* If the clip is too short, then do not update state. */
      const secondsIntoClip = time - elapsedTime!;
      if (secondsIntoClip < MINIMUM_CLIP_LENGTH) {
        return clipsState;
      }

      /* Split the clip at index `index` at time `secondsIntoClip`. */
      clipA.duration = secondsIntoClip;
      clipB.startTime = secondsIntoClip;
      clipB.duration = clipB.duration - secondsIntoClip;

      /* Insert the `clipA` and `clipB` and update the start times. */
      const newState = {
        ...clipsState,
        clips: [...clipsBefore, clipA, clipB, ...clipsAfter],
      };
      return { ...newState, past: newPast, future: newFuture };
    }

    case DELETE_CLIPS: {
      const [newPast, newFuture] = setState(clipsState);
      const { indices } = action.payload || {};
      const newState = {
        ...clipsState,
        clips: indices
          ? clipsState.clips.filter((_, index) => !indices.includes(index))
          : clipsState.clips.filter((clip) => !clip.selected),
      };
      return { ...newState, past: newPast, future: newFuture };
    }

    case DUPLICATE_CLIPS: {
      const [newPast, newFuture] = setState(clipsState);
      const { indices } = action.payload || {};
      const clipsToUpdate = indices
        ? clipsState.clips.filter((_, index) => indices.includes(index))
        : clipsState.clips.filter((clip) => clip.selected);
      const newState = {
        ...clipsState,
        clips: clipsState.clips
          .map((clip) => ({ ...clip, selected: false }))
          .concat(clipsToUpdate),
      };
      return { ...newState, past: newPast, future: newFuture };
    }

    case EXPORT_CLIPS: {
      return { ...clipsState }; // TODO: make api call
    }

    case UNDO: {
      if (!canUndo(clipsState)) {
        return clipsState;
      }

      const newPast = clipsState.past.slice(0, clipsState.past.length - 1);
      const newState = clipsState.past[clipsState.past.length - 1];
      const newFuture = [clipsState, ...clipsState.future];
      return { ...newState, past: newPast, future: newFuture };
    }

    case REDO: {
      if (!canRedo(clipsState)) {
        return clipsState;
      }

      const newPast = [...clipsState.past, clipsState];
      const newState = clipsState.future[0];
      const newFuture = clipsState.future.slice(1);
      return { ...newState, past: newPast, future: newFuture };
    }

    default:
      return clipsState;
  }
};

const ClipsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clipsState, dispatch] = useReducer(reducer, initialState);

  const contextValue: ClipsContextProps = {
    clipsState,
    dispatch,
  };

  return (
    <ClipsContext.Provider value={contextValue}>
      {children}
    </ClipsContext.Provider>
  );
};

const useClipsContext = (): ClipsContextProps => {
  const context = useContext(ClipsContext);
  if (!context) {
    throw new Error("useClips must be used within a ClipsProvider");
  }
  return context;
};

export { ClipsProvider, canRedo, canUndo, thumbnailUrl, useClipsContext };
