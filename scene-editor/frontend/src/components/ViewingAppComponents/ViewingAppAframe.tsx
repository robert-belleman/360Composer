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
import StartRecordingMenu from "./AframeComponents/startRecordingMenu";
import StartPlaybackMenu from "./AframeComponents/startPlayback";
import EndRecordingMenu from "./AframeComponents/stoprecordingMenu";
import EndPlaybackgMenu from "./AframeComponents/stopPlayback";
import EndMenu from "./AframeComponents/EndMenu";
import { stereoscopic } from './AframeComponents/Stereoscopic';
import { Button } from "@mui/material";
import { isIOS, isMobile, isSafari } from "react-device-detect";
import { delay } from "lodash";
// import { WindowsMotionController } from "@babylonjs/core";
import { HlsContext } from "../../App";
import Hls from "hls.js";

import { recording_test } from "../EditorComponents/recording";

stereoscopic(AFRAME);

interface ViewingAppAframeProps {
    video: any,
    offline: boolean,
    annotations: any,
    allAnnotations: any,
    startRecord: Function,
    stopRecord: Function,
    onFinish: Function,
    startPlayback: Function,
    stopPlayback: Function
}

var startedRecording: boolean = false;
var finishedRecording: boolean = false;

const ViewingAppAframe: React.FC<ViewingAppAframeProps> = ({video, offline, annotations, allAnnotations, startRecord, stopRecord, startPlayback, stopPlayback, onFinish}: ViewingAppAframeProps) => {
    const hls = useContext<Hls | undefined>(HlsContext);

    const [appState, setAppState] = useState({
        started: false,
        menuEnabled: true,
        recordingStarted: false,
        recordingEnded: false,
        videoPlaying: false,
        ended: false,
        videoLoaded: false,
        // startedPlayback: false,
        // stoppedPlayback: false,
    });

    const [playButtonOpen, setPlayButtonOpen] = useState(false);
    const [startRecordingButtonOpen, setStartRecordingButton] = useState(false);
    const [stopRecordingButtonOpen, setStopRecordingButton] = useState(false);
    const [startedPlayback, setStartedPlayback] = useState(false);
    const [stoppenPlayback, setStoppedPlayback] = useState(false);

    // Plays the current video by id
    const playVideo: Function = () => {
        const videoElement: any = document.getElementById(`aframe-video`);
        if (!videoElement) { return };
        videoElement.play()

        // Unmute the video. Mute is set because of iOS devices.
        videoElement.muted = false;
    };

    // Pauses the current video
    const pauseVideo: Function = () => {
        const videoElement: any = document.getElementById(`aframe-video`);
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
        console.log(response);
        switch(response) {
            // Exiting application. Exit VR and set to ended
            case 'exit': {
                console.log('executing callback exit');
                setAppState({
                    started: true,
                    menuEnabled: false,
                    videoPlaying: false,
                    recordingStarted: false,
                    recordingEnded: false,
                    ended: true,
                    videoLoaded: true
                });
                exitVR();
                break;
            }
            // The action had no next step. Bring application to end screen
            case 'end': {
                console.log('executing callback end');
                setAppState({
                    started: true,
                    menuEnabled: false,
                    recordingStarted: false,
                    recordingEnded: false,
                    videoPlaying: false,
                    ended: true,
                    videoLoaded: true
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
    // try to have different actions depending on annotation type?
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
    const onTimeUpdate = async (time: number) => {
        if (annotations) {
            // console.log('annotations are', annotations);
            // console.log('time is', time);
            // console.log('timestamp is', annotations.timestamp)
            console.log(appState.recordingEnded);

            if (appState.recordingEnded? time >= allAnnotations[1].timestamp - 1: time >= allAnnotations[0].timestamp - 1) {
                console.log("pausing video...");
                pauseVideo();
                setAppState({
                    ...appState,
                    videoPlaying:false,
                    menuEnabled:true
                });

                // change to check for 4 or 5, then call corresponding function.
                if (annotations.type === 4 && startedRecording === false) {
                    console.log("using recording function ");
                    startedRecording = true;
                    setStartRecordingButton(true);
                    // startRecord(record_callback);
                };

                if (annotations.type === 5 && startedPlayback === false) {
                    // useState()
                    setStartedPlayback(true);
                    startPlayback();
                }

                // Pick first option automatically for load testing purposes
                console.log(annotations);
                console.log(annotations.options);
                console.log(annotations.options[0]);
            }
        }
    };

    const startRecording = () => {
        setStartRecordingButton(false);
        setStopRecordingButton(true);
        setAppState({
            ...appState,
            recordingStarted:true
        });
        startRecord();
    }
    const stopRecording = () => {
        stopRecord(recordingCallback);
    }

    const AFramestopPlayback = () => {
        stopPlayback();
    }

    const playback_callback = () => {}

    // set the current annotation to be next. this allows for the dialogue
    // options.
    const recordingCallback = (res: string) => {
        console.log(res);
        console.log("annotation = ");
        console.log(allAnnotations[1]);
        console.log("restarting video");
        finishedRecording = true;
        setAppState({
            ...appState,
            recordingEnded:true
        });
        startVideo();
    }

    const onVideoEnded = () => {
        console.log('Video ended');
        onFinish("", menuOptionCallback);
    }

    const replay = () => {
        console.log('Replay');
        onFinish("replay", () => {return});
        const videoElement = document.getElementById(`aframe-video`) as HTMLMediaElement;
        videoElement.currentTime = 0;
        setAppState({
            started: true,
            menuEnabled: false,
            videoPlaying: true,
            recordingStarted: false,
            recordingEnded: false,
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
        console.log('Video loaded');
        // If the starting menu is open. Do not start playing.
        if (!appState.started) {
            setAppState({...appState, videoLoaded:true});
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
        const videoElement = document.getElementById(`aframe-video`) as HTMLMediaElement;

        if (offline) {
            // If offline, load the local video file directly
            let videoSource = `/assets/${video.path}?cache=true`;
            videoElement.src = videoSource;
            videoElement.addEventListener('loadedmetadata', onVideoLoaded);
        } else {
            // If online, use HLS or fallback to direct source

            /* If hls is not supported, or not available, load the unprocessed video */
            if (hls == undefined || !video.hls_path) {
                console.log("HLS is not supported (for this video), falling back to original.");
                if (hls !== undefined) hls.detachMedia();
                videoElement.src = `/assets/${video.path}`;
                videoElement.addEventListener('loadedmetadata', onVideoLoaded);
            } else {
                let hlsSource = `/assets/${video.hls_path || video.path}`;
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
            }
        }

        videoElement.addEventListener('ended', onVideoEnded);

        return () => {
            videoElement.removeEventListener('ended', onVideoEnded);
        };
    }, [hls, video, offline]);

    return (
        <>
        <div id="video-player-root" style={{display: "none"}}>
            <video
                id={`aframe-video`}
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
                    videoId={`aframe-video`}
                    stereoMode={video.view_type}
                    paused={!appState.videoPlaying}
                    loading={!appState.videoPlaying && !appState.menuEnabled}/>
            {!appState.started ? <StartMenu onStart={startVideo} /> : null}
            {startRecordingButtonOpen &&
             !appState.videoPlaying &&
             appState.menuEnabled &&
             !appState.recordingStarted &&
             !appState.recordingEnded
             && annotations.type === 4 ? <StartRecordingMenu onClick={startRecording} /> : null}
            {stopRecordingButtonOpen &&
            !appState.videoPlaying &&
            appState.menuEnabled &&
            appState.recordingStarted &&
            !appState.recordingEnded &&
            annotations.type === 4 ? <EndRecordingMenu onClick={stopRecording} /> : null}
            {appState.ended ? <EndMenu onEnd={replay}/> : null}
            {appState.menuEnabled && appState.started && !appState.ended ?
                <Menu
                            annotations={appState.recordingStarted && appState.recordingEnded? allAnnotations[1] : annotations}
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
