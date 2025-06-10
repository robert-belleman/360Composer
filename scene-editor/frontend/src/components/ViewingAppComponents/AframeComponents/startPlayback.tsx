import React, { useEffect, useState } from "react";
import 'aframe';
import {
    Plane,
    Entity,
    Text
} from '@belivvr/aframe-react';
import degToRad from "./DegToRad";
import {Matrix4, Vector3} from 'three';

interface StartPBProps {
    onClick: Function
}

const StartPlaybackMenu: React.FC<StartPBProps> = ({onClick}:StartPBProps) => {
    const startTitle: string = " Please look to start playback";
    const startPlaybackbOption: string = "Start playback";

    const [rotation, setRotation] = useState<{x: number, y:number, z:number}>({x:0, y:0, z:0})

    // adds handleclick to menu option.
    useEffect(() => {
        const handleClick = (e: any) => {
            onClick();
        }
        document.getElementById("startPlaybackboption")?.addEventListener("click", handleClick);

        return () => {
            document.getElementById("startPlaybackboption")?.removeEventListener("click", handleClick);
        };
    }, []);

    // Sets the current rotation of the camera when loaded.
    useEffect(() => {
        var camera:any = document.getElementById('mainCamera');
        setRotation(camera.getAttribute('rotation'));
    }, []);

    // calculates the position where the menu should be placed/
    const m = new Matrix4().makeTranslation(0,0,0);
    let position = new Vector3(-2 * Math.sin(degToRad(rotation.y)), 1.6, -2 * Math.cos(degToRad(rotation.y))).applyMatrix4(m);

    return (
        <Entity
                position={{ x: position.x, y: position.y, z: position.z }}
                rotation={{ x: 0, y: rotation.y, z: 0 }}
        >
            <Entity position={{x: 0, y: 1/4+(-1)/2/4, z: 0}}>
                <Text position={{ x: 0, y: 0, z: -0.001}} value={startTitle} align={"center"} color={"white"} width={2.5}/>
            </Entity>
            <Plane
                position={{ x: 0, y: -1/4 + ((-1)/2/4), z: 0}}
                height={0.2}
                id={'startPlaybackboption'}
                class={"intersectable"}
                animation__fusing={{property: "components.material.material.color", type: "color",
                                    startEvents: ["fusing"], from: "white", to: "grey", dur: 50}}
                animation__mouseleave={{property: "components.material.material.color", type: "color",
                                        startEvents: ["mouseleave"], to: "white", dur: 150}}
            >
                <Text position={{ x: 0, y: 0, z: +0.01}} value={startPlaybackbOption} align={"center"} color={"black"} width={2} />
            </Plane>
        </Entity>
    );
};

export default StartPlaybackMenu;