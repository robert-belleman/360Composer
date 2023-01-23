import React from "react";
import { UserTestComponentProps } from "./ComponentProps";
import ScenarioPlayer from "../../components/ScenarioPlayer";

const BabylonTest: React.FC<UserTestComponentProps> = ({onFinish, active=false}) => {
    const scenarioId = "f92411cb-9f6a-4014-a0cb-079fcfbad17a"
    const endTest = async () => {
        console.log("FINISHED");
        onFinish();
    };

    function onStart() {

    }

    return active ? <ScenarioPlayer  scenarioID={scenarioId!} onFinish={endTest} onStart={onStart}/> : null;
};

export default BabylonTest;