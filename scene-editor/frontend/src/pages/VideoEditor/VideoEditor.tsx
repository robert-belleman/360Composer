import React, { useMemo, useEffect, useState } from "react";
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
// import { DataGrid } from '@mui/x-data-grid';
import { getValue } from '@mui/system';


import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import { DataGrid, GridColDef, GridValueGetterParams, GridToolbar, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridEventListener, GridRowId, GridSelectionModel } from '@mui/x-data-grid';


// Drag'n'Drop-kit
import { DndContext, closestCenter, MouseSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useSortable, arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import SortableItem from '../../components/VideoEditorComponents/SortableItem';
// import DataGridDemo from "./datagrid";




// import "./VideoEditor.scss";

const theme = createTheme();
const useStyles = makeStyles((theme) =>
  createStyles({
    // root: {
    //   flexGrow: 1,
    //   padding: theme.spacing(1),
    //   [theme.breakpoints.up('sm')]: {
    //     marginLeft: 240
    //   }
    // },
  })
)

// id: uidCounter,
// videoID: asset.id,
// videoName: asset.name,
// videoDuraton: asset.duration,
// videoFps: asset.fps,
// videoFrames: asset.frames,
// endFrame: asset.frames,
// trim: [0, asset.frames]
// data: asset,
// start: video

interface Asset {
  id: string,
  name: string,
  path: string,
  thumbnail_path: string,
  asset_type: string,
  view_type: string,
  file_size: number,
  duration: number,
  frames: number,
  fps: number,
  created_at: string,
  updated_at: string,
}

interface Clip {
  id: UniqueIdentifier,
  videoID: string,
  videoName: string,
  videoDuraton: number,
  videoFps: number,
  videoFrames: number,
  startFrame: number,
  endFrame: number,
  trim: [number, number]
  data: any,
  // thumbnail: any,
  // other props
}



function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton onResize={undefined} onResizeCapture={undefined} />
      <GridToolbarFilterButton onResize={undefined} onResizeCapture={undefined} />
      <GridToolbarDensitySelector onResize={undefined} onResizeCapture={undefined} />
    </GridToolbarContainer>
  );
}


