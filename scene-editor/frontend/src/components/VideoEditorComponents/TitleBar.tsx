/*
Filename: TitleBar.tsx
Description:
This file describes title bar component of the video editor.
In the title bar there is a 'back' and 'export' button. There
also is a text field where the user can change the title of
the video that they are editing.
 */

import React from "react";
import { useNavigate } from "react-router-dom";

import { AppBar, TextField, Toolbar } from "@mui/material";
import { Button } from "@mui/material/";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import UpgradeIcon from "@mui/icons-material/Upgrade";

type TitleBarProps = {
  projectID: string | undefined;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
};

const TitleBar: React.FC<TitleBarProps> = ({ projectID, title, setTitle }) => {
  console.log("Title Bar Rendered");

  const navigate = useNavigate();

  /* Button component to go to the previous page. */
  const BackButton = () => (
    <Button
      color="success"
      variant="contained"
      startIcon={<ArrowBackIosIcon />}
      onClick={() => navigate(`/app/project/${projectID}?activeTab=assets`)}
    >
      Back
    </Button>
  );

  /* TextField component to change the name of the video being edited. */
  const TitleTextField = () => {
    return (
      <TextField
        size="small"
        sx={{ marginLeft: 2, marginRight: 2 }}
        placeholder="Untitled Video"
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
    );
  };

  /* Button component to save the changes made in the editor. */
  const ExportButton = () => (
    <Button
      color="success"
      variant="contained"
      startIcon={<UpgradeIcon />}
      onClick={() => console.log(title ? title : "Untitled Video")} // TODO: export
    >
      Export
    </Button>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <BackButton />
        {TitleTextField()}
        <ExportButton />
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(TitleBar);
