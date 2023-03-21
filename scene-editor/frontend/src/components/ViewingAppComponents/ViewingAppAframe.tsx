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
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

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
    const [android, setAndroid] = useState({
        onAndroid: false,
        accepted: false
    });

    const playVideo: Function = () => {
        if (!videoAsset) { return };
        videoAsset.current.play();
    };

    const pauseVideo: Function = () => {
        if (!videoAsset.current) { return };
        videoAsset.current.pause();
    };

    const replay = () => {
        onFinish("", () => {return});
        setAppState({
            started: false,
            menuEnabled: true,
            videoPlaying: false,
            ended: false,
            videoLoaded: false
        });
        pauseVideo();
    };

    const enterVR = () => {
        const scene: any = document.getElementById('aframescene');
        scene.enterVR();
    };

    const exitVR = () => {
        console.log("exit vr");
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

    const enableAndroidAutoplay = () => {
        setAndroid({...android, accepted: true});
        playVideo();
    }

    useEffect(() => {
        setAppState({
            ...appState,
            videoLoaded:false
        });
    }, [video]);

    useEffect(() => {
        pauseVideo();
        if (navigator.userAgent.match(/android/i)) {
            setAndroid({...android, onAndroid: true})
        }
    }, []);

    return (
        <>
        <Scene 
            id="aframescene" 
            vrModeUI={{enabled: false, enterVRButton: "#entervrbutton" }}
            background={{color: "black"}}
            embedded>
            <Assets>
                <video
                    ref={videoAsset}
                    id={`video${video.id}`}
                    controls
                    autoPlay={false}
                    // src={`${process.env.PUBLIC_URL}/asset/${video.path}`} //DEVSRC
                    src={`/asset/${video.path}`}
                    crossOrigin="crossorigin"
                    onTimeUpdate={(e: any) => onTimeUpdate(e.target.currentTime)}
                    webkit-playsinline="true"
                    onLoadedData={videoLoaded}
                    playsInline
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
        </Scene>'
        {android.onAndroid ? 
            <Dialog open={!android.accepted}>
                <DialogTitle id="alert-dialog-title">
                    {"Enable Autoplay"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    Please accept staring videos automatically
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={enableAndroidAutoplay} autoFocus>OK</Button>
                </DialogActions>
            </Dialog>
        : 
            null}
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
