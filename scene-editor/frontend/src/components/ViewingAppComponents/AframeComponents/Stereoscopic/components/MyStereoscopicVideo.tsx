import React  from 'react';
import { VideoSphere } from '@belivvr/aframe-react';
import { EntityProps } from '@belivvr/aframe-react/types/core';

interface MyStereoscopicVideoProps {
  src: string;
  mode?: 'full' | 'half';
  split?: 'horizontal' | 'vertical'
}

export default function MyStereoscopicVideo ({
  src,
  mode = 'full',
  split = 'horizontal'
}: MyStereoscopicVideoProps,
props: EntityProps) : JSX.Element {
  return <>
    <VideoSphere
      src={src}
      id="videosphere-left"
      autoplay={true}
      stereoscopic-video={`eye: left; mode: ${mode}; split: ${split};`}
      {...props}
    />
    <VideoSphere
      src={src}
      id="videosphere-right"
      autoplay={true}
      stereoscopic-video={`eye: right; mode: ${mode}; split: ${split};`}
      {...props}
    />
    </>
}