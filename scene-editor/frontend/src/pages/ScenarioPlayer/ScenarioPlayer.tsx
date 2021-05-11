// @ts-nocheck
import React,  { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

import ScenarioPlayer from "../../components/ScenarioPlayer";


const ScenePlayer: React.FC = () => {
    const [objects, setObjects] = useState([]);
    const [fetch, setFetch] = useState(true);
    const { scenario_id }: EditorPageParams = useParams();

    useEffect(() => {
        console.log(`Scenario ID: ${scenario_id}`);
    }, [scenario_id])

    function onFinish() {

    }

    function onStart() {

    }
    
    return (
        <ScenarioPlayer  scenarioID={scenario_id} onFinish={onFinish} onStart={onStart} />
    );
};

export default ScenePlayer;
