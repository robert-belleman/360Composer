import React, {useEffect, useState} from 'react';

import {range} from 'lodash';

import axios from 'axios';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import IconButton from "@material-ui/core/IconButton";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import Tooltip from '@material-ui/core/Tooltip';

import PeopleIcon from '@material-ui/icons/People';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';

import Skeleton from '@material-ui/lab/Skeleton';

import TimelineAddUserDialog from './TimelineAddUserDialog';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        flexGrow: 1,
        padding: theme.spacing(2),
      },
      paper: {
        padding: theme.spacing(2),
        boxSizing: 'border-box'
      },
      box: {
        flexGrow: 1
      },
      list: {
        height: 300,
        overflow: 'auto'
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#2196f3',
        marginBottom: 10
      },
      popoverPaper: {
        padding: 5
      }
    }),
  );

type UserListProps = {
  timelineID: string
}

const TimelineUserList:React.FC<UserListProps> = ({timelineID}:UserListProps) => {
  const [timelineUsers, setTimelineUsers] = useState([] as any[]);
  const [checked, setChecked] = useState([] as any[]);

  const [popoverState, setPopoverState] = React.useState<{id: string, el: HTMLElement | null}>({id: "", el: null});

  const open = Boolean(popoverState.el);

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [loadingTimelineUsers, setLoadingTimelineUsers] = useState(true);

  const classes = useStyles();

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  useEffect(() => {
    console.log('checked', checked);
  }, [checked])

  useEffect(() => {
    setLoadingTimelineUsers(true)
    fetchTimelineUsers();
  }, [])

  const deleteCheckedUsers = () => {
    axios.post(`/api/timeline/${timelineID}/customers/delete`, {ids: checked})
      .then(fetchTimelineUsers)
      .then(() => setChecked([]))
      .catch((e:any) => console.log('error while removing users', e))
  }

  const fetchTimelineUsers = () => axios.get(`/api/timeline/${timelineID}/customers`)
    .then((res:any) => setTimelineUsers(res.data.map((o:any) => o.customer)))
    .then(() => setLoadingTimelineUsers(false))
    .catch((e:any) => {console.log('error while fetching timeline users', e); setLoadingTimelineUsers(false)})

  const onUsersAdded = () => {
    setUserDialogOpen(false);
    setLoadingTimelineUsers(true);
    fetchTimelineUsers();
  }

  const handlePopoverOpen = (id:string) => (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setPopoverState({id, el: event.currentTarget});

  };

  const handlePopoverClose = () => {
    setPopoverState({id: "", el: null});
  };

  const popover = () => (
    <Popover
      id="popover"
      open={open}
      anchorEl={popoverState.el}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        className: classes.popoverPaper
      }}
    >
      <Typography variant="body1" component="p">{`localhost:3001/player/${timelineID}/${popoverState.id}`}</Typography>
    </Popover>
  )

  const renderUsers = () => {
    if (timelineUsers.length === 0) {
      return <Typography variant="subtitle1" component="p">No users have been added yet</Typography>
    }

    return timelineUsers.map((user: any) => (
      <ListItem key={user.id} button>
        <ListItemText id={user.id} primary={user.name} secondary={user.tag} />
        <ListItemSecondaryAction>
            <Checkbox
              edge="end"
              onChange={handleToggle(user.id)}
              checked={checked.indexOf(user.id) !== -1}
              inputProps={{ 'aria-labelledby': user.id }}
            />
            <Tooltip title="Share" arrow>
              <IconButton onClick={handlePopoverOpen(user.id)}>
                <ShareIcon/>
              </IconButton>
            </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    ));
  }

  const renderUsersList = () => {
    if (loadingTimelineUsers) {
      return (
        <div className={classes.list}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return (<List className={classes.list}>{renderUsers()}</List>)
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.paper}>
      <Typography variant="h4" component="p" className={classes.header}><PeopleIcon style={{marginRight:5}}/> Users</Typography>
      {renderUsersList()}
      <Grid container>
        <Grid item xs={4}>
          <Button style={{marginTop: 10}} color="primary" startIcon={<AddIcon />} onClick={() => setUserDialogOpen(true)}>Add User</Button>
        </Grid>
        <Grid item xs={2}>
          <Box className={classes.box}></Box>
        </Grid>
        <Grid item xs={6}>
          <Button
            style={{marginTop: 10}}
            color="secondary"
            startIcon={<DeleteIcon />}
            disabled={checked.length === 0}
            onClick={deleteCheckedUsers}>Remove Users</Button>
        </Grid>
      </Grid>
      <TimelineAddUserDialog
        timelineID={timelineID}
        open={userDialogOpen}
        closeHandler={() => setUserDialogOpen(false)}
        onUsersAdded={onUsersAdded}
        addedUsers={timelineUsers.map((user:any) => user.id)}
      />
      {popover()}
    </Paper>
  )
}

export default TimelineUserList;