import React, { useEffect, useState } from "react";
import 'aframe';

import {
    Scene,
    Sky
} from '@belivvr/aframe-react';
import Menu from "./AframeComponents/Menu";
import VideoPlayer from "./AframeComponents/VideoPlayer";
import axios from "axios";
import StartMenu from "./AframeComponents/StartMenu";
import EndMenu from "./AframeComponents/EndMenu";

interface ViewingAppAframeProps {
    
    scene: any
    onFinish: Function
}

const ViewingAppAframe: React.FC<ViewingAppAframeProps> = ({scene, onFinish}: ViewingAppAframeProps) => {
    const [menuEnabled, setMenuEnabled] = useState<boolean>(true);
    const [video, setVideo]: any = useState(undefined);
    const [annotations, setAnnotations]: any = useState(undefined);
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

    const fetchVideo = async () => {
        await axios.get(`/api/asset/${scene.video_id}`)
             .then((res: any) => {setVideo(res.data)})
    };
    
    const fetchAnnotations = async () => {
        await axios.get(`/api/scenes/${scene.id}/annotations`)
             .then((res:any) => setAnnotations(res.data[0]))
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
        fetchAnnotations()
        fetchVideo()
    }, [scene]);

    useEffect(() => {        
        if (resumeWhenLoaded) {
            setResumeWhenLoaded(false);
            startVideo();
        }
    }, [annotations, video]);

    return (
        <Scene vrModeUI={{enabled: true}}>
            <Sky color="#ECECEC" />
            {video ? 
                <VideoPlayer
                    video={video}
                    stereo={!(video.view_type === "ViewType.mono")}
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
      );
};

export default ViewingAppAframe;
