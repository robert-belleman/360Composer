import React, { useEffect, useState } from "react";
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
import Box from '@mui/material/Box';

import Skeleton from '@mui/material/Skeleton';

import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import ListIcon from '@mui/icons-material/List';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import axios from "axios";

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

// Material UI
import { DataGrid } from '@mui/x-data-grid';
import { getValue } from '@mui/system';



// Drag'n'Drop-kit
import { DndContext, closestCenter, MouseSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useSortable, arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import SortableItem from '../../components/VideoEditorComponents/SortableItem';




// import "./VideoEditor.scss";

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

interface Clip {
  id: UniqueIdentifier,
  start: number,
  end: number,
  trim: [number, number]
  fps: number,
  frameStart: number,
  frameEnd: number,
  // other props
}

const VideoEditor: React.FC = () => {

  const { projectID } = useParams<`projectID`>();
  const navigate = useNavigate();
  const useQuery = () => new URLSearchParams(useLocation().search);
  const param: string | null = useQuery().get('goBack');
  const goBack = !(param === null || param === undefined);

  const classes = useStyles();


  // video variables
  const [video, setVideo]: any = useState(undefined);
  const [playing, setPlaying]: any = useState(false);
  var [currentVideoTime, setCurrentVideoTime]: any = useState(0);
  const [currentVideoLength, setCurrentVideoLength]: any = useState(0);
  const [videoMarks, setVideoMarks]: any = useState([]);


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

  // CLIPSCONTAINER FUNCTIONS
  // Defines the delay of the drag event, how long the user has to 
  // hold the mouse down before the drag event is triggered.
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 200, // milliseconds
        tolerance: 20, // pixels
      }
    })
  );

  // Define the handleDragEnd function
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Update the clips array with the new order.
    if (over && active.id !== over.id) {

      // console.log(clips);
      const oldIndex = clips.findIndex(item => item.id === active.id);
      const newIndex = clips.findIndex(item => item.id === over.id);
      const newItemsArray = arrayMove(clips, oldIndex, newIndex);
      setClips(newItemsArray);
    }
  }

  //Timeline functions
  const [clips, setClips] = useState<Clip[]>([]);
  const [uidCounter, setUidCounter] = useState(1);
  const [trimcommand, setTrimcommand] = useState("");
  const [currentTime, setCurrentTime] = React.useState(0);
  // Declare a state variable to track the currently selected item
  const [selectedItems, setSelectedItems] = useState<UniqueIdentifier[]>([]);


  const fetchVideo = async () => {
    axios.get(`/api/asset/48a624b40eff4b1c924f4452428478b9230108172303}`)
      .then((res: any) => setVideo(res.data))
      .catch((e) => console.log(e))
  }


  // loads video when we have fetched the video data
  useEffect(() => {
    fetchVideo();
    if (video !== undefined)
      loadVideo();
  }, [video]);






  // Add a new video to the timeline
  const addVideoToTimeline = () => {
    const videoStart = 0;
    const videoEnd = 20.523000; //TODO: get video length
    const videoFps = 30; //TODO: get fps
    const videoFrameStart = 0;
    const videoFrameEnd = 615; //TODO: get video length

    setClips(clips => [...clips, { id: uidCounter, start: videoStart, end: videoEnd, trim: [videoStart, videoEnd], fps: videoFps, frameStart: videoFrameStart, frameEnd: videoFrameEnd }]);
    // Give the next video a unique id
    setUidCounter(uidCounter + 1);
  }

  const handleTimeChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    setCurrentTime(newValue as number);
  };

  const applyVideoEdit = () => {
    const tmp = clips.map(clip => {
      return ([`${clip.id}`, clip.trim[0], clip.trim[1], `${clip.id}_trim.mp4`])
    });
    setTrimcommand(`${tmp}`);

  }

  const handleClipSelect = (id: UniqueIdentifier) => {
    // If the clicked item is already the selected item, deselect it
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      // Otherwise, add the clicked item to the selected items array
      setSelectedItems([...selectedItems, id]);
    }
  }

  const deleteSelectedVideos = () => {
    setClips(clips => clips.filter(clip => !selectedItems.includes(clip.id)));
    setSelectedItems([]);
  }

  const loadVideo = () => {
    if (video === undefined) {
      return;
    }

    if (videoDome !== undefined) {
      videoDome.dispose();
    }

    const posterURL = `/api/asset/${video.id}/thumbnail`;
    videoDome = new VideoDome(
      "videoDome",
      [`/asset/${video.path}`],
      {
        resolution: 32,
        clickToPlay: false,
        autoPlay: playing,
        poster: posterURL,
        loop: false
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

    // // set video to stereoscopic or mono
    // setStereoscopic(video.view_type);

    videoDome.videoTexture.video.onloadedmetadata = (event: any) => {
      setCurrentVideoLength(event.target.duration);
    };
  };








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


  }

  // gets called everytime a frame is rendered
  const onRender = (scene: any) => {

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


  const valueLabelFormat = (value: number) => {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    const minutesLabel = minutes < 10 ? `0${minutes}` : minutes
    const secondsLabel = seconds < 10 ? `0${seconds}` : seconds

    return `${minutesLabel}:${secondsLabel}`
  }





  const renderSceneComponent = () => (
    <Paper variant="outlined" style={{ padding: 20, marginTop: 20 }}>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='VideoEditorCanvas' ></SceneComponent>
      {renderTransport()}
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
      </Grid>
    );
  }



  return (<>
    <TopBar></TopBar>
    <SideMenu activeView={View.Project} />
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} variant="outlined" className={classes.top}>
            <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => goBack ? navigate(-1) : navigate(`/app/project/${projectID}?activeTab=assets`)}>Back</Button>
          </Paper>
        </Grid>
      </Grid>
      <div style={{
        margin: 10,
      }}>
        <Grid container spacing={2}>
          <Grid xs={4}>
            {/* AssetViewer Container */}
            <Paper sx={{
              // height: '100%',
            }}>Assets


              <Box>
                <DataGrid
                  columns={[
                    { field: 'name' }
                  ]}
                  rows={[
                    { id: 1, name: 'video1' },
                    { id: 2, name: 'video2' }]}
                />
              </Box>
              <Button onClick={addVideoToTimeline}>
                ADD
              </Button>




            </Paper>
          </Grid>
          <Grid xs sx={{
            // height: '50vh',
          }}>
            {/* VideoPlayer Container */}
            <Paper sx={{
              // height: '100%',
            }}>


              <Box sx={{
                // aspectRatio: '16/9',
                // width: '100%',
                // height: '56.25%',
                backgroundColor: 'black',
                // paddingBottom: '56.25%',

                // maxWidth: '100%',
              }}>

              </Box>
              <Slider
                min={0}
                max={100}
              />
            </Paper>
          </Grid>
          <Grid xs={12}>
            {/* Timeline Container */}
            <Paper>



              <div style={{
                height: '20px',
              }}></div>

              <div style={{
                width: '90%',
                margin: 'auto',
              }}>
                <Slider
                  value={currentTime}
                  min={0}
                  max={clips.reduce((total, clip) => total + clip.frameEnd, 0)}
                  onChange={handleTimeChange}
                  valueLabelDisplay="auto"
                />

                <div style={{
                  marginTop: '10px',
                }}>




                  <div
                    style={{
                      backgroundColor: '#f0f0f0',
                      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',

                      margin: '0 auto',
                      height: 120,
                    }}
                  >
                    <DndContext
                      // This context is used to define the drag event.
                      sensors={sensors}
                      modifiers={[restrictToHorizontalAxis]}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        // This context is used to define the sorting of the items.
                        items={clips}
                        strategy={horizontalListSortingStrategy}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            height: "100%"
                          }}>

                          {clips.map((clip: Clip) => {


                            return (
                              <SortableItem
                                key={clip.id}
                                id={clip.id}
                                clip={clip}
                                // setClips={() => setClips(clips)}
                                isSelected={selectedItems.includes(clip.id)}
                                onSelect={() => {
                                  console.log(`Select Clip #${clip.id}`)
                                  handleClipSelect(clip.id)
                                }
                                }
                              >
                              </SortableItem>
                            )
                          })}

                        </Box>
                      </SortableContext>
                    </DndContext >
                  </div >

                  <Box>
                    {clips.map(clip => {
                      return (
                        <p key={clip.id}>{clip.id} {clip.start} {clip.end} {clip.trim}</p>
                      )
                    })}
                  </Box>
                </div>
              </div>
              <p>{selectedItems}</p>
              <Button onClick={applyVideoEdit}>
                Apply Changes
              </Button>
              <Button onClick={deleteSelectedVideos}>
                DELETE Selected Clips {selectedItems}
              </Button>
              <p>{trimcommand}</p>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  </>);
};


export default VideoEditor;
