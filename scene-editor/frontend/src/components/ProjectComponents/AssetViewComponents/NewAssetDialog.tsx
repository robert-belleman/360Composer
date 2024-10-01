import React, { useState, forwardRef } from 'react';

import { concat } from 'lodash'

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import NewAssetDropzone from './NewAssetDropzone';
import { api, initHLS } from '../../../util/api';


type NewAssetDialogType = {
    activeProject: string;
    open: boolean;
    closeHandler: any;
    onAssetCreated: any;
};

const NewAssetDialog = forwardRef<HTMLDivElement, NewAssetDialogType>(({ activeProject, open, closeHandler, onAssetCreated }, ref) => {
  const [showProgress, setShowProgess] = useState(false);
  const [files, setFiles] = useState([] as any[])

  const createAsset = async () => {
    setShowProgess(true);

    const requests = files.map((file:any) => {
      const data = new FormData(); 
      // @ts-ignore: 
      data.append("file", file);
      
      return api.post(`/api/project/${activeProject}/assets?name=${file.name}`, data);
    })

    Promise.all(requests)
      .then(() => { 
        setShowProgess(false);
        setFiles([]);
        onAssetCreated();
      })
      .catch((e) => {
        if (e.message === "Request failed with status code 502") {
          setShowProgess(false);
          setFiles([]);
          onAssetCreated();
          // TODO: Display message that says HLS init is still in progress.
        } else {
          console.log(e);
        }
      });
  };

  const removeElement = (index:number) => {
    return files.reduce((acc:any[], elem:any, i:number) => {
      if (i === index) {
        return acc;
      }

      return concat(acc, elem);
    }, [])
  }

  const renderFileChips = () => files.map((file:any, i) => {
    return (
      <Grid key={`chip-${i}`} item xs={12}>
        <Chip
          size="small"
          key={`file-${i}`}
          style={{marginTop: 10, marginBottom: 10}}
          label={file.name}
          onDelete={() => setFiles(removeElement(i))}
        />
      </Grid>
    )
  })

  const addFiles = (selectedFiles:any[]) => {
    setFiles(files => [...files, ...selectedFiles])
  }

  return (
      <Dialog open={open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New Asset</DialogTitle>
        <DialogContent>
          <Grid container style={{maxHeight: '200px', width:'200px', marginBottom: '20px', overflow:'auto'}}>
            { renderFileChips() }
          </Grid>
          <NewAssetDropzone onFileSelect={addFiles} />
        </DialogContent>
        {showProgress  ? <LinearProgress /> : ""}
        <DialogActions>
          <Button onClick={() => closeHandler(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={createAsset} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
  );
});

export default NewAssetDialog;
