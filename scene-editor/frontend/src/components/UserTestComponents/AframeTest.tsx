import React from "react";
import ViewingAppController from "../ViewingAppComponents/ViewingAppController";
import { UserTestComponentProps } from "./ComponentProps";

const AframeTest: React.FC<UserTestComponentProps> = ({onFinish, active=false}) => {
    const timelineId = "d9fc1061-f274-4794-a5ea-c518dd01917c"
    const endTest = async () => {
        onFinish();
    };
    return active ? <ViewingAppController timelineId={timelineId} onFinish={endTest} /> : null;
};

export default AframeTest;