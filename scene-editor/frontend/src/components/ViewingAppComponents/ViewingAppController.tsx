import axios from "axios";
import { set } from "lodash";
import React, { useEffect, useState } from "react";
import ViewingAppAframe from "./ViewingAppAframe";

interface ViewingAppControllerProps {
    sceneId?: string,
    scenarioId?: string,
    timelineId?: string,
    onFinish: Function
}

const ViewingAppController: React.FC<ViewingAppControllerProps> = ({sceneId="", scenarioId="", timelineId="", onFinish=()=>{}}: ViewingAppControllerProps) => {
    const [scene, setScene]: any  = useState(undefined);
    const [currentVideo, setCurrentVideo]: any = useState(undefined);
    const [currentAnnotations, setCurrentAnnotations]: any = useState(undefined);
    const [videoReady, setVideoReady] = useState(false);
    const [annotationsReady, setAnnotationsReady] = useState(false);
    const [scenario, setScenario]: any  = useState(undefined);
    const [timeline, setTimeline]: any  = useState(undefined);

    const setLoading = () => {
        setVideoReady(false);
        setAnnotationsReady(false);
    }

    const removeScene = () => {
        setCurrentAnnotations(undefined);
        setCurrentVideo(undefined);
        setScene(undefined);
    }

    const fetchSceneData = async (id: string) => {
        axios
          .get(`/api/scenes/${id}/`)
          .then((res) => {setScene(res.data)})
          .catch((e) => {
            console.log(e);
          })
    };

    const fetchVideo = async (id: string) => {
        await axios.get(`/api/asset/${id}`)
             .then((res: any) => {setCurrentVideo(res.data)})
             .catch((e:any) => console.log('Something went wrong while fetching video:', e));
    };

    const handleAnnotationData = (data: any) => {
        if (data.length) {
            setCurrentAnnotations(data[0])
        } else {
            setCurrentAnnotations([]);
        }
    };
    
    const fetchAnnotations = async (id: string) => {
        await axios.get(`/api/scenes/${id}/annotations`)
             .then((res:any) => handleAnnotationData(res.data))
             .catch((e:any) => console.log('Something went wrong while fetching annotations:', e));
    };

    const fetchScenarioData = async (id: string) => {
        await axios.get(`/api/scenario/${id}/`)
             .then((res:any) => setScenario(res.data))
             .catch((e:any) => console.log('Something went wrong while fetching scenario:', e));
    };

    const fetchTimelineData = async (id: string) => {
        await axios.get(`/api/timeline/${id}/export`)
             .then((res:any) => setTimeline(res.data[0]))
             .catch((e:any) => console.log('Something went wrong while fetching timeline:', e));
    };

    const setNewScene = (id: string) => {
        setLoading();
        removeScene();
        if (timelineId) {
            const newScene = scenario.scenes.find((scene: any) => {return scene.scene_id === id});
            setScene(newScene);
        } else {
            fetchSceneData(id);
        }
    };

    const onFinishScene = (actionId: string = "") => {
        if (actionId) {
            const sceneLinks: any = timelineId ? scene.links : scenario.scenes.find((targetScene: any) => targetScene.scene_id === scene.id).links;
            
            if(sceneLinks.length) {
                const action = sceneLinks.find((link:any) => link.action_id === actionId);
                if (action.targetId !== "") {
                    const newSceneId = scenario.scenes.find((targetScene: any) => targetScene.id === action.target_id).scene_id;
                    setNewScene(newSceneId);
                    return 'resume';
                } else {
                    if (!onFinish()) {
                        return 'end';
                    } 
                    return;
                }
            } else {
                if (!onFinish()) {
                    setNewScene(scenario.scenes[0].scene_id);
                    return 'end';
                } 
                return;
            }
        } else {
            if (!onFinish()) {
                setNewScene(scene.id);
                return 'end';
            }
            return;
        }
    };

    useEffect(() => {
        if(sceneId) {
            fetchSceneData(sceneId);
        }
    }, [sceneId]);

    useEffect(() => {
        if(scenarioId) {
            fetchScenarioData(scenarioId);
        }
    }, [scenarioId]);

    useEffect(() => {
        if(timelineId) {
            fetchTimelineData(timelineId);
        }
    }, [timelineId ]);

    useEffect(() => {
        if (timeline) {
            let firstScenario = timeline.scenarios.find((scenario: any) => {return scenario.uuid === timeline.start});
            setScenario(firstScenario);
        }
    }, [timeline]);

    useEffect(() => {
        if(scenario) {
            let firstScene = scenario.scenes.find((scene: any) => {return scene.id === scenario.start_scene});
            setNewScene(firstScene.scene_id);
            return;
        }
        if(scenario) {
            let firstScene = scenario.scenes.find((scene: any) => {return scene.id === scenario.start_scene});
            fetchSceneData(firstScene.scene_id);
            return;
        }
    }, [scenario]);

    useEffect(() => {
        if (timelineId && scene) {
            handleAnnotationData(scene.annotations);
            fetchVideo(scene.video);
            return;
        }
        if (scene) {
            fetchAnnotations(scene.id)
            fetchVideo(scene.video_id);
            return;
        }
    }, [scene]);

    useEffect(() => {
        if (currentVideo && !videoReady) {
            setVideoReady(true);
        }
    }, [currentVideo]);

    useEffect(() => {
        if (currentAnnotations && !annotationsReady) {
            setAnnotationsReady(true);
        }
    }, [currentAnnotations]);

    return <ViewingAppAframe 
                            video={currentVideo} 
                            annotations={currentAnnotations} 
                            onFinish={onFinishScene}
                            enabled={videoReady && annotationsReady}/>;
};

export default ViewingAppController;
