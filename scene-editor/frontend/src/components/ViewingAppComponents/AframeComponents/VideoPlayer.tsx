import React, { useEffect, useRef, useState } from "react";
import AFRAME from 'aframe';

import {
    Assets,
    Camera,
    Entity,
    VideoSphere
} from '@belivvr/aframe-react';

import { stereoscopic } from './Stereoscopic';
import MyStereoscopicCamera from "./Stereoscopic/components/MyStereoscopicCamera";
import MyStereoscopicVideo from "./Stereoscopic/components/MyStereoscopicVideo";

stereoscopic(AFRAME);

interface VideoPlayerProps {
    video: any
    paused: boolean
    onTimeUpdate: Function
    onEnded: Function
}
const gazeTime : number = 2000

const VideoPlayer: React.FC<VideoPlayerProps> = ({video, paused, onTimeUpdate, onEnded}: VideoPlayerProps) => {
    const videoAsset : any = useRef(undefined);

    useEffect(() => {
        paused ? videoAsset.current?.pause() : videoAsset.current?.play()
    }, [paused, videoAsset]);

    useEffect(() => {
        console.log(video)
        videoAsset.current.currentTime = 0;
        videoAsset.current.ontimeupdate = (event: any) => {
            onTimeUpdate(event.target.currentTime);
        };
        videoAsset.current.addEventListener('ended', onEnded, false);
    }, [video]);

    var assets = (
        <Assets>
            <video
                ref={videoAsset}
                id="aframevideo"
                src={`asset/${video.path}`} //DEVSRC
                controls
                autoPlay={false}
                crossOrigin="crossorigin"
            />
        </Assets>
    );
    
    const cursor = (
        <Entity 
            raycaster={{far: 30, objects: ".intersectable"}}
            cursor={{fuse: true, fuseTimeout: gazeTime}}
            geometry={{primitive: "ring", radiusOuter: 0.015,
                    radiusInner: 0.01, segmentsTheta: 32}}
            material={{color: "white", shader: "flat"}}
            position={{x: 0, y: 0, z: -0.75}}
            animation__click={{property: "scale", startEvents: ["click"], 
                                easing: "easeInCubic", dur: 150, 
                                from: "2 2 2", to: "1 1 1"}}
            animation__fusing={{property: "scale", startEvents: ["fusing"], 
                                easing: "easeInCubic", dur: gazeTime, 
                                from: "1 1 1", to: "2 2 2"}}
            animation__mouseleave={{property: "scale", startEvents: ["mouseleave"], 
                                    easing: "easeInCubic", dur: 500, 
                                    to: "1 1 1"}}
        />
    );

    return ( 
        video.view_type === 'ViewType.mono' ? 
            <>
            {assets}
            <Entity position={{x: 0, y:0, z: 0}}>
                <Camera id="mainCamera" wasdControlsEnabled={false}>
                    {paused ? cursor : null}
                </Camera>
            </Entity>
            <VideoSphere
                id ="videosphere"
                src="#aframevideo"
                autoplay
            />
            </>
        :
            <>
            {assets}
            <MyStereoscopicCamera
                wasdControlsEnabled={false}
                prop
                position={{x: 0, y:1.6, z: 0}}
            >
                {paused ? cursor : null}
            </MyStereoscopicCamera>
            <MyStereoscopicVideo
                src="#aframevideo"
                mode="full"
                split={(video.view_type === 'ViewType.sidetoside')? 'vertical': 'horizontal'}
            />
            </>
      );
};

export default VideoPlayer;
