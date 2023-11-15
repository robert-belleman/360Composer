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
import { DoublyLinkedList } from "./DoublyLinkedList";

export interface Clip {
  asset: Asset; // Reference to an asset.
  startTime: number; // Start time within the asset.
  duration: number; // Duration of the clip in seconds.
  selected: boolean; // Indicate if the clip is selected.
}

interface State {
  clips: DoublyLinkedList<Clip>;
  past: State[];
  future: State[];
  totalDuration: number;
}

/* The state of Clips can be altered using these action types. */
export const APPEND_CLIP = "APPEND_CLIP";
export const SPLIT_CLIP = "SPLIT_CLIP";
export const DELETE_CLIPS = "DELETE_CLIPS";
export const DUPLICATE_CLIPS = "DUPLICATE_CLIPS";
export const EXPORT_CLIPS = "EXPORT_CLIPS";
export const UNDO = "UNDO";
export const REDO = "REDO";

type Action =
  | { type: typeof APPEND_CLIP; payload: { clip: Clip } }
  | { type: typeof SPLIT_CLIP; payload: { time: number } }
  | { type: typeof DELETE_CLIPS }
  | { type: typeof DUPLICATE_CLIPS }
  | { type: typeof EXPORT_CLIPS; payload: { title: string } }
  | { type: typeof UNDO }
  | { type: typeof REDO };

interface ClipsContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ClipsContext = createContext<ClipsContextProps | undefined>(undefined);

const initialState: State = {
  clips: new DoublyLinkedList<Clip>(),
  past: [],
  future: [],
  totalDuration: 0,
};

const printClips = (
  state: State,
  printAsset: boolean = false,
  printStartTime: boolean = false,
  printDuration: boolean = false
) => {
  console.log("All Clip Information");
  state.clips.print((clip: Clip) => {
    if (printAsset) console.log(`Asset: ${clip.asset}`);
    if (printStartTime) console.log(`startTime: ${clip.startTime}`);
    if (printDuration) console.log(`Duration: ${clip.duration}`);
  });
};

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
 * Indicate what the numerical value of a Clip `clip` is.
 * @param clip Clip to know the numerical value of.
 * @returns The duration of the clip.
 */
const getElapsedTime = (clip: Clip) => {
  return clip.duration;
};

/**
 * Split a Clip `clip` at `time` seconds.
 * @param clipA Clip to split.
 * @param time Time to split.
 * @returns Return a dictionary with the first part and second part.
 */
const splitClip = (clipA: Clip, time: number) => {
  if (time < 0 || clipA.duration < time) {
    return { firstPart: clipA, secondPart: null };
  }

  let clipB: Clip = { ...clipA };

  clipA.duration = time;
  clipB.startTime += time;
  clipB.duration -= time;

  return { firstPart: clipA, secondPart: clipB };
};

/**
 * Indicate when a Clip `clip` is selected.
 * @param clip Clip to check.
 * @returns boolean.
 */
const isSelected = (clip: Clip) => {
  return clip.selected;
};

const visibleClips = (state: State, lower: number, upper: number) => {
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

  let elapsedTime = 0;
  let current = state.clips.head;
  const results: any[] = [];
  while (current) {
    let length = visibleLength(current.data, elapsedTime);
    results.push({ node: current, length: length });
    elapsedTime += getElapsedTime(current.data);
    current = current.next;
  }

  return results;
};

/**
 * Check if the state can be undone.
 * Used for disabling buttons in certain situations.
 * @param state
 * @returns boolean
 */
const canUndo = (state: State): boolean => {
  return !!(state.past && state.past.length > 0);
};

/**
 * Check if the state can be redone.
 * Used for disabling buttons in certain situations.
 * @param state
 * @returns boolean
 */
const canRedo = (state: State): boolean => {
  return !!(state.future && state.future.length > 0);
};

/**
 * Record the current state in the history.
 * @param state the current state to record.
 * @param maxPastStates number of states to store at most.
 * @returns the new states of the past and future.
 */
const setState = (state: State, maxPastStates: number = CLIP_UNDO_STATES) => {
  const newPast = [...state.past, state].slice(-maxPastStates);
  const newFuture = [] as State[];
  return [newPast, newFuture];
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case APPEND_CLIP: {
      const [newPast, newFuture] = setState(state);
      const { clip } = action.payload;
      state.clips.append(clip);
      const newState = { ...state, clips: state.clips };
      const newDuration = state.totalDuration + clip.duration;

      return {
        ...newState,
        past: newPast,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case SPLIT_CLIP: {
      const [newPast, newFuture] = setState(state);
      const { time } = action.payload;
      state.clips.split(time, getElapsedTime, splitClip);
      const newState = { ...state, clips: state.clips };
      return { ...newState, past: newPast, future: newFuture };
    }

    case DELETE_CLIPS: {
      const [newPast, newFuture] = setState(state);
      const durationLost = state.clips.deleteNodes(isSelected, getElapsedTime);
      const newDuration = state.totalDuration + durationLost;
      const newState = { ...state, clips: state.clips };
      return {
        ...newState,
        past: newPast,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case DUPLICATE_CLIPS: {
      const [newPast, newFuture] = setState(state);
      const durationAdded = state.clips.appendNodes(isSelected, getElapsedTime);
      const newDuration = state.totalDuration + durationAdded;
      const newState = { ...state, clips: state.clips };
      return {
        ...newState,
        past: newPast,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case EXPORT_CLIPS: {
      return { ...state }; // TODO: make api call
    }

    case UNDO: {
      if (!canUndo(state)) {
        return state;
      }

      const newPast = state.past.slice(0, state.past.length - 1);
      const newState = state.past[state.past.length - 1];
      const newFuture = [state, ...state.future];
      return { ...newState, past: newPast, future: newFuture };
    }

    case REDO: {
      if (!canRedo(state)) {
        return state;
      }

      const newPast = [...state.past, state];
      const newState = state.future[0];
      const newFuture = state.future.slice(1);
      return { ...newState, past: newPast, future: newFuture };
    }

    default:
      return state;
  }
};

const ClipsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue: ClipsContextProps = {
    state,
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

export {
  ClipsProvider,
  canRedo,
  canUndo,
  thumbnailUrl,
  useClipsContext,
  printClips,
  visibleClips,
};
