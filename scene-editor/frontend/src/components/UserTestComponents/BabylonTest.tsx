import React from "react";
import { UserTestComponentProps } from "./ComponentProps";
import ScenarioPlayer from "../../components/ScenarioPlayer";

const BabylonTest: React.FC<UserTestComponentProps> = ({onFinish, userInput, setUserInput}) => {
    const scenarioId = "oifehwoihewughf"
    const endTest = async () => {
        onFinish();
    };

    function onStart() {

    }

    return (
        <ScenarioPlayer  scenarioID={scenarioId!} onFinish={endTest} onStart={onStart}/>
    );
};

export default BabylonTest;