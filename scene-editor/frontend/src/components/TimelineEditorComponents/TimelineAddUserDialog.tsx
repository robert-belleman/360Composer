import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';

import {range} from 'lodash';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import Skeleton from '@mui/material/Skeleton';

import PersonIcon from '@mui/icons-material/Person';

import { api } from '../../util/api';

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

  useEffect(() => {
    fetchUsers();
  }, [open])

  const setUsersCallback = (fetchedUsers:any) => {
    const filteredUsers = fetchedUsers.filter((user:any) => addedUsers.indexOf(user.id) === -1);
    setUsers(filteredUsers);
  }

  const fetchUsers = () => {
    api.get(`/api/customer/?therapist_id=${userID}`)
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

  const addUsers = () => api.post(`/api/timeline/${timelineID}/customers`, {ids: checked})
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
        <Box sx={{ height: 300, width: 400, overflow: 'auto' }}>
          {range(6).map((elem:number) => ( <Skeleton key={elem} animation="wave" /> ))}
        </Box>
      )
    }

    return (<List sx={{ height: 300, width: 400, overflow: 'auto' }}>{users.map(createUser)}</List>)
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
