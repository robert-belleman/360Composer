import React from "react";
import { UserTestComponentProps } from "./ComponentProps";
import ScenarioPlayerAframe from "../../components/ScenarioPlayerAframe";

const AframeTest: React.FC<UserTestComponentProps> = ({onFinish, userInput, setUserInput}) => {
    const scenarioId = "007dd947-8c99-42ca-ac63-59573c4238f5"
    const endTest = async () => {
        onFinish();
    };

    function onStart() {

    }

    return (
        <ScenarioPlayerAframe  scenarioID={scenarioId!} onFinish={endTest} onStart={onStart}/>
    );
};

export default AframeTest;