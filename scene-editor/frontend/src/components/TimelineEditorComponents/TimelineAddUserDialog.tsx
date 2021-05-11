import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import {range} from 'lodash';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Skeleton from '@material-ui/lab/Skeleton';

import PersonIcon from '@material-ui/icons/Person';

import axios from "axios";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      height: 300,
      width: 400,
      overflow: 'auto'
    }
  })
);

type NewAssetDialog = {
    timelineID: string;
    open: boolean;
    closeHandler: any;
    onUsersAdded: any;
    addedUsers:string[];
};

const NewAssetDialog: React.FC<NewAssetDialog> = ({timelineID, open, closeHandler, onUsersAdded, addedUsers}) => {
  const userID = useSelector((state:any) => state.token.id)

  const [users, setUsers] = useState([] as any);
  const [checked, setChecked] = useState([] as any[]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    fetchUsers();
  }, [open])

  const setUsersCallback = (fetchedUsers:any) => {
    const filteredUsers = fetchedUsers.filter((user:any) => addedUsers.indexOf(user.id) === -1);
    setUsers(filteredUsers);
  }

  const fetchUsers = () => {
    axios.get(`/api/customer/?therapist_id=${userID}`)
      .then((res:any) => setUsersCallback(res.data))
      .then(() => setLoadingUsers(false))
      .catch((e:any) => {console.log('error while fetching users', e); setLoadingUsers(false)})
  }

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

  const addUsers = () => axios.post(`/api/timeline/${timelineID}/customers`, {ids: checked})
    .then(onUsersAdded)
    .then(() => setChecked([]))
    .catch((e:any) => console.log('something went wrong while adding users', e))

  const createUser = (user:any) => (
    <ListItem key={user.id} button>
      <ListItemAvatar>
        <Avatar><PersonIcon/></Avatar>
      </ListItemAvatar>
      <ListItemText id={user.id} primary={user.name} secondary={user.tag} />
      <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={handleToggle(user.id)}
            checked={checked.indexOf(user.id) !== -1}
            inputProps={{ 'aria-labelledby': user.id }}
            color="primary"
          />
      </ListItemSecondaryAction>
    </ListItem>
  )

  const renderUserList = () => {
    if (loadingUsers) {
      return (
        <div className={classes.list}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </div>
      )
    }

    return (<List className={classes.list}>{users.map(createUser)}</List>)
  }

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Users</DialogTitle>
        <DialogContent>
          {renderUserList()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {closeHandler(false);}} color="primary">
            Cancel
          </Button>
          <Button onClick={addUsers} color="primary">
            Add Users
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default NewAssetDialog;
