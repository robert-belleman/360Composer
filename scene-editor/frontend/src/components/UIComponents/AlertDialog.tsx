import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type AlertDialogProps = {
  onClose: (agree:boolean) => void,
  open: boolean,
  title?: string,
  message?: string,
  agreeButtonText?: string,
  disagreeButtonText?: string,
}

const AlertDialog : React.FC<AlertDialogProps> = (props) => {
  const { onClose, 
          open = false,
          title = "Do you wish to proceed?",
          message = "",
          agreeButtonText = "Yes",
          disagreeButtonText = "No", } = props;

  const handleClose = (agree:boolean) => {
    onClose(agree);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>{handleClose(true)}}>{agreeButtonText}</Button>
        <Button onClick={()=>{handleClose(false)}} autoFocus>{disagreeButtonText}</Button>
      </DialogActions>
    </Dialog>
  );
}


export default AlertDialog