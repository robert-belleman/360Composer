import React, { createElement, Ref, useEffect, useRef, useState } from "react";
import 'aframe';

import {
    Assets,
    Scene,
    Video
} from '@belivvr/aframe-react';
import Menu from "./AframeComponents/Menu";
import StereoComponent from "./AframeComponents/StereoComponent";
import StartMenu from "./AframeComponents/StartMenu";
import EndMenu from "./AframeComponents/EndMenu";
import { stereoscopic } from './AframeComponents/Stereoscopic';
import { Button } from "@mui/material";
import { isFirefox, isMobile } from "react-device-detect";

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
        videoLoaded: false,
        playButtonClicked: false
    });

    const playVideo: Function = () => {
        const videoElement: any = document.getElementById(`video${video.id}`);
        if (!videoElement) { return };
        videoElement.play();
    };

    const pauseVideo: Function = () => {
        const videoElement: any = document.getElementById(`video${video.id}`);
        if (!videoElement) { return };
        videoElement.pause();
    };

    const replay = () => {
        onFinish("", () => {return});
        setAppState({
            started: true,
            menuEnabled: false,
            videoPlaying: true,
            ended: false,
            videoLoaded: true,
            playButtonClicked: false
        });
        pauseVideo();
    };

    const enterVR = () => {
        const scene: any = document.getElementById('aframescene');
        scene.enterVR();
    };

    const exitVR = () => {
        const scene: any = document.getElementById('aframescene');
        document.exitPointerLock();
        scene.exitVR();
    }

    const startVideo = () => {
        setAppState({
            ...appState,
            started:true,
            videoPlaying:true,
            menuEnabled:false
        });
        playVideo();
    };

    const menuOptionCallback = (response: string) => {
        switch(response) {
            case 'exit': {
                setAppState({
                    ...appState,
                    ended:true
                });
                console.log()
                exitVR();
                break;
            }
            case 'end': {
                setAppState({
                    ...appState,
                    ended:true
                });
                break;
            }
            case 'resume': {
                startVideo();
                break;
            }
            default: {
                break;
            }
        }
    }

    const chosenMenuOption = (id: string) => {
        setAppState({
            ...appState,
            menuEnabled:false
        });
        const actionId = annotations.options.find((option: any) => option.id === id).action.id;
        onFinish(actionId, menuOptionCallback);
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

    const onVideoEnded = () => {
        replay();
    }

    const onVideoLoaded = () => {
        console.log("loaded");
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
            videoPlaying: false,
            videoLoaded:false,
            playButtonClicked: false
        });
    }, [video]);

    const handlePlayButton = () => {
        const videoEl: any = document.getElementById(`video${video.id}`)
        console.log(videoEl)
        videoEl.play()
        const videoSphereLeft: any = document.getElementById("videosphere-left");
        const videoSphereRight: any = document.getElementById("videosphere-right");
        if (videoSphereLeft && videoSphereRight) { 
            videoSphereLeft.components.material.material.map.image.play()
            videoSphereRight.components.material.material.map.image.play()
        }
        setAppState({...appState, playButtonClicked: true});
    };

    console.log(appState)
    console.log(video.path)

    return (
        <>
        <Scene 
            id="aframescene" 
            vrModeUI={{enabled: false, enterVRButton: "#entervrbutton" }}
            background={{color: "black"}}
            embedded>
            <Assets id="aframe-video-assets">
                <video
                    id={`video${video.id}`}
                    src={`/asset/${video.path}`}
                    playsInline={true}
                    onTimeUpdate={(e: any) => onTimeUpdate(e.target.currentTime)}
                    onLoadedData={onVideoLoaded}
                    onEnded={onVideoEnded}
                    autoPlay={false}
                    preload={"auto"} 
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
            {/* { appState.videoPlaying && !appState.playButtonClicked && !isFirefox && isMobile ? 
               <button 
                id="playbutton"
                style={{position: 'absolute',
                        zIndex: 9999, 
                        top: "50%",
                        left: "50%",
                        color: 'black',
                        width: 90,
                        height: 80,
                        transform: "translate(-50%, -50%)",
                        padding: 10, 
                        fontSize:'2em',
                        backgroundColor: 'white',
                        opacity: 0.9
                        }}
                onClick={handlePlayButton}
                >
                    ▶
                </button> 
            : 
                null
            } */}
            <Button 
            id="entervrbutton"
            style={{position: 'absolute', 
                    zIndex: 9999, 
                    right: 0, 
                    bottom: 0, 
                    color: 'black', 
                    margin:10,
                    padding: 10, 
                    fontSize:'1.2em',
                    backgroundColor: 'white',
                    opacity: 0.8,
                    cursor:'pointer'
                    }}
            onClick={enterVR}
            >
                ENTER VR
            </Button>
        </>
    );
};

export default ViewingAppAframe;
