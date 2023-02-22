// @ts-nocheck
import React,  { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";

import {
    AbstractMesh,
    TransformNode,
    SceneLoader,
    Nullable,
    ISceneLoaderPlugin,
    ISceneLoaderPluginAsync,
  } from "@babylonjs/core"
  import "@babylonjs/loaders"

import { FreeCamera, Vector3, HemisphericLight} from '@babylonjs/core';
import ScenePlayerComponent from "../../components/ScenePlayerComponent";

import "./ScenePlayer.scss"


const ScenePlayer: React.FC = () => {
    const [objects, setObjects] = useState([]);
    const [fetch, setFetch] = useState(true);
    const { scene_id }: EditorPageParams = useParams();

    const fetchObjects = async () => {
        axios
            .get(`/api/scenes/` + scene_id + `/objects`, {})
            .then((res) => {setObjects(res.data); console.log(res); loadMeshes(res.data);} )
            .catch(() => {
                // setError(true);
            });
    };

    // use this to fetch the projects assets
    useEffect(() => {
        fetchObjects();
    }, [scene_id]);

    let currentScene = undefined;

    const loadMeshes = (objects) => {
        // console.log("Startig object mapping");
        if (currentScene !== undefined) {
            console.log("starting mapping of objects")
            
            objects.map((object: any) => {
                var pivot = new TransformNode("root");

                let loader: Nullable<ISceneLoaderPlugin | ISceneLoaderPluginAsync> = SceneLoader.ImportMesh(
                    undefined,
                    `/api/asset/`,
                    object.asset_id + `.glb`,
                    currentScene,
                    ((meshes) => {

                        // set rootmesh for the model with object ID as name
                        let rootMesh = new AbstractMesh(object.id);
                        rootMesh.alwaysSelectAsActiveMesh = true

                        meshes.forEach((mesh) => {
                            // set the parent only if the mesh doesn't already have a parent to preserve mesh hierarchy
                            if (!mesh.parent) {
                                mesh.parent = rootMesh
                            }
                        })

                        // apply stored transformations to rootMesh
                        rootMesh.position = new Vector3(object.x_pos, object.y_pos, object.z_pos);
                        rootMesh.rotation = new Vector3(object.x_rotation, object.y_rotation, object.z_rotation);
                        rootMesh.scaling = new Vector3(object.x_scale, object.y_scale, object.z_scale);
                    }),

                );
        });
       } else {
           console.log("Current scene is undefined")
       }
    }

    const onSceneReady = (scene) => {
        currentScene = scene;
        // This creates and positions a free camera (non-mesh)
        var camera = new FreeCamera("camera1", new Vector3(0, 4, 3), scene);
        // This targets the camera to scene origin
        camera.setTarget(new Vector3(0, 0, 0));
        camera.speed *= 0.2;
        const canvas = scene.getEngine().getRenderingCanvas();
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 4, 0), scene);

        light.intensity = 1.0;

        scene.createDefaultVRExperience();
        
    }

    /**
     * Will run on every frame render.  We are spinning the box on y-axis.
     */
    const onRender = scene => {}
    
    return (
        <ScenePlayerComponent onNextScene={(data) => {console.log(data)}} sceneID={scene_id} id='a' />
    );
};

export default ScenePlayer;