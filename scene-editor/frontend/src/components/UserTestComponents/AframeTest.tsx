import React from "react";
import ViewingAppController from "../ViewingAppComponents/ViewingAppController";
import { UserTestComponentProps } from "./ComponentProps";

const AframeTest: React.FC<UserTestComponentProps> = ({onFinish, active=false}) => {
    const scenarioId = "f92411cb-9f6a-4014-a0cb-079fcfbad17a"
    const endTest = async () => {
        onFinish();
    };
    return active ? <ViewingAppController sceneId="" scenarioId={scenarioId!} onFinish={endTest} /> : null;
};

export default AframeTest;