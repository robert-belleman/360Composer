/*
Filename: Clip.tsx
Description:
This class represents a clip, which is an asset with a start and end time.
The start and end time indicate which parts of the should be used.
 */

import defaultImage from "../../../static/images/default.jpg";

interface Asset {
  id: string;
  user_id: string;
  name: string;
  path: string;
  thumbnail_path: string;
  duration: number;
  file_size: number;
  asset_type: string;
  view_type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  scene: any;
}

class Clip {
  asset: Asset;
  start_time: number;
  end_time: number;

  constructor(asset: Asset) {
    this.asset = asset;
    this.start_time = 0;
    this.end_time = asset.duration;
  }

  getUrl() {
    return this.asset.thumbnail_path
      ? `/api/asset/${this.asset.id}/thumbnail`
      : defaultImage;
  }

  duration() {
    return this.end_time - this.start_time;
  }

  trim(new_start_time: number, new_end_time: number) {
    this.start_time = new_start_time;
    this.end_time = new_end_time;
  }

  split(timeIntoClip: number) {
    let clip = new Clip(this.asset);
    clip.start_time = this.start_time
    clip.end_time = clip.start_time + timeIntoClip;
    this.start_time = clip.end_time;
    return clip;
  }
}

export default Clip;
