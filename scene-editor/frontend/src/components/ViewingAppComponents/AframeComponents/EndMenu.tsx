import React, { useEffect, useState } from "react";
import 'aframe';

import {
    Plane,
    Entity,
    Text
} from '@belivvr/aframe-react';
import degToRad from "./DegToRad";
import { Matrix4, Vector3 } from "three";

interface EndMenuProps {
    onEnd: Function
}

const EndMenu: React.FC<EndMenuProps> = ({onEnd}: EndMenuProps) => {
    const endTitle: string = "Thanks for playing";
    const endOption: string = "Play again";
    
    const [rotation, setRotation] = useState<{x: number, y:number, z:number}>({x:0, y:0, z:0})

    useEffect(() => {
        const handleClick = (e: any) => {
            onEnd();
        }

        document.getElementById("startoption")?.addEventListener("click", handleClick);

        return () => {
            document.getElementById("startoption")?.removeEventListener("click", handleClick);
        };
    }, []);

    useEffect(() => {
        var camera:any = document.getElementById('mainCamera');
        setRotation(camera.getAttribute('rotation'));
    }, []);

    const m = new Matrix4().makeTranslation(0,0,0);
    let position = new Vector3(-2 * Math.sin(degToRad(rotation.y)), 1.6, -2 * Math.cos(degToRad(rotation.y))).applyMatrix4(m);
    
    return (
        <Entity
                position={{ x: position.x, y: position.y, z: position.z }}
            rotation={{ x: 0, y: rotation.y, z: 0 }}
        >
            <Entity position={{x: 0, y: 1/4+(-1)/2/4, z: 0}}>
                <Text value={endTitle} align={"center"} color={"white"} width={2.5}/>
            </Entity>
            <Plane 
                position={{ x: 0, y: -1/4 + ((-1)/2/4), z: 0}}
                height={0.2}
                id={'startoption'}
                class={"intersectable"}
                animation__fusing={{property: "components.material.material.color", type: "color",
                                    startEvents: ["fusing"], from: "white", to: "grey", dur: 50}}
                animation__mouseleave={{property: "components.material.material.color", type: "color",
                                        startEvents: ["mouseleave"], to: "white", dur: 150}}
            >
                <Text value={endOption} align={"center"} color={"black"} width={2} />
            </Plane>
        </Entity>
    );
};

export default EndMenu;
