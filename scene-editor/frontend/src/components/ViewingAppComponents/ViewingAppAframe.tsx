import React, { useEffect, useRef, useState } from "react";
import 'aframe';

import {
    Assets,
    Scene,
    Sky
} from '@belivvr/aframe-react';
import Menu from "./AframeComponents/Menu";
import StereoComponent from "./AframeComponents/StereoComponent";
import StartMenu from "./AframeComponents/StartMenu";
import EndMenu from "./AframeComponents/EndMenu";
import { stereoscopic } from './AframeComponents/Stereoscopic';
import { Button } from "@mui/material";

stereoscopic(AFRAME);

interface ViewingAppAframeProps {
    video: any,
    annotations: any,
    onFinish: Function
}

const ViewingAppAframe: React.FC<ViewingAppAframeProps> = ({video, annotations, onFinish}: ViewingAppAframeProps) => {
    const [appState, setAppState] = useState({
        started: false,
        menuEnabled: true,
        videoPlaying: false,
        ended: false,
        videoLoaded: false
    });
    const videoAsset : any = useRef(undefined);

    const playVideo: Function = () => {
        if (!videoAsset) { return };
        videoAsset.current.play();
    };

    const pauseVideo: Function = () => {
        if (!videoAsset.current) { return };
        videoAsset.current.pause();
    };

    const replay = () => {
        setAppState({
            started: false,
            menuEnabled: true,
            videoPlaying: false,
            ended: false,
            videoLoaded: false
        });
    };

    const enterVR = () => {
        const scene: any = document.getElementById('aframescene');
        scene.enterVR();
    };

    const startVideo = () => {
        setAppState({
            ...appState,
            started:true,
            videoPlaying:true,
            menuEnabled:false
        });
        playVideo();
    };

    const chosenMenuOption = (id: string) => {
        setAppState({
            ...appState,
            menuEnabled:false
        });
        const actionId = annotations.options.find((option: any) => option.id === id).action.id;
        const response = onFinish(actionId)
        switch(response) {
            case 'end': {
                setAppState({
                    ...appState,
                    ended:true
                });
                break;
            }
            default: {
                break;
            }
        };
    };

    const onTimeUpdate = (time: number) => {
        if (annotations) {
            if (time >= annotations.timestamp) {
                pauseVideo();
                setAppState({
                    ...appState,
                    videoPlaying:false,
                    menuEnabled:true
                });
            }
        }
    };

    const videoLoaded = () => {
        if (!appState.started) {setAppState({...appState, videoLoaded:true}); return};
        playVideo();
        setAppState({
            ...appState,
            videoPlaying:true,
            menuEnabled:false,
            videoLoaded:true
        });
    }

    useEffect(() => {
        setAppState({
            ...appState,
            videoLoaded:false
        });
    }, [video]);

    useEffect(() => {
        pauseVideo();
    }, []);

    return (
        <>
        <Scene id="aframescene" 
            vrModeUI={{enabled: false, enterVRButton: "#entervrbutton", }}
            background={{color: "black"}}>
            <Assets>
                <video
                    ref={videoAsset}
                    id={`video${video.id}`}
                    controls
                    autoPlay={true}
                    src={`${process.env.PUBLIC_URL}/asset/${video.path}`} //DEVSRC
                    crossOrigin="crossorigin"
                    onTimeUpdate={(e: any) => onTimeUpdate(e.target.currentTime)}
                    webkit-playsinline="true"
                    onLoadedData={videoLoaded}
                />
            </Assets>
            <StereoComponent
                    videoId={`video${video.id}`}
                    stereoMode={video.view_type}
                    paused={!appState.videoPlaying}
                    loading={!appState.videoPlaying && !appState.menuEnabled}/>
            {!appState.started ? <StartMenu onStart={startVideo} /> : null}
            {appState.ended ? <EndMenu onEnd={replay}/> : null}
            {appState.menuEnabled && appState.started && !appState.ended ? 
                <Menu 
                            annotations={annotations}
                            enabled={appState.menuEnabled && appState.started && !appState.ended}
                            onOption={chosenMenuOption}/>
            : null}
        </Scene>
        <Button 
        id="entervrbutton"
        style={{position: 'absolute', 
                zIndex: 9999, 
                right: 0, 
                bottom: 0, 
                color: 'black', 
                margin:10,
                padding: 10, 
                fontSize:'2em',
                backgroundColor: 'white'
                }}
        onClick={enterVR}
        >
            ENTER VR
        </Button>
        </>
    );
};

export default ViewingAppAframe;
