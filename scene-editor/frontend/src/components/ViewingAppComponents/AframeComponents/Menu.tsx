import React, { useEffect, useState } from "react";
import 'aframe';

import {
    Plane,
    Entity,
    Text
} from '@belivvr/aframe-react';
import degToRad from "./DegToRad";
import Feedback from "./FeedBack";
import { Matrix4, Vector3 } from "three";

interface MenuProps {
    annotations: any
    enabled: boolean
    onOption: Function
}

const Menu: React.FC<MenuProps> = ({annotations, enabled, onOption}: MenuProps) => {
    const [rotation, setRotation] = useState<{x: number, y:number, z:number}>({x:0, y:0, z:0})
    const [feedback, setFeedback] = useState({id: "", text: ""});

    const handleContinue = (id: string) => {
        setFeedback({id: "", text: ""});
        onOption(id);
    }

    useEffect(() => {
        const handleClick = (e: any) => {
            const targetOption = annotations.options.find((option: any) => {return option.id === e.target.id});
            if (targetOption.feedback) {
                setFeedback({id: targetOption.id, text: targetOption.feedback}); 
                return;
            }
            onOption(e.target.id);
        }
        if (annotations && enabled) {
            annotations.options.forEach((option: any) => {
                document.getElementById(option.id)?.addEventListener("click", handleClick);
            });
    
            return () => {
                annotations.options.forEach((option: any) => {
                    document.getElementById(option.id)?.removeEventListener("click", handleClick);
                });
            };
        }
    }, [enabled, annotations]);

    useEffect(() => {
        var camera:any = document.getElementById('mainCamera');
        setRotation(camera.getAttribute('rotation'));
    }, [enabled]);

    const m = new Matrix4().makeTranslation(0,0,0);
    let position = new Vector3(-2 * Math.sin(degToRad(rotation.y)), 1.6, -2 * Math.cos(degToRad(rotation.y))).applyMatrix4(m);
    
    return (
            <Entity
                id="menuEntity"
                position={{ x: position.x, y: position.y, z: position.z }}
                rotation={{ x: 0, y: rotation.y, z: 0 }}
                visible={enabled}
            >
                <Entity position={{x: 0, y: 1/4+(annotations.options.length-2)/2/4, z: 0}}>
                    <Text value={annotations.text} align={"center"} color={"white"} width={2.5}/>
                </Entity>
                { annotations.options.map((option: any, index: number) => {
                        return (
                            <Plane 
                                position={{ x: 0, y: -index/4 + ((annotations.options.length-2)/2/4), z: 0}}
                                height={0.2}
                                key={index}
                                id={option.id}
                                class={"intersectable"}
                                animation__fusing={{property: "components.material.material.color", type: "color",
                                                    startEvents: ["fusing"], from: "white", to: "grey", dur: 50}}
                                animation__mouseleave={{property: "components.material.material.color", type: "color",
                                                        startEvents: ["mouseleave"], to: "white", dur: 150}}
                                visible={!feedback.text ? true : false}
                            >
                                <Text value={option.text} align={"center"} color={"black"} width={2} />
                            </Plane>
                        );
                    })
                }
                {feedback.text ? <Feedback id={feedback.id} text={feedback.text} onContinue={handleContinue} />: null}

            </Entity>
    );
};

export default Menu;
