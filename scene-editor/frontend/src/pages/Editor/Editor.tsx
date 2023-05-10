import React, {RefObject, useCallback, useEffect, useState} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { concat, sortBy } from 'lodash';

import {
  FreeCamera,
  Vector3,
  AbstractMesh,
  SceneLoader,
  Nullable,
  VideoDome,
  HemisphericLight,
  GizmoManager,
  Quaternion,
  TransformNode,
  MeshBuilder,
} from "@babylonjs/core"
import {
  GUI3DManager,
  HolographicButton,
  StackPanel3D,
  AdvancedDynamicTexture,
  TextBlock
} from "@babylonjs/gui"
import "@babylonjs/loaders"

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Card from "@mui/material/Card";
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Slider from "@mui/material/Slider";

import Skeleton from '@mui/material/Skeleton';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import ListIcon from '@mui/icons-material/List';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import axios from "axios";

import Hls from "hls.js";

import SceneComponent from "../../components/SceneComponent";
import AssetList from "../../components/EditorComponents/AssetList";
import SceneSettings from "../../components/EditorComponents/SceneSettings";
import Annotation from "../../components/EditorComponents/Annotation";
import TopBar from "../../components/TopBar";
import MediaSelector from "../../components/EditorComponents/MediaSelector";
import NewAnnotationDialog from "../../components/EditorComponents/NewAnnotationDialog";
import SideMenu from "../../components/SideMenu";
import UpdateSceneDialog from "../../components/EditorComponents/UpdateSceneDialog";

import { View } from '../../types/views';

import "./Editor.scss";
import ReactDOM from "react-dom";

const theme = createTheme();
const useStyles = makeStyles((theme) =>
      createStyles({
        root: {
          flexGrow: 1,
          padding: theme.spacing(1),
          [theme.breakpoints.up('sm')]: {
            marginLeft: 240
          }
        },
        top: {
          padding: theme.spacing(2),
          boxSizing: 'border-box'
        }
      })
    )

