import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {differenceWith, isEmpty, isEqual} from 'lodash'

import ScenarioPlayer from './ScenarioPlayer';

type TimelinePlayerProps = {
  timelineID: string
}

const TimelinePlayer:React.FC<TimelinePlayerProps> = ({timelineID}:TimelinePlayerProps) => {
  const [scenarios, setScenarios] = useState([] as any[]);

  const [scenariosPlayed, setScenariosPlayed] = useState([] as string[]);
  const [currentScenario, setCurrentScenario] = useState(undefined)

  const setNextScenario = () => {
    const hasPlayedAll =
      isEmpty(differenceWith(scenariosPlayed, scenarios.map((scenario:any) => scenario.id), isEqual))

    if (hasPlayedAll) {
      // ... back to main menu
      return
    };

    setCurrentScenario(pickRandomScenario());
  }

  const pickRandomScenario = () => {
    const scenariosToPlay = scenarios.filter((scenario:any) => scenariosPlayed.indexOf(scenario.id) !== -1);
    return scenariosToPlay[Math.floor(Math.random() * scenariosToPlay.length)];
  }
  
  const fetchScenarios = () => {
    axios.get(`/api/timeline/${timelineID}/scenarios`)
      .then((res:any) => setScenarios(res.data))
      .catch((e:any) => console.group())
  }

  const onFinish = () => {
    // ... Probably want to do some analytics here.

    // @ts-ignore
    setScenariosPlayed([...scenariosPlayed, currentScenario.id]);
  }

  const onStart = () => {
    // const payload = {
    //   timestamp,
    //   customerID,
    //   category,
    //   action,
    //   label,
    //   value,
    //   timelineID: timelineID === null || timelineID === undefined ? '' : timelineID,
    //   scenarioID: scenarioID === null || scenarioID === undefined ? '' : scenarioID,
    //   sceneID: sceneID === null || sceneID === undefined ? '' : sceneID
    // };

    // axios.post(`/api/analytics/legacy`, payload );
  }

  const onAnnotationPresent = () => {

  }

  useEffect(() => {
    fetchScenarios()
  }, [])

  useEffect(() => {
    setCurrentScenario(pickRandomScenario())
  }, [scenarios])

  // Handles the settin of the next scenario once a scenario is finished playing
  useEffect(setNextScenario, [scenariosPlayed])

  return (
    // @ts-ignore
    <ScenarioPlayer scenarioID={currentScenario.scenario_id} 
      onFinish={onFinish} 
      // onAnnotationPresent={onFinish}
      onStart={onStart} />
  )
}

export default TimelinePlayer;
