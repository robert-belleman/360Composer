import React, { useState, useEffect } from 'react';
import {find} from 'lodash';

import axios from 'axios';

import SceneplayerComponent from "./ScenePlayerComponent";

type ScenarioPlayerProps = {
  scenarioID: string,
  onFinish: () => void,
  onStart: () => void
}

const ScenarioPlayer:React.FC<ScenarioPlayerProps> = ({scenarioID, onFinish, onStart}:ScenarioPlayerProps) => {
  const [scenario, setScenario]: any = useState(undefined);
  const [currentScene, setCurrentScene]: any = useState(undefined);
  const [currentSceneID, setCurrentSceneID]: any = useState(undefined);

  useEffect(() => {
    if (scenarioID !== undefined){
      onStart();
      fetchScenario();
    }
  }, [scenarioID])

  useEffect(() => {
    if (scenario !== undefined) {
      var startscene = getStartScene(scenario);
      setCurrentScene(startscene);
    }
  }, [scenario]);

  useEffect(() => {
    if (currentScene !== undefined) {
      console.log(`Setting scene ${currentScene.scene_id}`);
      setCurrentSceneID(currentScene?.scene_id);
    }
  }, [currentScene])

  useEffect(() => {
    console.log(`setting new scene ${currentSceneID}`);
  }, [currentSceneID])

  const findScene = (sceneID: string, scenes:any[]) => find(scenes, (scene:any) => scene.id === sceneID)
  const findLinkForAction = (links:any[], actionID:string) => find(links, (link:any) => link.action_id === actionID);

  const getStartScene = (scenario:any) => {
    const startSceneID = scenario.start_scene;
    return startSceneID !== null ? findScene(startSceneID, scenario.scenes) : null;
  }
  
  const fetchScenario = () => {
    axios.get(`/api/scenario/${scenarioID}/`)
      .then((res:any) => setScenario(res.data))
      .catch((e:any) => console.log('Something went wrong while fetching scenario:', e))
  }

  const setNextScene = (sceneID:string) => {
    // @ts-ignore
    setCurrentScene(findScene(sceneID, scenario.scenes))
  }

  const onSceneStart = () => {
    // ... do something
  }

  const onSceneFinish = () => {
    // ... perhaps do some analytics here if 
    onFinish();
  }

  const onNextSceneAction = (action:any) => {
    setCurrentSceneID(undefined);
    console.log(action)
    var actionID = action.id;

    if (scenario !== null) {
      // @ts-ignore
      const link = findLinkForAction(currentScene.links, actionID);

      console.log(`Link:`);
      console.log(link);

      // we have reached the end of the scenario
      if (link === undefined || link.target_id === null) {
        onFinish();
        return
      }
      
      setNextScene(link.target_id);
    }
  }


  return (
    // Need ScenePlayer here
    <div>
      <SceneplayerComponent sceneID={currentSceneID} onNextScene={onNextSceneAction} onSceneStart={onSceneStart} />
    </div>
  )
}

export default ScenarioPlayer;
