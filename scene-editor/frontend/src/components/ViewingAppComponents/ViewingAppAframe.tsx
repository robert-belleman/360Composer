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

stereoscopic(AFRAME);

interface ViewingAppAframeProps {
    video: any,
    offline: boolean,
    annotations: any,
    allAnnotations: any,
    startRecord: Function,
    controllerStopRecord: Function,
    onFinish: Function,
    startPlayback: Function,
    stopPlayback: Function,
}

const ViewingAppAframe: React.FC<ViewingAppAframeProps> = ({video, offline, annotations, allAnnotations, startRecord, controllerStopRecord, startPlayback, stopPlayback, onFinish}: ViewingAppAframeProps) => {
    const hls = useContext<Hls | undefined>(HlsContext);

    const [appState, setAppState] = useState({
        started: false,
        menuEnabled: true,
        videoPlaying: false,
        ended: false,
        videoLoaded: false,
    });

    const [playButtonOpen, setPlayButtonOpen] = useState(false);

    // keep track of which annotation has already been reached.
    const [currentAnnot, setCurrentAnnot] = useState(0);
    // ordered annotations by timestamp
    const [sortedAnnot, setSortedAnnot] = useState([0])

    // reset these when new scene appears

    const [startRecMenu, setStartRecMenu] = useState(false);
    const [startRec, setStartRec] = useState(false);
    const [finishRec, setFinishRec] = useState(false);
    const [stopRecMenu, setStopRecMenu] = useState(false);

    const [startPBMenu, setStartPBMenu] = useState(false);
    const [startPB, setStartPB] = useState(false);
    const [finishPB, setFinishPB] = useState(false);
    const [stopPBMenu, setStopPBMenu] = useState(false);

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
        switch(response) {
            // Exiting application. Exit VR and set to ended
            case 'exit': {
                console.log('executing callback exit');
                setAppState({
                    started: true,
                    menuEnabled: false,
                    videoPlaying: false,
                    ended: true,
                    videoLoaded: true,
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
                    videoPlaying: false,
                    ended: true,
                    videoLoaded: true,
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
        var actionId;
        var annotation_index = sortedAnnot[currentAnnot];
        actionId = allAnnotations[annotation_index].options.find((option: any) => option.id === id).action.id;

        // Once the next scene is selected, make sure all the states are reset.
        setCurrentAnnot(0);
        setSortedAnnot([0]);
        reset_states();
        onFinish(actionId, menuOptionCallback);
    };

    // Sorts the annotations by timestamp, and sets the SortedAnnot state.
    const sortAnnot = () => {
        if (!allAnnotations) {
            return
        }

        // store the indeces of the annotations in order of timestamps
        let temp_sort = [0]
        var length_sorted = 1

        while (length_sorted < allAnnotations.length ){

            let index = 0;

            while (index <= length_sorted) {
                if (index == length_sorted) {
                    temp_sort.push(index);
                    break;
                }

                var index_allAnnot = temp_sort[index];


                if (allAnnotations[length_sorted].timestamp < allAnnotations[index_allAnnot].timestamp){
                    temp_sort.splice(index, 0, length_sorted);
                    break;
                }

                index += 1;
            }

            length_sorted += 1;
        }
        setSortedAnnot(temp_sort);
    }

    // Checks if the video has reached an annotation and opens corresponding
    // menu.
    // (Currently supports all annotations, as long as there is only one 'text'
    // type annotation.)
    const onTimeUpdate = async (time: number) => {
        if (allAnnotations) {
            // If the app has reached the current annotation.
            if (appState.videoPlaying && time >= allAnnotations[sortedAnnot[currentAnnot]].timestamp) {
                pauseVideo();
                setAppState({
                    ...appState,
                    videoPlaying:false,
                    menuEnabled:true,
                });

                // If recording annotation and not already started recording
                if (allAnnotations[sortedAnnot[currentAnnot]].type === 4 && !startRec) {
                    setAppState({
                        ...appState,
                        videoPlaying:false,
                        menuEnabled:true
                    });

                    setStartRecMenu(true)
                };

                // If playback annotation and not already started playback
                if (allAnnotations[sortedAnnot[currentAnnot]].type === 5 && !startPB) {
                    setAppState({
                        ...appState,
                        videoPlaying:false,
                        menuEnabled:true
                    });

                    setStartPBMenu(true)
                };

                // Pick first option automatically for load testing purposes
                // console.log(annotations);
                // console.log(annotations.options);
                // console.log(annotations.options[0]);
            }
        }
    };

    const startRecording = () => {
        setStopRecMenu(true);
        setFinishRec(false);

        setStartRec(true)
        startRecord();
    }
    const stopRecording = async () => {
        setFinishRec(true);
        var allAnnotIndex = sortedAnnot[currentAnnot];
        controllerStopRecord(recordingCallback, allAnnotations[allAnnotIndex].tag);
    }

    const AFramestopPlayback = () => {
        setFinishPB(true);
        setStartPB(false);
        setCurrentAnnot(currentAnnot + 1);
        startVideo();
    }

    const AFramestartPlayback = () => {
        setStopPBMenu(true);
        setStartPB(true);
        setFinishPB(false);
        startPlayback(allAnnotations[currentAnnot].tag);
    }

    // set the current annotation to be next. This allows for the dialogue
    // options to be displayed once the next annotation is reached.
    const recordingCallback = (res: string) => {
        setFinishRec(true);
        setCurrentAnnot(currentAnnot + 1);
        setStartRec(false);
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
            ended: false,
            videoLoaded: true,
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

    const reset_states = () => {
        setStartRecMenu(false);
        setStopRecMenu(false);
        setFinishRec(false);
        setStartRec(false);

        setStartPBMenu(false);
        setStartPB(false);
        setFinishPB(false);
        setStopPBMenu(false);
    }

    const onVideoLoaded = () => {
        console.log('Video loaded');
        // If the starting menu is open. Do not start playing.
        if (!appState.started) {
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

    // sorts the annotations once new ones are loaded in. This ensures the
    // indexing of the annotations is based on their timestamp.
    useEffect(() => {
        // Only sort the annotations if there are any.
        if (allAnnotations) {
            sortAnnot();
        }
    }, [allAnnotations])

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

            {!appState.videoPlaying && !startRec && startRecMenu && allAnnotations[sortedAnnot[currentAnnot]].type === 4 ? <StartRecordingMenu onClick={startRecording} /> : null}
            {!appState.videoPlaying && !startPB && startPBMenu && allAnnotations[sortedAnnot[currentAnnot]].type === 5 ? <StartPlaybackMenu onClick={AFramestartPlayback} /> : null}

            {!appState.videoPlaying && startRec && !finishRec && stopRecMenu && allAnnotations[sortedAnnot[currentAnnot]].type === 4 ? <EndRecordingMenu onClick={stopRecording} /> : null}
            {!appState.videoPlaying && startPB && !finishPB && stopPBMenu && allAnnotations[sortedAnnot[currentAnnot]].type === 5 ? <EndPlaybackgMenu onClick={AFramestopPlayback} /> : null}

            {appState.ended ? <EndMenu onEnd={replay}/> : null}

            {allAnnotations[sortedAnnot[currentAnnot]].type === 0 && appState.menuEnabled && appState.started && !appState.ended && !appState.videoPlaying?
                <Menu
                            annotations={allAnnotations[sortedAnnot[currentAnnot]]}
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
