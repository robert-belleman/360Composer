import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { range } from 'lodash';

import axios from 'axios';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid'

import Skeleton from '@material-ui/lab/Skeleton';

import AddIcon from '@material-ui/icons/Add';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import placeholder from '../static/images/placeholder.jpg'

import NewProjectDialog from "./SideMenuComponents/NewProjectDialog";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        flexGrow: 1,
        padding: theme.spacing(2),
    }
  })
)

const ProjectOverview : React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [projects, setProjects] = useState([]);

  const classes = useStyles();

  const history = useHistory();

  const token = useSelector((state:any) => state.token);

  useEffect(() => {
    fetchProjects();
  }, [])

  const fetchProjects = async () => {
    setLoading(true);
    axios.get(`/api/user/${token.id}/projects`)
      .then((res) => setProjects(res.data))
      .then(() => setLoading(false))
      .catch((e) => console.log('error while fetching projects', e));
  };

  const onProjectCreated = () => {
    setOpenProjectDialog(false);
    fetchProjects();
  };

  const renderProject = (project:any) => (
    <Grid item xs={12} md={4} lg={3} key={project.id}>
      <Card variant="outlined">
        <CardActionArea>
          <CardMedia
            component="img"
            alt={project.name}
            image={placeholder}
            title={project.name}
            height={100}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {project.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {project.updated_at}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary" onClick={() => history.push(`/project/${project.id}`)}>
            Edit
          </Button>
        </CardActions>
      </Card>
    </Grid>
  )

  const renderProjects = () => {
    if (projects.length == 0) {
      return <Typography style={{marginLeft: 10}} gutterBottom variant="h5" component="h2">No projects have been added yet</Typography>
    }

    return projects.map(renderProject);
  }

  const renderLoading = () => range(4).map((i:number) => (
    <Grid item xs={12} md={4} lg={3} key={i}>
      {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
    </Grid>
  ))

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setOpenProjectDialog(true)}
            startIcon={<AddIcon />}
          >
            Add Project
          </Button>
        </Grid>

        { loading ? renderLoading() : renderProjects() }
      </Grid>
      <NewProjectDialog open={openProjectDialog} closeHandler={() => setOpenProjectDialog(false)} onProjectCreated={onProjectCreated} />
    </div>
  )
}

export default ProjectOverview