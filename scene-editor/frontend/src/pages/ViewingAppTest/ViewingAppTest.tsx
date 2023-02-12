import React from "react";
import ViewingAppController from "../../components/ViewingAppComponents/ViewingAppController";

const ViewingAppTest: React.FC = () => {
    const sceneId = "bf53a16b-5afd-451d-9050-816c9c4544c1";
    const scenarioId = "2a4424e3-4ecf-4f83-82fc-8d4ef77d0a18"
    const timelineId = "caf55a86-8a2b-4483-a936-1660373bff4b"
    return sceneId ? <ViewingAppController 
                        timelineId={timelineId}
                        // scenarioId={scenarioId}
                        onFinish={() => console.log("Finished")}/> : <></>;
};

export default ViewingAppTest;
