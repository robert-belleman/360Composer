import React, { useEffect, useState } from "react";
import 'aframe';

import {
    Plane,
    Entity,
    Text
} from '@belivvr/aframe-react';
import degToRad from "./DegToRad";

interface StartMenuProps {
    onStart: Function
}

const StartMenu: React.FC<StartMenuProps> = ({onStart}: StartMenuProps) => {
    const startTitle: string = "Welcome! Press play";
    const startOption: string = "Play";
    
    const [rotation, setRotation] = useState<{x: number, y:number, z:number}>({x:0, y:0, z:0})

    useEffect(() => {
        const handleClick = (e: any) => {
            onStart();
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

    return <Entity
                position={{ x: -2 * Math.sin(degToRad(rotation.y)), y: 1.6, z: -2 * Math.cos(degToRad(rotation.y)) }}
                rotation={{ x: 0, y: rotation.y, z: 0 }}
        >
            <Entity position={{x: 0, y: 1/4+(-1)/2/4, z: 0}}>
                <Text value={startTitle} align={"center"} color={"white"} width={2.5}/>
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
                <Text value={startOption} align={"center"} color={"black"} width={2} />
            </Plane>
        </Entity>
};

export default StartMenu;
