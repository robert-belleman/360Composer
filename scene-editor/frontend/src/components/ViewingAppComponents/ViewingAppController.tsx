import axios from "axios";
import React, { useEffect, useState } from "react";
import ViewingAppAframe from "./ViewingAppAframe";

interface ViewingAppControllerProps {
    sceneId: string,
    scenarioId: string,
    timelineId: string,
    onFinish: Function
}

const ViewingAppController: React.FC<ViewingAppControllerProps> = ({sceneId="", scenarioId="", timelineId="", onFinish=()=>{}}: ViewingAppControllerProps) => {
    const [ready, setReady] = useState<boolean>(false);
    const [scene, setScene]: any  = useState(undefined);
    const [currentVideo, setCurrentVideo]: any = useState(undefined);
    const [currentAnnotations, setCurrentAnnotations]: any = useState(undefined);
    const [scenario, setScenario]: any  = useState(undefined);
    const [timeline, setTimeline]: any  = useState(undefined);
    const [currentSceneId, setCurrentSceneId] = useState<string>("");

    let index = 0;

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
            setCurrentAnnotations(data)
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

    const onFinishScene = (actionId: string = "") => {
        if (actionId) {
            var sceneLinks = scenario.scenes.find((targetScene: any) => targetScene.id === currentSceneId).links;
            if(sceneLinks.length) {
                var action = sceneLinks.find((link:any) => link.action_id === actionId);
                console.log(action);
                if (action.targetId !== "") {
                    setCurrentSceneId(action.target_id);
                    var newSceneId = scenario.scenes.find((targetScene: any) => targetScene.id === action.target_id).scene_id;
                    fetchSceneData(newSceneId);
                    return 'resume';
                } else {
                    if (!onFinish()) {
                        return 'end';
                    } 
                    return;
                }
            } else {
                if (!onFinish()) {
                    setCurrentSceneId(scenario.start_scene);
                    fetchSceneData(scenario.scenes[0].scene_id);
                    return 'end';
                } 
                return;
            }
        } else {
            if (!onFinish()) {
                fetchSceneData(sceneId);
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
    }, [timelineId]);

    useEffect(() => {
        if (timeline) {
            let firstScenario = timeline.scenarios.find((scenario: any) => {return scenario.uuid === timeline.start});
            setScenario(firstScenario);
        }
    }, [timeline]);

    useEffect(() => {
        if(timelineId && scenario) {
            let firstScene = scenario.segments.find((scene: any) => {return scene.uuid === scenario.start_scene});
            setScene(firstScene)
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
            setCurrentAnnotations(scene.annotations);
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
        // console.log(currentVideo);
    }, [currentVideo]);

    useEffect(() => {
        console.log(currentAnnotations);
    }, [currentAnnotations]);

    return (currentVideo && currentAnnotations) ? <ViewingAppAframe video={currentVideo} annotations={currentAnnotations} onFinish={onFinishScene}/> : <>LOADING</>;
};

export default ViewingAppController;
