import React  from 'react';
import { VideoSphere } from '@belivvr/aframe-react';

interface MyStereoscopicVideoProps {
  src: string;
  mode?: 'full' | 'half';
  split?: 'horizontal' | 'vertical'
}

export default function MyStereoscopicVideo ({
  src,
  mode = 'full',
  split = 'horizontal'
}: MyStereoscopicVideoProps) : JSX.Element {
  return <>
      <VideoSphere
        src={src}
        stereoscopic-video={`eye: left; mode: ${mode}; split: ${split};`}
      />
      <VideoSphere
        src={src}
        stereoscopic-video={`eye: right; mode: ${mode}; split: ${split};`}
      />
    </>
}