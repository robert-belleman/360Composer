import React  from 'react';
import { VideoSphere } from '@belivvr/aframe-react';
import { EntityProps } from '@belivvr/aframe-react/types/core';

interface StereoVideoProps {
  src: string;
  mode?: 'full' | 'half';
  stereo?: boolean;
  split?: 'horizontal' | 'vertical'
  visible?: boolean
}

export default function StereoVideo ({
  src,
  mode = 'full',
  stereo = false,
  split = 'horizontal',
  visible = false,
}: StereoVideoProps) : JSX.Element {
  return <>
      <VideoSphere
        id="videosphere-left"
        visible={visible}
        src={src}
        my-stereoscopic-video={{eye: 'left', mode: mode, stereo: stereo, split: split}}
      />
      <VideoSphere
        id="videosphere-right"
        visible={visible}
        src={src}
        my-stereoscopic-video={{eye: 'right', mode: mode, stereo: stereo, split: split}}
      />
    </>
}