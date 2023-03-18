import axios from "axios";
import { time } from "console";
import { set } from "lodash";
import React, { useEffect, useState } from "react";
import ViewingAppAframe from "./ViewingAppAframe";

interface ViewingAppControllerProps {
    sceneId?: string,
    scenarioId?: string,
    timelineId?: string,
    onFinish?: Function
}

const ViewingAppController: React.FC<ViewingAppControllerProps> = ({sceneId="", scenarioId="", timelineId="", onFinish}: ViewingAppControllerProps) => {
    const [scene, setScene]: any  = useState(undefined);
    const [currentVideo, setCurrentVideo]: any = useState(undefined);
    const [currentAnnotations, setCurrentAnnotations]: any = useState(undefined);
    const [scenario, setScenario]: any  = useState(undefined);
    const [timeline, setTimeline]: any  = useState(undefined);

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
        if (timelineId) {
            const newScene = scenario.scenes.find((scene: any) => {return scene.id === id});
            setScene(newScene);
        } else {
            fetchSceneData(id);
        }
    };

    const setNewScenario = () => {
        if (timeline.randomized) {
            setScenario(timeline.scenarios[Math.floor(Math.random() * timeline.scenarios.length)])
            return;
        }
        const firstScenario = timeline.scenarios.find((scenario: any) => {return scenario.uuid === timeline.start});
        setScenario(firstScenario);
    }

    const onFinishScenario = () => {
        console.log("new scenario")
        if (scenarioId) {
            setNewScene(scenario.start_scene);
            return;
        }
        setNewScenario();
    }

    const onFinishScene = (actionId: string = "") => {
        // Call onFinish when scene is ended
        if (!actionId && onFinish) { onFinish(); return; }

        // If only playing scene reload scene
        if (!actionId && !onFinish && sceneId) { 
            setNewScene(scene.id);
            return 'end';
        }

        // Find all links of current scene
        const sceneLinks: any = timelineId ? scene.links : scenario.scenes.find((targetScene: any) => targetScene.scene_id === scene.id).links;
        
        // If no action id load first scene
        if (!actionId && !onFinish && !sceneId) { 
            onFinishScenario();
            return 'end';
        }

        if (!sceneLinks.length && onFinish) { onFinish(); return 'end' }
        if (!sceneLinks.length) { return 'end' }

        const action = sceneLinks.find((link:any) => link.action_id === actionId);
        if (!action.target_id && onFinish) { onFinish(); return 'end' }
        if (!action.target_id) { onFinishScenario(); return 'end' }

        const newSceneId = scenario.scenes.find((targetScene: any) => targetScene.id === action.target_id).id;

        setNewScene(newSceneId);
        return 'resume';
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
            setNewScenario()
        }
    }, [timeline]);

    useEffect(() => {
        if(scenario) {
            let firstScene = scenario.scenes.find((scene: any) => {return scene.id === scenario.start_scene});
            setNewScene(firstScene.id);
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

    return (currentVideo && currentAnnotations) ?
        <ViewingAppAframe 
        video={currentVideo} 
        annotations={currentAnnotations} 
        onFinish={onFinishScene}/>
        : null
};

export default ViewingAppController;
