import React from "react";
import {
    Entity,
} from '@belivvr/aframe-react';
import MyStereoscopicCamera from "./Stereoscopic/components/MyStereoscopicCamera";
import StereoVideo from "./Stereoscopic/components/StereoVideo";

interface StereoComponentProps {
    videoId: string
    stereoMode: any
    paused: boolean
    loading: boolean
}
const gazeTime : number = 2000

const StereoComponent: React.FC<StereoComponentProps> = ({videoId, stereoMode, paused, loading}: StereoComponentProps) => {
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
        <MyStereoscopicCamera
                    id="mainCamera"
                    wasdControlsEnabled={false}
                    position={{x: 0, y:1.6, z: 0}}
        >
            {paused ? cursor : null}
        </MyStereoscopicCamera>
        <StereoVideo
            src={`#${videoId}`}
            mode="full"
            split= {(stereoMode === 'ViewType.sidetoside') ? 'vertical': 'horizontal'}
            stereo= {(stereoMode !== 'ViewType.mono')}
            visible={!loading}
        />
        </>
    );
};

export default StereoComponent;
