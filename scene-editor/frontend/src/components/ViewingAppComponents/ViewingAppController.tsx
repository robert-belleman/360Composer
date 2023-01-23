import axios from "axios";
import React, { useEffect, useState } from "react";
import ViewingAppAframe from "./ViewingAppAframe";

interface ViewingAppControllerProps {
    sceneId: string,
    scenarioId: string,
    onFinish: Function
}

const ViewingAppController: React.FC<ViewingAppControllerProps> = ({sceneId, scenarioId, onFinish=()=>{}}: ViewingAppControllerProps) => {
    const [ready, setReady] = useState<boolean>(false);
    const [scene, setScene]: any  = useState(undefined);
    const [scenario, setScenario]: any  = useState(undefined);
    const [currentSceneId, setCurrentSceneId] = useState<string>("");

    const fetchSceneData = async (id: string) => {
        axios
          .get(`/api/scenes/${id}/`)
          .then((res) => {setScene(res.data)})
          .catch((e) => {
            console.log(e);
          })
    };

    const fetchScenarioData = async () => {
        await axios.get(`/api/scenario/${scenarioId}/`)
             .then((res:any) => setScenario(res.data))
             .catch((e:any) => console.log('Something went wrong while fetching scenario:', e));
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
            fetchScenarioData();
        }
    }, [scenarioId]);

    useEffect(() => {
        if(scenario) {
            setCurrentSceneId(scenario.start_scene);
            fetchSceneData(scenario.scenes[0].scene_id);
        }
    }, [scenario]);

    return scene ? <ViewingAppAframe scene={scene} onFinish={onFinishScene}/> : <></>;
};

export default ViewingAppController;
