/*  ViewingAppController receives one of three ids and manages their scenes. It passes down
 *  the video and annotation data of the current scene to the viewing app implementation.
 *  The implementation components then communicates the actions of the user back to the controller.
 */
import React, { useEffect, useState } from "react";
import ViewingAppAframe from "./ViewingAppAframe";
import { api } from "../../util/api";

interface ViewingAppControllerProps {
    sceneId?: string,
    scenarioId?: string,
    timelineId?: string,
    offline?: boolean,
    onFinish?: Function
}

const ViewingAppController: React.FC<ViewingAppControllerProps> = ({sceneId="", scenarioId="", timelineId="", offline=false, onFinish}: ViewingAppControllerProps) => {
    const [scene, setScene]: any = useState(undefined);
    const [currentVideo, setCurrentVideo]: any = useState(undefined);
    const [currentAnnotations, setCurrentAnnotations]: any = useState(undefined);
    const [scenario, setScenario]: any = useState(undefined);
    const [timeline, setTimeline]: any = useState(undefined);

    // Request the scene data of the given id
    const fetchSceneData = async (id: string) => {
        api
          .get(`/api/scenes/${id}/`)
          .then((res) => {setScene(res.data);})
          .catch((e) => {
            console.log(e);
          })
    };

    // Request the video data of the given id
    const fetchVideo = async (id: string) => {
        await api.get(`/api/asset/${id}${offline ? '?cache=true' : ''}`)
            .then((res: any) => {setCurrentVideo(res.data);})
            .catch((e:any) => console.log('Something went wrong while fetching video:', e));
    };

    // Request the annotation data of the given id
    const fetchAnnotations = async (id: string) => {
        await api.get(`/api/scenes/${id}/annotations`)
            .then((res:any) => {handleAnnotationData(res.data);})
            .catch((e:any) => console.log('Something went wrong while fetching annotations:', e));
    };

    // Request the scenario data of the given id
    const fetchScenarioData = async (id: string) => {
        await api.get(`/api/scenario/${id}/`)
            .then((res:any) => {setScenario(res.data);})
            .catch((e:any) => console.log('Something went wrong while fetching scenario:', e));
    };

    // Request the timeline data of the given id
    const fetchTimelineData = async (id: string) => {
        await api.get(`/api/timeline/${id}/export${offline ? '?cache=true' : ''}`)
            .then((res:any) => {setTimeline(res.data[0]);})
            .catch((e:any) => console.log('Something went wrong while fetching timeline:', e));
    };

    const handleAnnotationData = (data: any) => {
        // If a scene does not have any annotation data. Set annotation to empty array/
        data.length ? setCurrentAnnotations(data[0]) : setCurrentAnnotations([]);
    };

    // Sets a scene given an id
    const setNewScene = (id: string) => {
        console.log('setNewScene');
        // timeline and scenario data are structured differently.
        if (timelineId) {
            const newScene = scenario.scenes.find((scene: any) => {return scene.id === id});
            console.log("setting next scene", newScene);
            setScene(newScene);
        } else {
            fetchSceneData(id);
        }
    };

    // Sets a new scenario. Is only called when there is a timeline id.
    const setNewScenario = () => {
        console.log('setNewScenario');
        console.log(timeline.randomized);
        // Randomly select the next scenario.
        if (timeline.randomized) {
            const newScenario = timeline.scenarios[Math.floor(Math.random() * timeline.scenarios.length)];
            setScenario(newScenario);
            if (scenario) {
                const firstScene = newScenario.scenes.find((scene: any) => {return scene.id === newScenario.start_scene});
                setNewScene(scenarioId ? firstScene.scene_id : firstScene.id);
            }
            return;
        }
        // Select the next scenario in order, or loop to begin scenario if end is reached.
        let nextScenario = scenario ?
            timeline.scenarios.find((timelineScenario: any) => {return timelineScenario.uuid === scenario.next_scenario}) :
            timeline.scenarios.find((timelineScenario: any) => {return timelineScenario.uuid === timeline.start});
        if (!nextScenario) {
            nextScenario = timeline.scenarios.find((timelineScenario: any) => {return timelineScenario.uuid === timeline.start});
        }
        console.log("setting next scenario", nextScenario);
        setScenario(nextScenario);
        // if (scenario) {
        //     console.log('setting first scene');
        //     const firstScene = nextScenario.scenes.find((scene: any) => {return scene.id === nextScenario.start_scene});
        //     setNewScene(scenarioId ? firstScene.scene_id : firstScene.id);
        // }
        // const firstScenario = timeline.scenarios.find((scenario: any) => {return scenario.uuid === timeline.start});
        // setScenario(firstScenario);
    }

    const onFinishScenario = () => {
        console.log('onFinishScenario');
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
        console.log('onFinishScene');
        console.log('actionId is', actionId);

        if (actionId === "replay") {
            if (timelineId || scenarioId) {
                onFinishScenario();
            } else if (sceneId) {
                setNewScene(scene.id);
            }
            return;
        }

        // Call onFinish when scene is ended
        if (!actionId && onFinish) {onFinish(); return; }
        // If only playing scene reload scene
        if (!onFinish && sceneId) {
            callback('end');
            return;
        }

        // Find all links of current scene
        const sceneLinks: any = timelineId ? scene.links : scenario.scenes.find((targetScene: any) => targetScene.scene_id === scene.id).links;
        console.log(sceneLinks);

        // If no action id load first scene
        if (!actionId && !onFinish && !sceneId) {
            if (scenarioId) {
                console.log('end2'); callback('end');
            } else if (timelineId) {
                const nextScenario = scenario.next_scenario;
                if (nextScenario) {
                    onFinishScenario();
                } else {
                    console.log('end2'); callback('end');
                }
            }
            return;
        }

        // If the current scene has no further actions, finish or end the scene depending on a onfinish function.
        if (!sceneLinks.length && onFinish) { callback('exit'); console.log('exit1'); onFinish(); return; }
        if (!sceneLinks.length) { callback('end'); console.log('end3'); return; }

        // Find the given action data.
        const action = sceneLinks.find((link:any) => link.action_id === actionId);
        console.log(action);

        // If the action has no target, finish or end the scene depending on a onfinish function.
        if (!action.target_id && onFinish) { callback('exit'); console.log('exit2'); onFinish(); return; }
        if (!action.target_id) { callback('end'); console.log('end4'); onFinishScenario(); return; }

        // Find the next scene given the action target.
        console.log(scenario.scenes);
        console.log(action.target_id);
        const newScene = scenario.scenes.find((targetScene: any) => targetScene.id === action.target_id);
        setNewScene(scenarioId ? newScene.scene_id : newScene.id);
    };

    useEffect(() => {
        if (sceneId) {
            fetchSceneData(sceneId);
        }
    }, [sceneId]);

    useEffect(() => {
        if (scenarioId) {
            fetchScenarioData(scenarioId);
        }
    }, [scenarioId]);

    useEffect(() => {
        if (timelineId) {
            fetchTimelineData(timelineId);
        }
    }, [timelineId]);

    useEffect(() => {
        console.log('timeline is', timeline);
        if (timeline) {
            setNewScenario();
        }
    }, [timeline]);

    useEffect(() => {
        if (scenario) {
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
        offline={offline}
        annotations={currentAnnotations}
        onFinish={onFinishScene}/>
        : null;
};

export default ViewingAppController;
