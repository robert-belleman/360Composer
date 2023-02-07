import React from "react";
import ViewingAppController from "../../components/ViewingAppComponents/ViewingAppController";

const ViewingAppTest: React.FC = () => {
    const sceneId = "bf53a16b-5afd-451d-9050-816c9c4544c1";
    return sceneId ? <ViewingAppController 
                        sceneId={""} 
                        scenarioId={"f92411cb-9f6a-4014-a0cb-079fcfbad17a"}
                        timelineId=""
                        onFinish={() => console.log("Finished")}/> : <></>;
};

export default ViewingAppTest;
