import React from "react";
import ViewingAppController from "../ViewingAppComponents/ViewingAppController";
import { UserTestComponentProps } from "./ComponentProps";

const AframeTest: React.FC<UserTestComponentProps> = ({onFinish, active=false}) => {
    const timelineId = "af7cf3c2-9e1e-4238-9d10-d383fcfd6f25"
    const endTest = async () => {
        onFinish();
    };
    return active ? <ViewingAppController timelineId={timelineId} onFinish={endTest} /> : null;
};

export default AframeTest;