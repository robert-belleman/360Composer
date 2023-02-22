import React, { useEffect } from 'react';
import { Plane, Text } from '@belivvr/aframe-react';

interface FeedbackProps {
    id: string
    text: string
    onContinue: Function
}

const Feedback: React.FC<FeedbackProps> = ({id, text, onContinue}: FeedbackProps) => {
    useEffect(() => {
        const handleClick = (e: any) => {
            onContinue(id);
        }
        if (id && text) {
            document.getElementById("continueFeedbackButton")?.addEventListener("click", handleClick);
            return () => document.getElementById("continueFeedbackButton")?.removeEventListener("click", handleClick);
        }
    }, [id, text]);

    return (<>
        <Plane 
            position={{ x: 0, y: 0, z: 0}}
            height={0.6}
            visible={text ? true : false}
        >
            <Text value={text} align={"center"} color={"black"} width={1.4} />
        </Plane>
        <Plane 
            position={{ x: 0, y: -0.45, z: 0}}
            height={0.2}
            id={"continueFeedbackButton"}
            class={"intersectable"}
            animation__fusing={{property: "components.material.material.color", type: "color",
            startEvents: ["fusing"], from: "white", to: "grey", dur: 50}}
            animation__mouseleave={{property: "components.material.material.color", type: "color",
            startEvents: ["mouseleave"], to: "white", dur: 150}}
            visible={text ? true : false}
        >
            <Text value={"continue"} align={"center"} color={"black"} width={2} />
        </Plane>
    </>);
}

export default Feedback