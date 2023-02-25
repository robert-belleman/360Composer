import React, { useEffect, useRef, useState } from "react";
import AFRAME from 'aframe';

import {
    Assets,
    Entity,
} from '@belivvr/aframe-react';
import MyStereoscopicCamera from "./Stereoscopic/components/MyStereoscopicCamera";
import StereoVideo from "./Stereoscopic/components/StereoVideo";

interface VideoPlayerProps {
    video: any
    paused: boolean
    onTimeUpdate: Function
    onEnded: Function
}
const gazeTime : number = 2000

const VideoPlayer: React.FC<VideoPlayerProps> = ({video, paused, onTimeUpdate, onEnded}: VideoPlayerProps) => {
    const videoAsset : any = useRef(undefined);
    const [oldVideo, setOldVideo] = useState({id: "", src: ""});

    useEffect(() => {
        if (!video) {return}
        videoAsset.current.currentTime = 0;
        setOldVideo({id: `video${video.id}`, src: `http://localhost:8080/asset/${video.path}`});
    }, [video, videoAsset]);

    useEffect(() => {
        videoAsset.current.addEventListener('ended', onEnded, false);
    }, []);

    useEffect(() => {
        if (!video) {return}
        paused ? videoAsset.current?.pause() : videoAsset.current?.play()
    }, [video, paused, videoAsset]);

    
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
        <>
        <Assets>
            <video
                ref={videoAsset}
                // id="aframeVideo"
                id={video ? `video${video.id}` : oldVideo.id}
                controls
                autoPlay={false}
                src={video ? `http://localhost:8080/asset/${video.path}`: oldVideo.src} //DEVSRC
                crossOrigin="crossorigin"
                onTimeUpdate={(e: any) => onTimeUpdate(e.target.currentTime)}
            /> 
        </Assets>
        <MyStereoscopicCamera
                    id="mainCamera"
                    wasdControlsEnabled={false}
                    position={{x: 0, y:1.6, z: 0}}
        >
            {paused ? cursor : null}
        </MyStereoscopicCamera>
        <StereoVideo
            src={video ? `#video${video.id}` : `#${oldVideo.id}`}
            mode="full"
            split= {(video && video.view_type === 'ViewType.sidetoside') ? 'vertical': 'horizontal'}
            stereo= {(video && video.view_type !== 'ViewType.mono')}
        />
        </>
    );
};

export default VideoPlayer;
