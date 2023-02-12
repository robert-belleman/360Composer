import React, { useEffect, useState } from "react";
import 'aframe';

import {
    Scene,
    Sky
} from '@belivvr/aframe-react';
import Menu from "./AframeComponents/Menu";
import VideoPlayer from "./AframeComponents/VideoPlayer";
import StartMenu from "./AframeComponents/StartMenu";
import EndMenu from "./AframeComponents/EndMenu";

interface ViewingAppAframeProps {
    video: any,
    annotations: any,
    onFinish: Function,
    enabled: boolean
}

const ViewingAppAframe: React.FC<ViewingAppAframeProps> = ({video, annotations, onFinish, enabled}: ViewingAppAframeProps) => {
    const [menuEnabled, setMenuEnabled] = useState<boolean>(true);
    const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
    const [started, setStarted] = useState<boolean>(false);
    const [ended, setEnded] = useState<boolean>(false);
    const [resumeWhenLoaded, setResumeWhenLoaded] = useState<boolean>(false);

    const replay = () => {
        setEnded(false);
        setStarted(false);
    };

    const startVideo = () => {
        setMenuEnabled(false);
        setVideoPlaying(true);
        setStarted(true);
    };

    const pauseVideo = () => {
        setMenuEnabled(true);
        setVideoPlaying(false);
    };

    const end = () => {
        setVideoPlaying(false);
        setEnded(true);
    };

    const chosenMenuOption = (id: string) => {
        setMenuEnabled(false);
        var actiondId = annotations.options.find((option: any) => option.id === id).action.id;
        var response = onFinish(actiondId)
        switch(response) {
            case 'resume': {
                setResumeWhenLoaded(true);
                break;
            }
            case 'end': {
                setEnded(true);
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
            }
        }
    };

    useEffect(() => {        
        if (resumeWhenLoaded) {
            setResumeWhenLoaded(false);
            startVideo();
        }
    }, [annotations, video]);

    return enabled ? (
        <Scene vrModeUI={{enabled: true}}>
            <Sky color="#ECECEC" />
            {video ? 
                <VideoPlayer
                    video={video}
                    paused={!videoPlaying}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={end} /> 
            : 
                <></>
            }
            {!started || ended ? 
                ended ?
                    <EndMenu onEnd={replay} activated={ended}/>
                :
                    <StartMenu onStart={startVideo} activated={!started} /> 
            :
                annotations ? 
                    <Menu 
                        annotations={annotations}
                        enabled={menuEnabled}
                        onOption={chosenMenuOption}/>
                : 
                    <></>
            }
        </Scene>
      ) : <></>
};

export default ViewingAppAframe;
