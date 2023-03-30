import React, { useEffect, useState } from "react";
import 'aframe';

import {
    Assets,
    Scene
} from '@belivvr/aframe-react';
import Menu from "./AframeComponents/Menu";
import StereoComponent from "./AframeComponents/StereoComponent";
import StartMenu from "./AframeComponents/StartMenu";
import EndMenu from "./AframeComponents/EndMenu";
import { stereoscopic } from './AframeComponents/Stereoscopic';
import { Button } from "@mui/material";
import { isIOS, isMobile, isSafari } from "react-device-detect";

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
        playButtonOpen: false
    });

    const playVideo: Function = () => {
        const videoElement: any = document.getElementById(`aframe-video`);
        if (!videoElement) { return };
        const promise = videoElement.play();
        if (promise !== undefined) {
            promise.catch(() => {
                setAppState({...appState, playButtonOpen: true})
            });
        }
    };

    const pauseVideo: Function = () => {
        const videoElement: any = document.getElementById(`aframe-video`);
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
            playButtonOpen: false
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
        if (!appState.started) {setAppState({...appState, videoLoaded:true}); return};
        if (isIOS) {
            setAppState({
                ...appState,
                menuEnabled:false,
                videoLoaded:true,
                playButtonOpen: true
            });
            return;
        }
        playVideo();
        setAppState({
            ...appState,
            videoPlaying:true,
            menuEnabled:false,
            videoLoaded:true
        });
    }

    const handlePlayButton = () => {
        const videoEl: any = document.getElementById(`aframe-video`)
        videoEl.play()
        setAppState({...appState, playButtonOpen: false, videoPlaying: true});
    };
    
    useEffect(() => {
        setAppState({
            ...appState,
            videoPlaying: false,
            videoLoaded:false
        });
    }, [video]);


    return (
        <>
        <Scene 
            id="aframescene" 
            vrModeUI={{enabled: false, enterVRButton: "#entervrbutton" }}
            background={{color: "black"}}
            embedded>
            <Assets id="aframe-video-assets">
                <video
                    id={`aframe-video`}
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
                    videoId={`aframe-video`}
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
        { appState.playButtonOpen ?
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
            }
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
