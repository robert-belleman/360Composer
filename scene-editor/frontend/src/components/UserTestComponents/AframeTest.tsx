import React from "react";
import ViewingAppController from "../ViewingAppComponents/ViewingAppController";
import { UserTestComponentProps } from "./ComponentProps";

const AframeTest: React.FC<UserTestComponentProps> = ({onFinish, active=false}) => {
    const timelineId = "f010c252-6921-48f2-8c5d-a418477df268"
    const endTest = async () => {
        onFinish();
    };
    return active ? <ViewingAppController timelineId={timelineId} onFinish={endTest} /> : null;
};

export default AframeTest;