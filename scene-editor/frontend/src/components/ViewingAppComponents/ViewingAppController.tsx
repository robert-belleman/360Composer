/*  ViewingAppController receives one of three ids and manages their scenes. It passes down
 *  the video and annotation data of the current scene to the viewing app implementation.
 *  The implementation components then communicates the actions of the user back to the controller.
 */
import axios from "axios";
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

    // Request the scene data of the given id
    const fetchSceneData = async (id: string) => {
        axios
          .get(`/api/scenes/${id}/`)
          .then((res) => {setScene(res.data)})
          .catch((e) => {
            console.log(e);
          })
    };

    // Request the video data of the given id
    const fetchVideo = async (id: string) => {
        await axios.get(`/api/asset/${id}`)
             .then((res: any) => {setCurrentVideo(res.data)})
             .catch((e:any) => console.log('Something went wrong while fetching video:', e));
    };

    // Request the annotation data of the given id
    const fetchAnnotations = async (id: string) => {
        await axios.get(`/api/scenes/${id}/annotations`)
        .then((res:any) => handleAnnotationData(res.data))
        .catch((e:any) => console.log('Something went wrong while fetching annotations:', e));
    };

    // Request the scenario data of the given id
    const fetchScenarioData = async (id: string) => {
        await axios.get(`/api/scenario/${id}/`)
        .then((res:any) => setScenario(res.data))
        .catch((e:any) => console.log('Something went wrong while fetching scenario:', e));
    };

    // Request the timeline data of the given id
    const fetchTimelineData = async (id: string) => {
        await axios.get(`/api/timeline/${id}/export`)
        .then((res:any) => setTimeline(res.data[0]))
        .catch((e:any) => console.log('Something went wrong while fetching timeline:', e));
    };

    const handleAnnotationData = (data: any) => {
        // If a scene does not have any annotation data. Set annotation to empty array/
        data.length ? setCurrentAnnotations(data[0]) : setCurrentAnnotations([]);
    };

    // Sets a scene given an id
    const setNewScene = (id: string) => {
        // timeline and scenario data are structured differently.
        if (timelineId) {
            const newScene = scenario.scenes.find((scene: any) => {return scene.id === id});
            setScene(newScene);
        } else {
            fetchSceneData(id);
        }
    };

    // Sets a new scenario. Is only called when there is a timeline id.
    // TODO: Set next scenario in order in stead of starting over.
    const setNewScenario = () => {
        // Randomly select the next scenario.
        if (timeline.randomized) {
            const newScenario = timeline.scenarios[Math.floor(Math.random() * timeline.scenarios.length)]
            setScenario(newScenario)
            if(scenario) {
                const firstScene = newScenario.scenes.find((scene: any) => {return scene.id === newScenario.start_scene});
                setNewScene(scenarioId ? firstScene.scene_id : firstScene.id);
             }
            return;
        }
        const firstScenario = timeline.scenarios.find((scenario: any) => {return scenario.uuid === timeline.start});
        setScenario(firstScenario);
    }

    const onFinishScenario = () => {
        // Replay current scenario.
        if (scenarioId) {
            const firstScene = scenario.scenes.find((scene: any) => {return scene.id === scenario.start_scene});
            setNewScene(firstScene.scene_id);
            return;
        }
        setNewScenario();
    }

    // Is called by the implementation component when an action is taken
    const onFinishScene = (actionId: string = "", callback: Function) => {
        // Call onFinish when scene is ended
        if (!actionId && onFinish) {onFinish(); return; }
        // If only playing scene reload scene
        if (!onFinish && sceneId) {
            setNewScene(scene.id);
            callback('end');
            return;
        }

        // Find all links of current scene
        const sceneLinks: any = timelineId ? scene.links : scenario.scenes.find((targetScene: any) => targetScene.scene_id === scene.id).links;

        // If no action id load first scene
        if (!actionId && !onFinish && !sceneId) { onFinishScenario(); callback('end'); return; }

        // If the current scene has no further actions, finish or end the scene depending on a onfinish function.
        if (!sceneLinks.length && onFinish) { callback('exit'); onFinish(); return; }
        if (!sceneLinks.length) { callback('end'); return; }

        // Find the given action data.
        const action = sceneLinks.find((link:any) => link.action_id === actionId);

        // If the action has no target, finish or end the scene depending on a onfinish function.
        if (!action.target_id && onFinish) { callback('exit'); onFinish(); return; }
        if (!action.target_id) { callback('end'); onFinishScenario(); return; }

        // Find the next scene given the action target.
        const newScene = scenario.scenes.find((targetScene: any) => targetScene.id === action.target_id);
        setNewScene(scenarioId ? newScene.scene_id : newScene.id);
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
            setNewScenario()
        }
    }, [timeline]);

    useEffect(() => {
        if(scenario) {
            const firstScene = scenario.scenes.find((scene: any) => {return scene.id === scenario.start_scene});
            setNewScene(scenarioId ? firstScene.scene_id : firstScene.id);
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

    // Only output viewingapp when video and annotation data are loaded.
    return (currentVideo && currentAnnotations) ?
        <ViewingAppAframe
        video={currentVideo}
        annotations={currentAnnotations}
        onFinish={onFinishScene}/>
        : null
};

export default ViewingAppController;
