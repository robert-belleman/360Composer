import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { makeStyles, createStyles } from '@mui/styles';
import { createTheme } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import MuiAlert, { AlertProps } from '@mui/material/Alert';

import NewUserDialog from './UserViewComponents/NewUserDialog';

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const UserSnackbar = ({open, message, severity, handleClose}:any) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  )
}

const DeleteWarningDialog = ({open, id, handleClose, handleDelete}:any) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">{"Are you sure you want to remove this user?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          All related analytics for this user will be deleted. You cannot undo this action.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="primary">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const theme = createTheme();
const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(3)
    },
    top: {
      padding: theme.spacing(2),
      boxSizing: 'border-box',
      marginBottom: 20
    },
    box: {
      flexGrow: 1
    }
  })
)

const Users = () => {
  const userID = useSelector((state:any) => state.token.id)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [warningState, setWarningState] = useState({open: false, id: ""});
  const [alertState, setAlertState] = useState({open: false, message: "", severity: ""})

  const [dialog, setDialog] = useState(false);

  const classes = useStyles();

  const handleAlertClose = () => {
    setAlertState({...alertState, open: false})
  }

  useEffect(() => {
    setLoadingUsers(true);
    fetchUsers();
  }, [])

  const fetchUsers = () => 
    axios.get(`/api/customer/?therapist_id=${userID}`)
      .then((res:any) => setUsers(res.data))
      .then(() => setLoadingUsers(false))
      .catch((e:any) => {
        setAlertState({open: true, message: "An error occured while fetching users", severity: "error"})
      })

  const deleteUser = (id:string) =>
    axios.post('/api/customer/delete', {id, therapist_id: userID})
      .then(fetchUsers)
      .then(() => setWarningState({open: false, id: ""}))
      .then(() => setAlertState({open: true, message: "Successfully deleted user", severity: "success"}))
      .catch((e:any) => {
        setWarningState({open: false, id: ""});
        setAlertState({open: true, message: "An error occured while deleting users", severity: "error"});
      })

  return (
    <div className={classes.root} >
      <Grid container>
        <Grid item xs={12}>
          <Paper elevation={0} variant="outlined" className={classes.top}>
            <Button startIcon={<AddIcon />} color="primary" onClick={() => setDialog(true)}>Add User</Button>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell >Tag</TableCell>
              <TableCell>Access Code</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user:any) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.tag}</TableCell>
                <TableCell>{user.access_code}</TableCell>
                <TableCell><IconButton
                  aria-label="delete"
                  onClick={() => setWarningState({open: true, id: user.id})}
                  size="large"><DeleteIcon /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <NewUserDialog userID={userID} open={dialog} closeHandler={() => setDialog(false)} onUserCreated={() => {setDialog(false); fetchUsers()}} />
      <DeleteWarningDialog id={warningState.id} open={warningState.open} handleDelete={() => deleteUser(warningState.id)} handleClose={() => setWarningState({open: false, id: ""})} />
      <UserSnackbar open={alertState.open} message={alertState.message} severity={alertState.severity} handleClose={handleAlertClose} />
    </div>
  );
}

export default Users;