/*
Filename: Clips.tsx
Description:
This file describes a single clip on the timeline.
 */

import Clip from "./Clip";

/**
 * Check if the given index `index` is in the bounds of the Clips object.
 * @param clips
 * @param index
 * @returns boolean
 */
function inBounds(clips: Clips, index: number) {
  let length = Math.max(0, clips.data.length - 1);
  return 0 <= index && index <= length;
}

/**
 * Append `clip` to the end of the Clips object.
 * @param clip
 * @returns the Clips object with `clip` appended.
 */
function append(clips: Clips, clip: Clip) {
  clips.data.push(clip);
}

/**
 * Insert `clip` at the index `index` in the Clips object.
 * @param index
 * @param clip
 * @returns the Clips object with `clip` inserted.
 */
function insert(clips: Clips, index: number, clip: Clip) {
  if (inBounds(clips, index)) {
    clips.data.splice(index, 0, clip);
    return;
  }
  console.log("array index out of range to insert.");
}

/**
 * Split the clip at time `time` in the Clips object.
 * @param time
 * @returns the Clips object with `clip` split in two.
 */
function split(clips: Clips, time: number) {
  /* Find the index of the clip that intersects with the time `time`.  */
  let [index, offset] = seek(clips, time);
  let clip = index === null ? null : clips.data[index];

  /* If the time was not found, return the clips unchanged. */
  if (index === null || clip === null) {
    console.log(`unable to find the clip that intersects at ${time} seconds`);
    return clips;
  }

  /* If the offset is 0, then there is no clip to split. */
  if (offset === 0) {
    return clips;
  }

  let clipB = clip.split(offset!);
  insert(clips, index, clipB);
}

/**
 * Seek the clip in `Clips` that intersects with the given time `time`.
 * @param clips
 * @param time seconds
 * @returns [index, number of seconds into the clip] | [null, null]
 */
function seek(clips: Clips, time: number) {
  let accTime = 0;
  for (let i = 0; i < clips.data.length; i++) {
    let clip = clips.index(i);
    if (clip === null) {
      return [null, null];
    }
    accTime += clip.getDuration();

    /* If `time` gets exceeded by a clip, return it. */
    if (time < accTime) {
      return [i, clip.getDuration() - accTime + time];
    }
  }
  /* If `time` was bigger than all clip lengths combined, return null. */
  return [null, null];
}

class Clips {
  data: Clip[];

  constructor(data?: Clip[]) {
    if (data === undefined) data = [];
    this.data = data;
  }

  append(clip: Clip) {
    let copy = new Clips(this.data.slice());
    append(copy, clip);
    return copy;
  }

  insert(index: number, clip: Clip) {
    let copy = new Clips(this.data.slice());
    insert(copy, index, clip);
    return copy;
  }

  split(time: number) {
    console.log("splitting at: ", time);
    let copy = new Clips(this.data.slice());
    split(copy, time);
    return copy;
  }

  seek(time: number) {
    console.log("seeking at: ", time);
    return seek(this, time);
  }

  index(index: number) {
    return inBounds(this, index) ? this.data[index] : null;
  }
}

export default Clips;
