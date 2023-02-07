import React, { useEffect, useRef, useState } from "react";
import 'aframe';
import THREE from 'three';

import {
    Plane,
    Entity,
    Text
} from '@belivvr/aframe-react';
import degToRad from "./DegToRad";

interface MenuProps {
    annotations: any
    enabled: boolean
    onOption: Function
}

const Menu: React.FC<MenuProps> = ({annotations, enabled, onOption}: MenuProps) => {
    const [rotation, setRotation] = useState<{x: number, y:number, z:number}>({x:0, y:0, z:0})

    useEffect(() => {
        const handleClick = (e: any) => {
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

    return (enabled && annotations) ? 
            <Entity
                id="menuEntity"
                position={{ x: -2 * Math.sin(degToRad(rotation.y)), y: 1.6, z: -2 * Math.cos(degToRad(rotation.y)) }}
                rotation={{ x: 0, y: rotation.y, z: 0 }}
            >
                <Entity position={{x: 0, y: 1/4+(annotations.options.length-2)/2/4, z: 0}}>
                    <Text value={annotations.text} align={"center"} color={"white"} width={2.5}/>
                </Entity>
                {annotations.options.map((option: any, index: number) => {
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
                        >
                            <Text value={option.text} align={"center"} color={"black"} width={2} />
                        </Plane>
                    );
                })}
            </Entity>
        : 
            null;
};

export default Menu;
