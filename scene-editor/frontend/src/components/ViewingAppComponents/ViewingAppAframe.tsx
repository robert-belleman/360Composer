/*  ViewingAppAframe manages the A-Frame implementation of the viewing application.
 *  It manages the video and annotation data given by the controller which must be
 *  set at all times.
 */
import React, { useContext, useEffect, useState } from "react";
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
import { delay } from "lodash";
import { WindowsMotionController } from "@babylonjs/core";
import { HlsContext } from "../../App";
import Hls from "hls.js";

stereoscopic(AFRAME);

interface ViewingAppAframeProps {
    video: any,
    annotations: any,
    onFinish: Function
}

const ViewingAppAframe: React.FC<ViewingAppAframeProps> = ({video, annotations, onFinish}: ViewingAppAframeProps) => {
    const hls = useContext<Hls | undefined>(HlsContext);

    const [appState, setAppState] = useState({
        started: false,
        menuEnabled: true,
        videoPlaying: false,
        ended: false,
        videoLoaded: false
    });
    const [playButtonOpen, setPlayButtonOpen] = useState(false);

    // Plays the current video by id
    const playVideo: Function = () => {
        const videoElement: any = document.getElementById(`aframe-video-${video.id}`);
        if (!videoElement) { return };
        videoElement.play()

        // Unmute the video. Mute is set because of iOS devices.
        videoElement.muted = false;
    };

    // Pauses the current video
    const pauseVideo: Function = () => {
        const videoElement: any = document.getElementById(`aframe-video-${video.id}`);
        if (!videoElement) { return };
        videoElement.pause();
    };

    // enters VR by accessing the scene
    const enterVR = async () => {
        const scene: any = document.getElementById('aframescene');
        scene.enterVR();
    };

    // exits VR by accessing the scene
    const exitVR = () => {
        const scene: any = document.getElementById('aframescene');
        scene.exitVR();
        startVideo();
    }

    // menuOptionCallback receives a response from the controller
    // when an option is submitted to the controller.
    const menuOptionCallback = (response: string) => {
        switch(response) {
            // Exiting application. Exit VR and set to ended
            case 'exit': {
                setAppState({
                    ...appState,
                    ended:true
                });
                exitVR();
                break;
            }
            // The action had no next step. Bring application to end screen
            case 'end': {
                setAppState({
                    ...appState,
                    ended:true
                });
                break;
            }
            // Resume current video. (Currently no support from editor)
            case 'resume': {
                startVideo();
                break;
            }
            default: {
                break;
            }
        }
    }

    // Communicate to controller which actionid was taken.
    const chosenMenuOption = (id: string) => {
        setAppState({
            ...appState,
            menuEnabled:false
        });
        const actionId = annotations.options.find((option: any) => option.id === id).action.id;
        onFinish(actionId, menuOptionCallback);
    };

    // Checks if the video has reached the annotation and opens menu.
    // (Currently only supports the first annotation.)
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
        console.debug('Video ended');
        onFinish("", () => {return});
        setAppState({
            started: true,
            menuEnabled: false,
            videoPlaying: false,
            ended: true,
            videoLoaded: true
        });
    }

    const replay = () => {
        console.debug('Replay');
        const videoElement = document.getElementById(`aframe-video-${video.id}`) as HTMLMediaElement;
        videoElement.currentTime = 0;
        setAppState({
            started: true,
            menuEnabled: false,
            videoPlaying: true,
            ended: false,
            videoLoaded: true
        });
        playVideo();
    };

    // Starts the video and disables the menu.
    const startVideo = () => {
        setAppState({
            ...appState,
            started:true,
            videoPlaying:true,
            menuEnabled:false
        });
        playVideo();
    };

    const onVideoLoaded = () => {
        console.debug('Video loaded');
        // If the starting menu is open. Do not start playing.
        if (!appState.started) {setAppState({...appState, videoLoaded:true}); return};
        playVideo();
        setAppState({
            ...appState,
            videoPlaying:true,
            menuEnabled:false,
            videoLoaded:true
        });
    }

    // iOS devices require a gesture for automatic playback. If this is pressed
    // start the video.
    const handlePlayButton = () => {
        playVideo();
        setPlayButtonOpen(false);
        setAppState({
            ...appState,
            videoPlaying:true,
        });
    };

    useEffect(() => {
        setAppState({
            ...appState,
            videoPlaying: false,
            videoLoaded:false
        });
        pauseVideo();
        if (isIOS && !appState.started) {
            setPlayButtonOpen(true);
        }
    }, [video]);

    useEffect(() => {
        if (hls == undefined) {
            console.warn("HLS not available");
            return;
        }

        console.debug("Attaching HLS.js");

        const videoElement = document.getElementById(`aframe-video-${video.id}`) as HTMLMediaElement;
        const hlsSource = `/assets/${video.path}`;

        if (Hls.isSupported()) {
            hls.loadSource(hlsSource);
            hls.attachMedia(videoElement);
            hls.once(Hls.Events.FRAG_LOADED, onVideoLoaded);
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = hlsSource;
            videoElement.addEventListener('loadedmetadata', onVideoLoaded);
        } else {
            console.error("No HLS support");
        }

        videoElement.addEventListener('ended', onVideoEnded);
    }, [hls, video]);

    return (
        <>
        <div id="video-player-root" style={{display: "none"}}>
            <video
                id={`aframe-video-${video.id}`}
                playsInline
                onTimeUpdate={(e: any) => onTimeUpdate(e.target.currentTime)}
                autoPlay={false}
                muted
            />
        </div>

        <Scene
            id="aframescene"
            vrModeUI={{enabled: false, enterVRButton: "#entervrbutton" }}
            background={{color: "black"}}
            embedded>
            <StereoComponent
                    videoId={`aframe-video-${video.id}`}
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
            { appState.started && playButtonOpen ?
               <Button
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
                </Button>
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
