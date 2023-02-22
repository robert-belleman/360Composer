import React  from 'react';
import { VideoSphere } from '@belivvr/aframe-react';

interface StereoVideoProps {
  src: string;
  mode?: 'full' | 'half';
  stereo?: boolean;
  split?: 'horizontal' | 'vertical'
}

export default function StereoVideo ({
  src,
  mode = 'full',
  stereo = false,
  split = 'horizontal'
}: StereoVideoProps) : JSX.Element {
  return <>
      <VideoSphere
        src={src}
        my-stereoscopic-video={{eye: 'left', mode: mode, stereo: stereo, split: split}}
      />
      <VideoSphere
        src={src}
        my-stereoscopic-video={{eye: 'right', mode: mode, stereo: stereo, split: split}}
      />
    </>
}