const VideoEditor: React.FC = () => {

  const { projectID } = useParams<`projectID`>();

  const [project, setProject]: any = useState(undefined);

  // Navigation initialization
  const navigate = useNavigate();
  const useQuery = () => new URLSearchParams(useLocation().search);
  const param: string | null = useQuery().get('goBack');
  const goBack = !(param === null || param === undefined);

  const classes = useStyles();


  // video variables
  const [videoData, setVideoData]: any = useState(undefined);
  const [playing, setPlaying]: any = useState(false);
  var [currentVideoTime, setCurrentVideoTime]: any = useState(0);
  const [currentVideoLength, setCurrentVideoLength]: any = useState(0);
  const [videoMarks, setVideoMarks]: any = useState([]);


  // babylon variables
  const [babylonScene, setBabylonScene]: any = useState(undefined);
  const [sceneLight, setSceneLight]: any = useState(undefined);
  const [babylonCamera, setBabylonCamera]: any = useState(undefined);
  var [videoDome, setVideoDome]: any = useState(undefined);


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

  const [checked, setChecked]: any = React.useState([]);

  const handleToggle = (id: number) => () => {
    // const currentIndex = checked.indexOf(value);
    // const newChecked = [...checked];

    // if (currentIndex === -1) {
    //   newChecked.push(value);
    // } else {
    //   newChecked.splice(currentIndex, 1);
    // }

    if (checked.includes(id)) {
      setChecked(checked.filter((item: any) => item !== id));
    }
    else {
      setChecked([...checked, id]);
    }

    console.log("newchecked=" + checked)
  };




  const [currentVideo, setCurrentVideo]: any = useState(undefined);
  const [selectionModel, setSelectionModel] = React.useState<GridSelectionModel>([]);

  const onAssetSelectionReset = () => {
    setSelectionModel([]);
  };

  const assetDataColumns: GridColDef[] = [
    // {
    //   field: 'id',
    //   headerName: 'ID',
    //   width: 90,
    //   hideable: false
    // },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      editable: false,
    },
    {
      field: 'fps',
      headerName: 'FPS',
      width: 50,
      editable: false,
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 50,
      editable: false,
    },
    {
      field: 'created_at',
      headerName: 'Created at',
      type: 'string',
      width: 110,
      editable: false,
    },
    {
      field: 'play_button',
      headerName: 'Play',
      flex: 1,
      editable: false,
      sortable: false,
      renderCell: (cellValues) => {
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={(event) => {
              console.log("cellValues")
              console.log(cellValues)
              // setSelectionModel(selectionModel)
              // setCurrentVideo(event, cellValues);

              // Set the selected video as current video
              // TODO: set the current video as the selected video
            }}>
            Play
          </Button>
        )
      }
    }
  ];











  const fetchProject = async () => {
    console.log("fetching project with id: " + projectID + "")
    axios.get(`/api/project/${projectID}`)
      .then((res: any) => {
        console.log("res.data")
        console.log(res.data)
        setProject(res.data)
      })
      .catch((e) => console.log(e))
  }

  // fetchProject();
  useEffect(() => {
    fetchProject();

    console.log(projectID)
    console.log(project)
    console.log("project:" + project);
  }, []);

  const getProjectName = () => {
    if (project !== undefined) {
      return project.name
    }
  }


  const [assets, setAssets]: any = useState([]);

  const fetchAssets = async () => {
    axios.get(`/api/project/${projectID}/assets`)
      .then((res: any) => setAssets(res.data))
      .catch((e) => console.log(e))
  }

  useEffect(() => {
    fetchAssets();
    console.log("assets:" + assets);
  }, []);

  const fetchThumbnail = (assetid: any) => {
    axios.get(`/api/asset/${assetid}/thumbnail`)
      .then((res: any) => {
        console.log("THUMBNAIL")
        console.log(res.data)
        return res.data
      })
      .catch((e) => console.log(e))
  }

  const getVideoInformation = () => {
    console.log(assets);

  };

  // Add a new video to the timeline
  const addVideoToTimeline = () => {
    // getVideoInformation(checked);

    let len = selectionModel.length;

    if (selectionModel.length < 1) {
      console.log("no video selected");
      return;
    }

    // console.log("addvideototimeline")

    // Iterate over all selected videos to add them to the timeline
    selectionModel.forEach((rowid: any, index: number) => {
      console.log("rowid: " + rowid)
      const asset = assets.find((asset: any) => asset.id === rowid);

      if (asset === undefined) {
        console.log("asset is undefined")
        return
      }
      if (asset.duration === undefined || asset.fps === undefined || asset.frames === undefined) {
        console.log("asset duration, fps or frames is undefined. Metadata of the asset is incorrect. asset: " + asset + "")
        return
      }

      setClips(clips => [...clips, {
        id: uidCounter + index,
        videoID: asset.id,
        videoName: asset.name,
        videoDuraton: asset.duration,
        videoFps: asset.fps,
        videoFrames: asset.frames,
        startFrame: 0,
        endFrame: asset.frames,
        trim: [0, asset.frames],
        data: asset, //json assetdata from database
      }]);

      console.log("clips:")
      console.log(clips)

    }
    );

    setUidCounter(uidCounter + len);

    // Reset the checkbox selection.
    onAssetSelectionReset();
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
    if (assets[0] === undefined) {
      return;
    }

    if (videoDome !== undefined) {
      videoDome.dispose();
    }

    const assetPaths = assets.map((asset: any) => `/asset/${asset.path}`);

    const posterURL = `/api/asset/${assets[0].id}/thumbnail`;
    videoDome = new VideoDome(
      "videoDome",
      assetPaths,
      {
        resolution: 32,
        clickToPlay: false,
        autoPlay: false,
        loop: false,
        poster: posterURL,

      },
      babylonScene
    );
    setVideoDome(videoDome);

    // reset video transport
    setCurrentVideoLength(videoDome.videoTexture.video.duration)  //TODO make duration work
    setCurrentVideoTime(0);

    // make sure playback is updated
    videoDome.videoTexture.video.ontimeupdate = (event: any) => {
      setCurrentVideoTime(event.target.currentTime);
    };

    videoDome.videoTexture.video.onloadedmetadata = (event: any) => {
      setCurrentVideoLength(event.target.duration);
    };

    // // set video to stereoscopic or mono
    // setStereoscopic(video.view_type);

  };

  // loads video when we have fetched the video data
  useEffect(() => {
    if (assets[0] !== undefined)
      loadVideo();
  }, [assets[0]]);






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


  const trimAsset = async (start: number | undefined, end: number | undefined, input: string, output: string) => {
    axios.post(`/api/video_editor/${projectID}`,
      { trim_start: start, trim_end: end, input_path: input, output_name: output })
      .then((res: any) => {
        console.log("EXPORTED")
        console.log(res.data)
      })
      .catch((e) => console.log(e))

  }

  const framesToTime = (frames: number, fps: number) => {
    return Math.round((frames / fps) * 1000) / 1000;
  };

  const exportTimelineVideo = async () => {
    console.log("exporting timeline video");

    let trimPromises = [];

    for (let i = 0; i < clips.length; i++) {
      let ass = clips[i];
      let start = ass.trim[0];
      let end = ass.trim[1];

      // Where there is no trim, we dont want to trim
      if (start == ass.startFrame) {
        console.log("dont trim left");
        start = -1;
      } else {
        start = framesToTime(start, ass.videoFps);
      }

      if (end == ass.endFrame) {
        console.log("dont trim right");
        end = -1;
      } else {
        end = framesToTime(end, ass.videoFps);
      }

      if (start == -1 && end == -1) {
        console.log("dont trim");
        continue;
      }

      let name = ass.data.name.substr(0, ass.data.name.length - 4) + "_trimmed.mp4"
      console.log(` Start Trimming. Start=${start}, End=${end}, input_path=${ass.data.path}, output_name=${name}`)
      trimPromises.push(trimAsset(start, end, ass.data.path, name));
    }

    try {
      let results = await Promise.all(trimPromises);
      console.log("All clips have been trimmed");
      console.log(results);

      fetchAssets();

    } catch (e) {
      console.log(e);
    }
  };

  const renderTransport = () => {
    const playButton = <Button
      variant="contained"
      size="small"
      className="playButton"
      color="primary"
      startIcon={<PlayArrowIcon />}
      onClick={startVideo}
    >Play</Button>

    const stopButton = <Button
      variant="contained"
      size="small"
      className="playButton"
      color="secondary"
      startIcon={<StopIcon />}
      onClick={stopVideo}
    >Stop</Button>


    return (
      <Grid container>
        <Grid item xs={2} style={{ marginTop: 30, textAlign: 'center' }}>
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
            style={{ marginTop: 40 }}
          >

          </Slider>
        </Grid>
        <Grid item xs={2} style={{ marginTop: 30, textAlign: 'center' }}>
          <p>End: {valueLabelFormat(currentVideoLength)}</p>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          {playing ? stopButton : playButton}
        </Grid>
      </Grid>
    );
  }

  // const timelineDurationFrames = useMemo(() => {
  //   return clips.reduce((total, clip) => total + clip.endFrame, 0);
  // }, [clips]);

  const [timelineDurationFrames, setTimelineDurationFrames] = useState(0);

  useEffect(() => {
    const duration = clips.reduce((total, clip) => total + clip.endFrame, 0);
    setTimelineDurationFrames(duration);
  }, [clips]);


  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);



  const assetDataRows = assets.map((asset: Asset, index: number) => {
    return {
      id: asset.id,
      name: asset.name,
      fps: asset.fps,
      duration: asset.duration,
      created_at: asset.created_at
    }
  })

  const handleRowClick: GridEventListener<'rowClick'> = (params) => {
    console.log("row clicked params:")
    console.log(params)
  };


  return (<>
    <TopBar></TopBar>
    {/* <SideMenu activeView={View.Project} /> */}
    <div style={{
      // marginLeft: 240, 
      padding: 24
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={0} variant="outlined">
              <Grid container>
                <Grid item xs={4} justifyContent="flex-start">
                  <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => goBack ? navigate(-1) : navigate(`/app/project/${projectID}?activeTab=assets`)}>Back</Button>
                </Grid>
                <Grid item xs={4} justifyContent="center">
                  <Typography variant="h5" component="h2">
                    Project: {getProjectName()}
                  </Typography>
                </Grid>
                <Grid item xs={4} justifyContent="flex-end">
                  <Button color="primary" onClick={() => exportTimelineVideo()} sx={{
                    marginRight: 0,
                    marginLeft: 'auto',
                    display: 'block',
                  }}>Export Video</Button>
                </Grid>

              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={5} justifyContent="flex-start">
            {/* AssetViewer Container */}
            
            <Paper>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid

                  rows={assetDataRows}
                  columns={assetDataColumns}
                  // pageSize={5}
                  // rowsPerPageOptions={[5]}
                  onRowClick={handleRowClick}
                  // onselectionmodelchange={selectedRows => setSelectedAssets(selectedRows)}
                  onSelectionModelChange={setSelectionModel}
                  selectionModel={selectionModel}
                  checkboxSelection
                  disableSelectionOnClick
                  experimentalFeatures={{ newEditingApi: true }}
                  components={{
                    Toolbar: CustomToolbar,
                  }}
                />
              </div>
              <Button onClick={addVideoToTimeline}>
                ADD
              </Button>
            </Paper>

            {/* <DataGridDemo></DataGridDemo> */}
          </Grid>
          <Grid item xs={7} justifyContent="flex-end">
            {/* VideoPlayer Container */}
            <Paper style={{ padding: 10 }}>
              <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='VideoEditorCanvas' ></SceneComponent>
              {renderTransport()}
              <Slider
                min={0}
                max={100}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {/* Timeline Container */}
            <Paper sx={{
              width: '100%',
            }}>
              {/* <div style={{
              width: '90%',
              margin: 'auto',
            }}> */}


              <div style={{
                marginTop: '10px',
              }}>
                <div
                  style={{
                    backgroundColor: '#f0f0f0',
                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                    overflowX: 'auto',
                    margin: '0 auto',
                    height: 120,
                  }}
                >
                  <Slider
                    value={currentTime}
                    min={0}
                    max={timelineDurationFrames}
                    onChange={handleTimeChange}
                    valueLabelDisplay="auto"
                  />
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
                              viewZoom={0.5}
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
                      <p key={clip.id}>id={clip.id}, trim={clip.trim}</p>
                    )
                  })}
                </Box>
              </div>
              {/* </div> */}
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
      </Container>
    </div>
  </>);
};


export default VideoEditor;
