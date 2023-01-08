import React, {useEffect, useState} from "react";
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

const VideoEditor: React.FC = () => {

    const { projectID} = useParams<`projectID`>();
    const navigate = useNavigate();
    const useQuery = () => new URLSearchParams(useLocation().search);
    const param:string|null = useQuery().get('goBack');
    const goBack = !(param === null || param === undefined);
  
    const classes = useStyles();


    const renderTop = () => (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => goBack ? navigate(-1) : navigate(`/app/project/${projectID}?activeTab=assets`)}>Back</Button>
          </Grid>
        </Grid>
      </div>
    )


    return (
        <div>
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
                      {/* <OverviewCard /> */}
                  </Grid>
                  <Grid item xs={12} md={5}>
                    {/* {renderSettings()} */}
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Grid container>
                      <Grid item xs={12}>
                        {/* {renderSceneComponent()} */}
                      </Grid>
                      <Grid item xs={12} style={{padding: 20}}>
                        {/* {renderObjectProperties()} */}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {/* <NewAnnotationDialog 
                  sceneID={scene_id!} 
                  timeStamp={currentVideoTime} 
                  open={newAssetDialogOpen} 
                  closeHandler={setNewAssetDialogOpen} 
                  onAnnotationCreated={onAnnotationCreated}
                /> */}
              </Container>
            </div>
            {/* <UpdateSceneDialog
              sceneID={scene_id!}
              scene={{name: scene ? scene.name : "", description: scene ? scene.description : ""}}
              open={updateDialogOpen}
              closeHandler={() => setUpdateDialogOpen(false)}
              onSceneUpdated={() => {setUpdateDialogOpen(false); fetchSceneData();}}
            /> */}

        </div>
    );
};

export default VideoEditor;
