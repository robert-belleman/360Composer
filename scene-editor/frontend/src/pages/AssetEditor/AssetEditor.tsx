import React, {useEffect, useState} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

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

import "./AssetEditor.scss";


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

const AssetEditor: React.FC = () => {

    const project_id = useParams<'project_id'>();
    const navigate = useNavigate();

    // Used for the 'back' button
    const useQuery = () => new URLSearchParams(useLocation().search);
    const param:string|null = useQuery().get('goBack');
    const goBack = !(param === null || param === undefined)
    
    const classes = useStyles();

    console.log(project_id)

    
    const renderTop = () => (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button color="primary" startIcon={<ArrowBackIosIcon />} onClick={() => goBack ? navigate(-1) : navigate(`/project/${project_id}?activeTab=assets`)}>Back</Button>
        </Grid>
      </Grid>
    </div>
  )

  return (
    <div>
      {/* Overgenomen uit editor.tsx */}


      {/* Left Sidebar and Topbar*/}
      <TopBar></TopBar>
      <SideMenu activeView={View.Project} />


      <div className={classes.root}>
        <Container maxWidth="xl">
          <Grid container spacing={0}>

            {/* Backbutton */}
            <Grid item xs={12}>
              <Paper elevation={0} variant="outlined" className={classes.top}>
                {renderTop()}
              </Paper>
            </Grid>

          </Grid>
        </Container>
      </div>

    </div>
  )
}





  export default AssetEditor;