import React from "react";

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import BrightnessLowIcon from '@material-ui/icons/BrightnessLow';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';

import "./SceneSettings.scss";


type SceneSettingsProps = {
  onLightIntensityChanged: (event: any, newValue: number | number[]) => void;
  lightIntensity: number;
}

const SceneSettings: React.FC<SceneSettingsProps> = ({onLightIntensityChanged, lightIntensity}) => {
  return (
    <div className="">
        <Typography id="continuous-slider" className="sliderTitle">
            Light Intensity
        </Typography>
        <Grid container spacing={2}>
            <Grid item>
                <BrightnessLowIcon />
            </Grid>
            <Grid item xs>
                <Slider 
                    value={lightIntensity} 
                    onChange={onLightIntensityChanged} 
                    aria-labelledby="continuous-slider"
                    min={0}
                    max={1}
                    step={0.0001}
                />
            </Grid>
            <Grid item>
                <BrightnessHighIcon />
            </Grid>
      </Grid>
    </div>
  );
}

export default SceneSettings;

