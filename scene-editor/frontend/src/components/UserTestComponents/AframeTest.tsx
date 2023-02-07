import React from "react";
import ViewingAppController from "../ViewingAppComponents/ViewingAppController";
import { UserTestComponentProps } from "./ComponentProps";

const AframeTest: React.FC<UserTestComponentProps> = ({onFinish, active=false}) => {
    const timelineId = "caf55a86-8a2b-4483-a936-1660373bff4b"
    const endTest = async () => {
        onFinish();
    };
    return active ? <ViewingAppController sceneId="" scenarioId="" timelineId={timelineId} onFinish={endTest} /> : null;
};

export default AframeTest;