import axios from "axios";
import React, { useEffect, useState } from "react";
import ViewingAppAframe from "./ViewingAppAframe";

interface ViewingAppControllerProps {
    sceneId: string
    scenarioId: string
}

const ViewingAppController: React.FC<ViewingAppControllerProps> = ({sceneId, scenarioId}: ViewingAppControllerProps) => {
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
                var newScene = sceneLinks.find((link:any) => link.action_id === actionId).target_id;
                setCurrentSceneId(newScene);
                var newSceneId = scenario.scenes.find((targetScene: any) => targetScene.id === newScene).scene_id;
                fetchSceneData(newSceneId);
                return true;
            } else {
                setCurrentSceneId(scenario.start_scene);
                fetchSceneData(scenario.scenes[0].scene_id);
                return false;
            }
        } else {
            fetchSceneData(sceneId);
            return false;
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