const Editor: React.FC = () => {

    const { project_id, scene_id } = useParams<'project_id' | 'scene_id'>();
    const navigate = useNavigate();
    const useQuery = () => new URLSearchParams(useLocation().search);
    const param:string|null = useQuery().get('goBack');
    const goBack = !(param === null || param === undefined)

    const classes = useStyles();

    const [scene, setScene]: any = useState(undefined);
    const [video, setVideo]: any = useState(undefined);
    const [objects, setObjects] = useState([]);
    const [media, setMedia] = useState([]);
    const [annotations, setAnnotations] = useState([] as any[]);
    const [newAssetDialogOpen, setNewAssetDialogOpen] = useState(false);

    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

    // video variabels
    const [playing, setPlaying]: any = useState(false);
    var [currentVideoTime, setCurrentVideoTime]: any = useState(0);
    const [currentVideoLength, setCurrentVideoLength]: any = useState(0);
    const [videoMarks, setVideoMarks]: any = useState([]);

    // contains the current annotation to show
    const [activeAnnotation, setActiveAnnotation]: any = useState(undefined);

    // babylon variables
    const [babylonScene, setBabylonScene]: any = useState(undefined);
    const [sceneLight, setSceneLight]: any = useState(undefined);
    const [babylonCamera, setBabylonCamera]: any = useState(undefined);
    const [gizmoManager, setGizmoManager]: any = useState(undefined);
    var [videoDome, setVideoDome]: any = useState(undefined);
    var [guiManager, setGuiManager]: any = useState(undefined);
    var [questionPlane, setQuestionPlane]: any = useState(undefined);

    // sets the mesh that is currently selected by the user
    var [activeMesh]: any = useState(null);

    // contains the root mesh of all meshes currently in the scene
    const [sceneRootMeshes, setSceneRootMeshes]: any = useState([]);

    // scene settings
    const [lightIntensity, setLightIntensity]: any = useState(0);

    const fetchSceneData = async () => {
        axios
          .get(`/api/scenes/${scene_id}/`)
          .then((res) => {setScene(res.data); return res.data;})
          .then(fetchAssets)
          .catch((e) => {
            console.log(e);
          })
    };

    const fetchAssets = async (sceneData:any) => {
      axios.get(`/api/project/${sceneData.project_id}/assets`)
        .then((res) => {setMedia(res.data.filter((x:any) => x.asset_type === "AssetType.video"))})
    }

    const fetchAnnotations = async () => {
      axios.get(`/api/scenes/${scene_id}/annotations`)
        .then((res:any) => res.data).then(setAnnotations)
        .catch((e) => console.log(e))
    }

    const fetchVideo = async () => {
      axios.get(`/api/asset/${scene.video_id}`)
        .then((res: any) => setVideo(res.data))
        .catch((e) => console.log(e))
    }

    const addAnnotation = async () => {
      axios.post(`/api/scenes/${scene_id}/annotation`, {text:"", timestamp:0})
        .then((res:any) => setAnnotations(concat(annotations, res.data as never[])))
        .catch((e) => console.log(e))
    }

    /*
     * Fetches the objects that are stored in the database for this scene
     */
    const fetchSceneObjects = async () => {
      axios
          .get(`/api/scenes/${scene_id}/objects`, {})
          .then((res) => {setObjects(res.data); console.log(res); loadMeshes(res.data);} )
          .catch(() => {
              console.log("Could not load assets")
          });
    };

    useEffect(() => {
      if( scene_id !== undefined) {
        fetchSceneData();
        fetchAnnotations();
      }

    }, [scene_id]);

    useEffect(() => {
      if (babylonScene !== undefined)
        fetchSceneObjects();
    }, [babylonScene]);

    useEffect(() =>{
      if (scene !== undefined) {
        fetchVideo();
      }
    }, [scene])

    // loads video when we have fetched the video data
    useEffect(() => {
      if (video !== undefined)
        loadVideo();
    }, [video]);

    useEffect(() => {
      // filter annotations that are later in the video than current timestamp
      const filteredAnnotations = annotations.filter((obj: any) => {
        return obj.timestamp <= currentVideoTime;
      })
      const active = filteredAnnotations[filteredAnnotations.length - 1];
      if (active !== activeAnnotation) {
        stopVideo();
        setActiveAnnotation(active);
      }
    }, [currentVideoTime]);

    // render new annotation
    useEffect(() => {
      // remove old gui manager to create a new one
      guiManager?.dispose();
      questionPlane?.dispose();

      // NOTE: this can use a rewrite, hacky 1 AM code
      if (activeAnnotation !== undefined) {

        const manager = new GUI3DManager(babylonScene);

        var anchor = new TransformNode(activeAnnotation.id);
        var panel = new StackPanel3D();
        manager.addControl(panel);
        panel.margin = 0.3;

        // set anchor in front of camera
        let forwardRay = babylonCamera.getForwardRay();
        anchor.position = babylonCamera.position.clone().add(forwardRay.direction.scale(4 /* * forwardRay.length */));

        anchor.rotation = babylonCamera.rotation.clone();

        panel.linkToTransformNode(anchor);


        // GUI
        var plane = MeshBuilder.CreatePlane("plane", {size: 3});
        plane.position = anchor.position.clone();
        plane.position.y += 0.8;
        plane.parent = anchor;
        // plane.rotation = babylonCamera.rotation.clone();

        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        var textblock = new TextBlock();
        textblock.text = activeAnnotation.text;
        textblock.fontSize = 70;
        textblock.color = "white";
        advancedTexture.addControl(textblock);

        setQuestionPlane(plane);

        // create buttons for the options
        activeAnnotation.options.forEach((option:any) => {
          const button = new HolographicButton(option.id);
          panel.addControl(button);
          button.text = `${panel.children.length}: ${option.text}`;
        });

        setGuiManager(manager);
      } else {

      }
    }, [activeAnnotation])

    useEffect(() => {
      console.log("currentVideoLength: " + currentVideoLength);
    }, [currentVideoLength]);

    // annotations are loaded
    useEffect(() => {
      // Create marks for the transport slider
      const marks = sortBy(annotations, ['timestamp']).map((obj: any, index:number) => {
        return (
            {
              value: obj.timestamp,
              label: `${index+1}`
            })
      });

      setVideoMarks(marks);
    }, [annotations])

    // retrieve saved meshes for scene from the database
    const loadMeshes = async (objects: any) => {
      // console.log("Startig object mapping");
      console.log(objects);
      if (babylonScene !== undefined) {
          console.log("starting mapping of objects")


          objects.map((object: any) => {
            // only load objects that are not yet in the list
              SceneLoader.ImportMesh(
                  undefined,
                  `/asset/`, // TODO: fix this for production
                  object['asset.path'],
                  babylonScene,
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
                      rootMesh.rotationQuaternion = new Quaternion(object.x_rotation, object.y_rotation, object.z_rotation, object.w_rotation);
                      rootMesh.scaling = new Vector3(object.x_scale, object.y_scale, object.z_scale);

                      sceneRootMeshes.push({
                        "mesh": rootMesh,
                        "id": object.id
                      })
                  }),

              );

              setSceneRootMeshes(sceneRootMeshes);
          });


     } else {
         console.log("Current scene is undefined")
     }
    }

    // loads a single mesh by object_id and adds it to the scene
    const loadMesh = (assetID: string) => {
      // create new object at world origin
      const payload = {
        "asset_id": assetID,
        "x_pos": 0,
        "y_pos": 0,
        "z_pos": 0,

        "x_scale": 1,
        "y_scale": 1,
        "z_scale": 1,

        "x_rotation": 0,
        "y_rotation": 0,
        "z_rotation": 0,
        "w_rotation": 1,
      }

      axios.post(`/api/scenes/${scene_id}/objects`, payload)
        .then((res) => {fetchSceneObjects();} )
        .catch(() => {
            console.log("Could not load assets")
        });
    }

    const saveMesh = (id: string, position: Vector3, rotation: Quaternion, scale: Vector3) => {
      const payload = {
        "id": id,
        "x_pos": position.x,
        "y_pos": position.y,
        "z_pos": position.z,

        "x_scale": scale.x,
        "y_scale": scale.y,
        "z_scale": scale.z,

        "x_rotation": rotation.x,
        "y_rotation": rotation.y,
        "z_rotation": rotation.z,
        "w_rotation": rotation.w
      }
      axios.put(`/api/scenes/${scene_id}/objects`, payload)
        .catch(() => {
            console.log("Could not update assets")
        });
    }

    const onVideoElemRef = useCallback(videoElem => {
      const conf = {
        startLevel: -1, // download lowest quality variant as speed test
        capLevelOnFPSDrop: true,
      };
      const hls = new Hls(conf);
      hls.loadSource(`/asset/${video.path}`);
      hls.attachMedia(videoElem);
      loadVideoBabylon(videoElem);
    }, [video]);

    const loadVideo = () => {
      const component = <video ref={onVideoElemRef}></video>;
      ReactDOM.render(component, document.getElementById('video-player-root'));
    }

    const loadVideoBabylon = (videoElem: HTMLVideoElement) => {
      if (videoDome !== undefined) {
        videoDome.dispose();
      }

      const posterURL = `/api/asset/${video.id}/thumbnail`;
      videoDome = new VideoDome(
        "videoDome",
        videoElem,
        {
          resolution: 32,
          clickToPlay: false,
          autoPlay: playing,
          poster: posterURL,
          loop: true
        },
        babylonScene
      );
      setVideoDome(videoDome);

      // reset video transport
      setCurrentVideoLength(videoDome.videoTexture.video.duration)
      setCurrentVideoTime(0);

      // make sure playback is updated
      videoDome.videoTexture.video.ontimeupdate = (event: any) => {
        setCurrentVideoTime(event.target.currentTime);
      };

      videoDome.videoTexture.video.onloadedmetadata = (event: any) => {
        setCurrentVideoLength(event.target.duration);
        setStereoscopic(video.view_type);
      };
    };

    function setStereoscopic(mode: string) {
      switch (mode) {
        case "ViewType.toptobottom":
          videoDome.videomode = VideoDome.MODE_TOPBOTTOM;
          break;
        case "ViewType.sidetoside":
          videoDome.videomode = VideoDome.MODE_SIDEBYSIDE;
          break;
        case "ViewType.mono":
          videoDome.videomode = VideoDome.MODE_MONOSCOPIC;
          break;
      }
    }

    const annotationUpdate = (updatedAnnotation:any) => {
      setAnnotations(annotations.map((annotation:any) => annotation.id === updatedAnnotation.id ? updatedAnnotation : annotation))
    }

    // runs whenever the seen has been set up
    const onSceneReady = (scene: any) => {

      // keep track of scene to use it later
      setBabylonScene(scene);

      var camera = new FreeCamera("camera1", new Vector3(0, 0, 3), scene);
      // This targets the camera to scene origin
      camera.setTarget(new Vector3(0, 0, 0));
      camera.speed *= 0.2;
      const canvas = scene.getEngine().getRenderingCanvas();
      // This attaches the camera to the canvas
      camera.attachControl(canvas, true);
      // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
      let light = new HemisphericLight("light", new Vector3(0, 4, 0), scene);
      light.intensity = 1;

      setBabylonCamera(camera);

      // update state
      setSceneLight(light);
      setLightIntensity(1.0);

      // set gizmonager for the scene
      var manager = new GizmoManager(scene);
      manager.boundingBoxGizmoEnabled = true;
      manager.usePointerToAttachGizmos = true;
      manager.clearGizmoOnEmptyPointerEvent = true;
      setGizmoManager(manager);

      // finally create callback function for gizmomanager
      // this is used to update the object properties view
      manager.onAttachedToMeshObservable.add((mesh: Nullable<AbstractMesh>)=> {
          if (mesh !== null) {
            if (mesh !== activeMesh) {
              console.log(activeMesh);
              // save old active Mesh before overwriting it only if new mesh is selected
              if (activeMesh !== null)
                saveMesh(activeMesh.id, activeMesh.position, activeMesh.rotationQuaternion, activeMesh.scaling);
            }
          } else {
            if (activeMesh !== null)
                saveMesh(activeMesh.id, activeMesh.position, activeMesh.rotationQuaternion, activeMesh.scaling);
          }

          activeMesh = mesh;

      });

       // enable gizmo settings with keyboard presses
       document.onkeydown = (e)=>{
        if(e.key === 'g'){ // move gizmo
          manager.positionGizmoEnabled = true;
          manager.rotationGizmoEnabled = false;
          manager.scaleGizmoEnabled = false;
          manager.boundingBoxGizmoEnabled = false;

        }
        if(e.key === 's'){ // scale gizmo
          manager.positionGizmoEnabled = false;
          manager.scaleGizmoEnabled = true;
          manager.rotationGizmoEnabled = false;
          manager.boundingBoxGizmoEnabled = false;
        }
        if(e.key === 'r'){ // rotate gizmo
          manager.positionGizmoEnabled = false;
          manager.scaleGizmoEnabled = false;
          manager.rotationGizmoEnabled = true;
          manager.boundingBoxGizmoEnabled = false;
        }
        if(e.key === 'b'){ // box gizmo
          manager.positionGizmoEnabled = false;
          manager.scaleGizmoEnabled = false;
          manager.rotationGizmoEnabled = false;
          manager.boundingBoxGizmoEnabled = true;
        }
        if(e.key === 'x') {
          deleteActiveMesh();
          manager.attachToMesh(null);
        }
      }

    }

    // gets called everytime a frame is rendered
    const onRender = (scene: any) => {

    }

    // disposes mesh and removes it from the root meshes list
    // TODO: actually remove it from the root meshes list
    const deleteActiveMesh = () => {
      if (activeMesh !== null) {
        activeMesh.dispose();
      }
    }

    // callback for the light intensity slider
    const onLightIntensityChanged = (event: any, newValue: number | number[]) => {

      if (sceneLight !== undefined){
        let light = sceneLight;
        light.intensity = newValue as number
        setSceneLight(light);
      } else {
        console.log("Scenelight is undefined")
      }

      setLightIntensity(newValue as number);
    };

    // callback for asset list selection
    const onAddAsset = (assetID: string) => {
      loadMesh(assetID);
    }

    const renderAddAnnotation = () => {
      return (
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="subtitle1" component="p">No annotation added yet.</Typography>
          </Grid>
        </Grid>
      )
    }

    const renderAnnotations = () => {
      return annotations.length !== 0
        ? sortBy(annotations, ['timestamp']).map((annotation:any, index:number) => {
          return (<Annotation sceneID={scene_id!} annotationID={annotation.id} videoLength={currentVideoLength} num={index+1} key={`${annotation.id}-${index}`} onDelete={fetchAnnotations} update={annotationUpdate} annotation={annotation} options={annotation.options}/>)
        })
        : [renderAddAnnotation()]
    }

    // video functions
    const stopVideo = () => {
      videoDome.videoTexture.video.pause();
      setPlaying(false);
    }

    const startVideo = () => {
      videoDome.videoTexture.video.play();
      setPlaying(true);
    }

    const updateVideo = (event: any, newValue: number | number[]) => {
      setCurrentVideoTime(newValue);
      videoDome.videoTexture.video.currentTime = newValue;
    };

    const onAnnotationCreated = () => {
      fetchAnnotations();
    }

    const valueLabelFormat = (value:number) => {
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);

      const minutesLabel = minutes < 10 ? `0${minutes}` : minutes
      const secondsLabel = seconds < 10 ? `0${seconds}` : seconds

      return `${minutesLabel}:${secondsLabel}`
    }

    const renderSettings = () => (
      <Grid container>
        <Grid item xs={12}>
          <Paper variant="outlined" className="listPaper" style={{minHeight: 250}}>
            <Typography variant="h6" className="title">
              Scene Settings
            </Typography>
            <SceneSettings
              onLightIntensityChanged={onLightIntensityChanged}
              lightIntensity={lightIntensity}
            />
            <Divider style={{marginTop: 20, marginBottom: 20}} />
            <Typography variant="subtitle1" component="p" style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}><ImageIcon /> 360° media</Typography>
            <MediaSelector
              sceneID={scene_id!}
              onMediaSelected={() => {fetchSceneData(); fetchAnnotations()}} // always fetch new scene data and annotations when something has changed with the media
              onMediaDeleted={() => fetchSceneData()}
              media={media}
              activeMedia={scene !== undefined ? scene.video_id : undefined}
              />
          </Paper>
        </Grid>
        <Grid item xs={12}>
            <Paper variant="outlined" className="listPaper" style={{minHeight: 250}}>
              <Typography variant="h6" className="title">
                Assets
              </Typography>
              <div className="listView">
                <AssetList activeProject={scene?.project_id} onAddAsset={onAddAsset}/>
              </div>
            </Paper>
          </Grid>
      </Grid>
    )

    const renderSceneComponent = () => (
      <Paper variant="outlined" style={{padding: 20, marginTop: 20}}>
        <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='editorCanvas' ></SceneComponent>
        { renderTransport() }
      </Paper>
    )

    const renderObjectProperties = () => (
      <Paper style={{padding: 20}} variant="outlined">
        <Typography variant="subtitle1" component="p" style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}><ListIcon /> Annotations</Typography>
        <div style={{marginTop: 10}}>{ renderAnnotations() }</div>
      </Paper>
    )

    const renderTransport = () => {
      const playButton =  <Button
                            variant="contained"
                            size="small"
                            className="playButton"
                            color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={startVideo}
                          >Play</Button>

      const stopButton =  <Button
                            variant="contained"
                            size="small"
                            className="playButton"
                            color="secondary"
                            startIcon={<StopIcon />}
                            onClick= {stopVideo}
                          >Stop</Button>

      const annotationButton =  <Button
                                  variant="contained"
                                  size="small"
                                  className="annotationButton"
                                  color="primary"
                                  startIcon={<AddIcon />}
                                  onClick= {() => { setNewAssetDialogOpen(true) } }
                                >Add Annotation</Button>

      return (
        <Grid container>
          <Grid item xs={2} style={{marginTop: 30, textAlign: 'center'}}>
            <p>Start: 00:00</p>
          </Grid>
          <Grid item xs={8}>
            <Slider
              value={currentVideoTime}
              defaultValue={0}
              min={0}
              max={currentVideoLength}
              valueLabelFormat={valueLabelFormat}
              onChange={updateVideo}
              step={0.1}
              marks={videoMarks}
              valueLabelDisplay="on"
              style={{marginTop: 40}}
            >

            </Slider>
          </Grid>
          <Grid item xs={2} style={{marginTop: 30, textAlign: 'center'}}>
            <p>End: {valueLabelFormat(currentVideoLength)}</p>
          </Grid>
          <Grid item xs={12}>
            {playing ? stopButton : playButton}
            {annotationButton}
          </Grid>
        </Grid>
      );
    }

    const renderTop = () => (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => goBack ? navigate(-1) : navigate(`/app/project/${project_id}?activeTab=scenes`)}>Back</Button>
          </Grid>
        </Grid>
      </div>
    )

    const OverviewCard = () => (
      <Card style={{marginTop: 20}} variant="outlined">
        <CardActionArea>
          <CardContent>
            <Typography style={{fontSize: 14}} color="textSecondary" gutterBottom>
              Scenario Information
            </Typography>
            <Divider style={{marginBottom: 10}}/>
            <Typography gutterBottom variant="h5" component="h2">
              {scene === undefined ? "" : scene.name}
            </Typography>
            <Typography variant="body2" component="p">
              {scene === undefined ? "" : scene.description}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary" onClick={() => setUpdateDialogOpen(true)}>
            Edit
          </Button>
        </CardActions>
      </Card>
    )

    return scene_id ? (
        <div>
            <div id="video-player-root" style={{display: "none"}}></div>
            <TopBar></TopBar>
            <SideMenu activeView={View.Project}/>
            <div className={classes.root}>
              <Container maxWidth="xl">
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Paper elevation={0} variant="outlined" className={classes.top}>
                      {renderTop()}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={12}>
                      <OverviewCard />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    {renderSettings()}
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Grid container>
                      <Grid item xs={12}>
                        {renderSceneComponent()}
                      </Grid>
                      <Grid item xs={12} style={{padding: 20}}>
                        {renderObjectProperties()}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <NewAnnotationDialog
                  sceneID={scene_id!}
                  timeStamp={currentVideoTime}
                  open={newAssetDialogOpen}
                  closeHandler={setNewAssetDialogOpen}
                  onAnnotationCreated={onAnnotationCreated}
                />
              </Container>
            </div>
            <UpdateSceneDialog
              sceneID={scene_id!}
              scene={{name: scene ? scene.name : "", description: scene ? scene.description : ""}}
              open={updateDialogOpen}
              closeHandler={() => setUpdateDialogOpen(false)}
              onSceneUpdated={() => {setUpdateDialogOpen(false); fetchSceneData();}}
            />

        </div>
    ) : (<div>No scene id given</div>);
};

export default Editor;
