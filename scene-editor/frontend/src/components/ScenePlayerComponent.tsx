import React, {useEffect, useRef, useState, MutableRefObject} from "react";
import {isMobile} from 'react-device-detect';

import {
  ActionManager,
  Vector3,
  SetValueAction,
  AbstractMesh,
  SceneLoader,
  VideoDome,
  InterpolateValueAction,
  StandardMaterial,
  HemisphericLight,
  ExecuteCodeAction,
  Quaternion,
  TransformNode,
  MeshBuilder,
  Color3,
  DeviceOrientationCamera,
  VRDeviceOrientationFreeCamera,
  FreeCameraDeviceOrientationInput,
  Mesh,
  RayHelper, 
  VRExperienceHelper,
  Ray
} from "@babylonjs/core"
import {
  GUI3DManager,
  Rectangle,
  HolographicButton,
  StackPanel3D,
  AdvancedDynamicTexture,
  TextBlock,
  Ellipse
} from "@babylonjs/gui"
import "@babylonjs/loaders"

import axios from "axios";

import SceneComponent from "./SceneComponent";
import "./ScenePlayerComponent.scss";


type ScenePlayerProps = {
  sceneID: string;
  onSceneStart: any;
  onNextScene: any; // next scene callback
};

const ScenePlayerComponent: React.FC<ScenePlayerProps> = ({sceneID, onSceneStart, onNextScene}: ScenePlayerProps) => {

    // vrHelper to enable vr experience
    var vrHelper: any = useRef(null);

    // VR scene
    var vrScene: any = useRef(null);

    // used for ray hit detection
    var helper : RayHelper;

    // mesh selection variables
    var currentMeshSelected: Mesh;
    var objectSelecting: boolean;
    var objectSelected: boolean;

    // array to store current button cubes
    var buttons: MutableRefObject<any[]> = useRef([]);
    var buttonTexts: MutableRefObject<any[]> = useRef([]);
    var buttonActions: MutableRefObject<any[]> = useRef([]);

    // text on screen
    var drawnText: any;

    // target reticle for selecting stuff
    var target: Mesh;

    // videoDome that contains the video
    var videoDome: any = useRef(undefined);

    const [scene, setScene]: any = useState(undefined);
    const [video, setVideo]: any = useState(undefined);
    const [objects, setObjects] = useState([]);
    const [annotations, setAnnotations] = useState([]);

    // video variabels
    var [currentVideoTime, setCurrentVideoTime]: any = useState(0);
    const [currentVideoLength, setCurrentVideoLength]: any = useState(0);

    // contains the current annotation to show
    const [activeAnnotation, setActiveAnnotation]: any = useState(undefined);

    // contains the root mesh of all meshes currently in the scene
    const [sceneRootMeshes, setSceneRootMeshes]: any = useState([]);

    // scene settings
    const [lightIntensity, setLightIntensity]: any = useState(0);
    const [sceneLight, setSceneLight]: any = useState(0);

    const fetchSceneData = async () => {
        axios
          .get(`/api/scenes/${sceneID}/`)
          .then((res) => {setScene(res.data)})
          .catch((e) => {
            console.log(e);
          })
    };

    const fetchVideo = async () => {
      axios.get(`/api/asset/${scene.video_id}`)
        .then((res: any) => {setVideo(res.data); onSceneStart();})
        .catch((e) => console.log(e))
    }
    /* 
     * Fetches the objects that are stored in the database for this scene
     */
    const fetchSceneObjects = async () => {
      axios
          .get(`/api/scenes/${sceneID}/objects`, {})
          .then((res) => {setObjects(res.data); console.log(res); loadMeshes(res.data);} )
          .catch(() => {
              console.log("Could not load assets")
          });
    };

    const fetchAnnotations = async () => {
      axios.get(`/api/scenes/${sceneID}/annotations`)
        .then((res:any) => res.data).then(setAnnotations)
        .catch((e) => console.log(e))
    }

    useEffect(() => {
      console.log(`Loading scene ${sceneID}`);
      if( sceneID !== undefined) {
        fetchSceneData();
        fetchAnnotations();
        fetchSceneObjects();
      }

    }, [sceneID]);

    useEffect(() => {
      if( vrScene.current !== undefined) {
        // fetchSceneObjects();
      }
    }, [vrScene]);

    useEffect(() =>{
      if (scene !== undefined) {
        fetchVideo();
      }
    }, [scene])

    // loads video when we have fetched the video data
    useEffect(() => {
      if (video !== undefined){
        loadVideo();
      }

    }, [video]);

    useEffect(() => {
      // filter annotations that are later in the video than current timestamp
      const filteredAnnotations = annotations.filter((obj: any) => {
        return obj.timestamp <= currentVideoTime;
      })
      const active: any = filteredAnnotations[filteredAnnotations.length - 1];
      if (active !== activeAnnotation) {
        setActiveAnnotation(active);
      }
    }, [currentVideoTime]);

    // render new annotation
    useEffect(() => {
      if (activeAnnotation !== undefined)
        renderAnnotation();

    }, [activeAnnotation])

    useEffect(() => {

    }, [currentVideoLength]);

    // retrieve saved meshes for scene from the database
    const loadMeshes = async (objects: any) => {
      if (vrScene.current !== undefined) {
          objects.map((object: any) => {
            // only load objects that are not yet in the list
              SceneLoader.ImportMesh(
                  undefined,
                  `/asset/`, // TODO: fix this for production
                  object['asset.path'],
                  vrScene.current,
                  ((meshes) => {

                      // set rootmesh for the model with object ID as name
                      let rootMesh = new AbstractMesh(object.id);
                      rootMesh.alwaysSelectAsActiveMesh = true

                      meshes.forEach((mesh) => {
                          // set the parent only if the mesh doesn't already have a parent to preserve mesh hierarchy
                          if (!mesh.parent) {
                              mesh.parent = rootMesh

                              mesh.actionManager?.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function () {alert("pointer out")}));
                          }
                      })

                      // apply stored transformations to rootMesh
                      rootMesh.position = new Vector3(object.x_pos, object.y_pos, object.z_pos);
                      rootMesh.rotationQuaternion = new Quaternion(object.x_rotation, object.y_rotation, object.z_rotation, object.w_rotation);
                      rootMesh.scaling = new Vector3(object.x_scale, object.y_scale, object.z_scale);
                      
                      sceneRootMeshes.push({
                        "mesh": rootMesh,
                        "id": object.id
                      })

                      // add pointer actions
                      rootMesh.actionManager?.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, function () {alert("pointer out")}));
                  }),

              );

              setSceneRootMeshes(sceneRootMeshes);
          });


     } else {
         console.log("Current scene is undefined")
     }
    }

    // loads the video into the scene
    const loadVideo = () => {
      if (video === undefined) {
        return;
      }

      if (videoDome.current !== undefined) {
        videoDome.current?.dispose();
      }

      const posterURL = `/api/asset/${video.id}/thumbnail`;
      videoDome.current = new VideoDome(
        "videoDome", 
        [`/asset/${video.path}`], 
        {
          resolution: 32,
          clickToPlay: false,
          autoPlay: false,
          poster: posterURL,
          loop: false
        }, 
        vrScene.current
      );

      // reset video transport
      setCurrentVideoLength(videoDome.current?.videoTexture.video.duration)
      setCurrentVideoTime(0);

      // make sure playback is updated
      videoDome.current.videoTexture.video.ontimeupdate = (event: any) => {
        setCurrentVideoTime(event.target.currentTime);
      };

      // set video to stereoscopic or mono
      
      videoDome.current.videoTexture.video.onloadedmetadata = (event: any) => {
        setCurrentVideoLength(event.target.duration);
        setStereoscopic(video.view_type);
      };

      videoDome.current.videomode = VideoDome.MODE_SIDEBYSIDE;
    };

    function setStereoscopic(mode: string) {
      switch (mode) {
        case "ViewType.toptobottom":
          videoDome.current.videomode = VideoDome.MODE_TOPBOTTOM;
          break;
        case "ViewType.sidetoside":
          videoDome.current.videomode = VideoDome.MODE_SIDEBYSIDE;
          break;
        case "ViewType.mono":
          videoDome.current.videomode = VideoDome.MODE_MONOSCOPIC;
          break;
      }
    }

    function renderStartButton(scene: any) {
      const manager = new GUI3DManager(scene);

      var panel = new StackPanel3D();
      manager.addControl(panel);
      panel.margin = 0.3;

      // set anchor in front of camera
      let forwardRay = vrHelper?.currentVRCamera.getForwardRay(); 
      var buttonPosition = vrHelper?.currentVRCamera.position.clone().add(forwardRay.direction.scale(5.5));
      buttonPosition.y += 2;

      createButton(scene, "Start Training", buttonPosition, () => {
        videoDome.current?.videoTexture.video.play();
        clearButtons();
        clearText();
        if (onSceneStart !== undefined)
          onSceneStart();
      })

      // draw text so user knows what to do
      drawText("Kijk naar de bal om te beginnen")
    }

    // used to wrap the words
    function wordWrap (str: string, maxWidth: number) {

      // testing for white spaces
      function testWhite (x:any) {
        const white = new RegExp(/^\s$/)
        return white.test(x.charAt(0))
      };
      
      const newLineStr = '\n'
      let res = ''

      if (str === null )
        return ""

      while (str.length > maxWidth) {
        let found = false
        // Inserts new line at first whitespace of the line
        for (let i = maxWidth - 1; i >= 0; i--) {
          if (testWhite(str.charAt(i))) {
            res = res + [str.slice(0, i), newLineStr].join('')
            str = str.slice(i + 1)
            found = true
            break
          }
        }

        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
          res += [str.slice(0, maxWidth), newLineStr].join('')
          str = str.slice(maxWidth)
        }
      }
      return res + str
    }

    function renderAnnotation() {
      // first pause the video
      videoDome.current?.videoTexture.video.pause();
      
      // draw the question on screen
      drawText(wordWrap(activeAnnotation.text, 50))

      for (var i = 0; i < activeAnnotation?.options.length; i++) {
        var option = activeAnnotation?.options[i];

        var forwardRay: Ray = vrScene.current?.activeCamera.getForwardRay();
        var buttonPosition = vrScene.current?.activeCamera.position.clone().add(forwardRay.direction.scale(5.5));
        // buttonPosition.add(forwardRay.direction.cross(new Vector3(0, 1, 0).scale(100)));

        var sideVector = forwardRay.direction.cross(new Vector3(0, 1, 0).scale(4.2 * i - (1.0 * (activeAnnotation?.options.length)) ));
        buttonPosition = buttonPosition.add(sideVector);

        buttonPosition.y -= 3.5;

        createButton(vrScene.current, wordWrap(option.text, 50), buttonPosition, () => {
          clearButtons();
          clearText();

          let forwardRay = vrScene.current?.activeCamera.getForwardRay(); 
          var buttonPosition = vrScene.current?.activeCamera.position.clone().add(forwardRay.direction.scale(5.5));
          var sideVector = forwardRay.direction.cross(new Vector3(0, 1, 0).scale(3));
          buttonPosition.y -= 3.5;

          createButton(vrScene.current, "Verder gaan", buttonPosition, () => {
            videoDome.current?.videoTexture.video.play();
            clearButtons();
            clearText();
            onNextScene(option.action);
          })
          drawText(wordWrap(option.feedback, 50));
        })
      }
      
    }

    function createButton(scene: any, text: string, position: Vector3, action: () => void) {

      var plane = MeshBuilder.CreatePlane("selectable" + (buttons.current.length), {width: 4, height: 2});
      plane.billboardMode  = Mesh.BILLBOARDMODE_ALL ;
      plane.position.y = 1.4;
      // plane.rotation = vrScene.current?.activeCamera.rotation.clone();
      plane.position = position;
  
      var advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane, 1024, 512);
  
      var rect1 = new Rectangle();
      rect1.cornerRadius = 30;
      rect1.thickness = 5;
      rect1.background = "white";
      rect1.alpha = 1.0;
      advancedTexture.addControl(rect1);
  
      var textBlock = new TextBlock();
      textBlock.text = text;
      textBlock.textWrapping = true;
      textBlock.color = "black";
      textBlock.fontFamily = "Lucida Console";
      textBlock.fontSize = "50";
      rect1.addControl(textBlock);


      // add it to the buttons list to keep track of it
      buttons.current.push(plane);

      buttonTexts.current.push(textBlock);

      // append the action to the list of actions
      buttonActions.current.push(action);
      
    }

    function clearButtons() {
      // first deselect any possible selections
      unselect();

      // dispose texts 
      for (var i = 0; i < buttonTexts.current.length; i++) {
        buttonTexts.current[i].dispose();
      }
      buttonTexts.current = [];
      
      // remove actions
      buttonActions.current = [];

      // dispose buttons
      for (var i = 0; i < buttons.current.length; i++) {
        buttons.current[i].dispose();
      }
      buttons.current = [];

    }

    function drawText(text: string) {
      let forwardRay = vrScene.current?.activeCamera.getForwardRay();
      const planePosition = vrScene.current?.activeCamera.position.clone().add(forwardRay.direction.scale(5.5));

      // make sure plane is always on viewheight of user
      planePosition.y =  vrScene.current?.activeCamera.position.y;

      var plane = MeshBuilder.CreatePlane("text", {width: 5, height: 3}, vrScene.current);
      plane.position = planePosition.clone();
      plane.rotation = vrScene.current?.activeCamera.rotation.clone();
  
      var advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane, 1024, 512);
  
      var rect1 = new Rectangle();
      rect1.cornerRadius = 10;
      rect1.thickness = 4;
      rect1.background = "black";
      rect1.alpha = 0.8;
      advancedTexture.addControl(rect1);
  
      var textBlock = new TextBlock();
      textBlock.text = text;
      textBlock.color = "white";
      textBlock.fontFamily = "Lucida Console";
      textBlock.fontSize = "50";
      rect1.addControl(textBlock);

      drawnText = plane;
    }

    function clearText() {
      drawnText?.dispose();
    }

    // creates a target mesh for a given camera
    function createTargetMesh()  {
        target = MeshBuilder.CreatePlane("targetViewVR", {});
        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(target, 2048, 2048);
        var circle = new Ellipse();
        circle.width = "80px";
        circle.color = "white";
        circle.thickness = 15;
        circle.height = "80px";
        advancedTexture.addControl(circle);
        target.parent = vrHelper.currentVRCamera;
        target.position.z = 1.1;
    }

    // runs whenever the seen has been set up
    function onSceneReady (scene: any) {

      var vrHelperOptions = {
        createDeviceOrientationCamera: true,
        useXR: true
      };

      vrHelper = scene.createDefaultVRExperience(vrHelperOptions);
      
      vrHelper.displayLaserPointer = true;
      vrHelper.updateGazeTrackerScale = true;  // Babylon 3.3 preview.
      vrHelper.updateGazeTrackerColor = true;  // Babylon 3.3 preview.
      vrHelper.displayGaze = true;  // Does need to be true. Otherwise, position not updated.
      vrHelper.enableGazeEvenWhenNoPointerLock = isMobile;
      vrHelper.exitVROnDoubleTap = true;
      vrHelper.requestPointerLockOnFullScreen = true;
      vrHelper.position = new Vector3(0,0,0);

      vrHelper.onEnteringVRObservable.add( () => {
        videoDome.current?.videoTexture.video.play();
        videoDome.current?.videoTexture.video.pause();
      })

      vrHelper.onAfterEnteringVRObservable.add( () => {
        createTargetMesh();
        renderStartButton(scene);
        vrHelper.vrButton.style = "visibility: hidden";
      })

      vrHelper.onExitingVRObservable.add( () => {
        clearButtons();
        clearText();
        vrHelper.vrButton.style = "visibility: visible";
      })

      vrHelper.enableInteractions();

      // keep track of scene to use it later
      vrScene.current = scene;

      let light = new HemisphericLight("light", new Vector3(0, 4, 0), scene);
      light.intensity = 1;

      // update state
      setSceneLight(light);
      setLightIntensity(1.0);

    }

    // gets called everytime a frame is rendered
    function onRender (scene: any) {
      castRayAndSelectObject(scene);
    }

    function predicate(mesh: Mesh) {

      // check if mesh is selectable
      return mesh.name.indexOf("selectable") !== -1;
    }

    // source: https://www.babylonjs-playground.com/#ZGNHW1
    function unselect() {
        objectSelecting = false;
        objectSelected = false;

        // reset target scaling
        if (target !== undefined) {
          target.scaling.x = 1;
          target.scaling.y = 1;
          target.scaling.z = 1;
        }

        if (!currentMeshSelected) {
            return;
        }
        (currentMeshSelected?.material as StandardMaterial).diffuseColor = Color3.Black();
    }

    var castRayAndSelectObject = function (scene: any) {
      var ray;
      var camera = vrHelper?.currentVRCamera;

      if (camera === undefined) {
        return;
      }
      if (!camera.rightController) {
          ray = camera.getForwardRay();
      } else {
          ray = camera.rightController.getForwardRay();
      }
  
      var hit = scene.pickWithRay(ray, predicate);
  
      if (helper) {
          helper.dispose();
      }
  
      if (camera.rightController) {
          if (target) target.isVisible = false;
          helper = RayHelper.CreateAndShow(ray, scene, new Color3(0.7, 0.7, 0.7));
      }
  
      if (hit.pickedMesh) {
          currentMeshSelected = hit.pickedMesh;
          // First phase is to indicate we're currently selecting an object
          // It could be a menu in a game or experience
          if (!objectSelecting) {
              // The visual feedback of the selection is changing the color
              // of the cube to red and change the text to 'Selecting'
              objectSelecting = true;
              (currentMeshSelected.material as StandardMaterial).diffuseColor = Color3.Red();
              var index = currentMeshSelected.name[currentMeshSelected.name.length - 1];
          }
  
          // Another visual feedback is to scale the target circle
          // Once it has double its size (it could be a timing also)
          // We're considering the user has really decided to select this option
          if (target.scaling.x >= 2) {
              if (!objectSelected) {
                  // Visual feedback is to change color to blue
                  // And change the text to 'Selected'
                  objectSelected = true;

                  var index = currentMeshSelected.name.charAt(currentMeshSelected.name.length - 1);

                  buttonActions.current[parseInt(index)]();

                  (currentMeshSelected.material as StandardMaterial).diffuseColor = Color3.Black();
              }
          }
          // Scaling the target circle until it reaches 2
          else {
            if (target){
              target.scaling.x += 0.02;
              target.scaling.y += 0.02;
              target.scaling.z += 0.02;
            }
          }
      }
      else {
          unselect();
      }
  }

    return (
        <SceneComponent  className="mainView" antialias adaptToDeviceRatio onSceneReady={onSceneReady} onRender={onRender} />
    );
};

export default ScenePlayerComponent;
