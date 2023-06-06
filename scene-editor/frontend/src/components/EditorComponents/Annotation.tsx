import React, {useState, useEffect} from 'react';
import axios from 'axios';

import { makeStyles, createStyles } from '@mui/styles';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';

import MuiAlert, { AlertProps } from '@mui/material/Alert';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Button } from '@mui/material';

import UpdateAnnotationDialog from "../../components/EditorComponents/UpdateAnnotationDialog";

const valueLabelFormat = (value:number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  const minutesLabel = minutes < 10 ? `0${minutes}` : minutes
  const secondsLabel = seconds < 10 ? `0${seconds}` : seconds

  return `${minutesLabel}:${secondsLabel}`
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      minWidth: 275,
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '33.33%',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    }
  })
);

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const AnnotationSnackbar = ({open, handleClose, message, severity}:any) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  )
}

type AnnotationComponentProps = {
  sceneID: string,
  annotationID: string,
  num: number,
  videoLength: number,
  onDelete: any,
  update: any,
  annotation: any,
  options: any
}

const Annotation: React.FC<AnnotationComponentProps> = ({sceneID, annotationID, videoLength, num, onDelete, update, annotation, options}: AnnotationComponentProps):React.ReactElement => {
  const classes = useStyles();

  const [alertState, setAlertState] = useState({show: false, message:"", severity: ""})
  const [annotation_, setAnnotation_] = useState(annotation);
  const [options_, setOptions_] = useState(options);

  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setAnnotation_(annotation)
  }, [annotation])

  useEffect(() => {
    if (annotation_) {
      update(annotation_)
    }
  }, [annotation_])

  const fetchAnnotation = () => {
    axios.get(`/api/scenes/${sceneID}/annotation?id=${annotationID}`)
      .then((res:any) => setAnnotation_(res.data))
      .catch((e) => console.log(e))
  }

  const fetchOptions = () => {
    //@ts-ignore
    axios.get(`/api/annotation/${annotationID}/options`)
      .then((res:any) =>res.data).then(setOptions_)
      .catch((e:any) => console.log(e))
  }

  const handleDeleteAnnotation = () => {
    axios.post(`/api/scenes/${sceneID}/annotation/delete`, {id: annotationID})
      .then(onDelete)
      .catch((e) => console.log('error while deleting annotation', e))
  }

  const closeHandler = (update:boolean) => {
    setDialogOpen(false)

    if (update) {
      fetchAnnotation();
      fetchOptions();
      setAlertState({show: true, message:"Successfully updated annotation", severity: "success"})
    }
  }

  const onError = () => {
    setAlertState({show: true, message:"Something went wrong while updating annotation", severity: "error"})
  }

  const annotationCard = () => {
    // @ts-ignore
    const text = annotation_.text;
    // @ts-ignore
    const timestamp = annotation_.timestamp;

    return (
      <Accordion square>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography className={classes.heading}>{`${num} | ${valueLabelFormat(timestamp)}`}</Typography>
          <Typography className={classes.secondaryHeading}>{text}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container>
            <Grid item xs={12}>
              <Typography color="textSecondary" variant="subtitle1">
                Options
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <List className={classes.root}>
                {options_.map((option:any, index:number) => (
                  <ListItem key={`${option.id}-${index}`}>
                    <ListItemAvatar>
                      <Avatar>
                        {index+1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={option.text} secondary={option.feedback} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12}>
              <Divider style={{marginTop: 10, marginBottom: 10}} />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={() => setDialogOpen(true)} color="primary">Edit Annotation</Button>
              <Button onClick={handleDeleteAnnotation} color="secondary">Delete Annotation</Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    )
  }

  const renderAnnotation = () => annotation_ ? (annotationCard()) : (<div></div>)

  return (
    <div>
      {renderAnnotation()}
      <UpdateAnnotationDialog
        sceneID={sceneID}
        annotationID={annotationID}
        open={dialogOpen}
        closeHandler={closeHandler}
        videoLength={videoLength}
        onError={onError}
      />
      <AnnotationSnackbar open={alertState.show} message={alertState.message} severity={alertState.severity} handleClose={() => setAlertState({...alertState, show: false})} />
    </div>
  )
}

export default Annotation;
