import React, { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import {
  useSortable,
} from '@dnd-kit/sortable';

import { styled } from "@mui/material/styles";
import { alpha } from "@mui/system";
import SliderUnstyled, {
  sliderUnstyledClasses
} from "@mui/base/SliderUnstyled";
import Card from '@mui/material/Card';

const iOSBoxShadow =
  "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)";
const ThumbBoxShadow = `1px 1px 2px rgba(0,0,0,0.3)`;
const blue = {
  100: "#DAECFF",
  200: "#99CCF3",
  400: "#3399FF",
  300: "#66B2FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75"
};

const CustomSlider = styled(SliderUnstyled)(
  ({ theme }) => `
  color: ${theme.palette.mode === "light" ? blue[500] : blue[300]};
  height: 100%;
  width: 100%;
  pointer-events: none !important;
  border-radius: 3px;
  display: inline-block;
  position: relative;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;

  & .${sliderUnstyledClasses.rail} {
    display: block;
    position: absolute;
    width: 100%;
    height: inherit;
    border-radius: inherit;
    // background: url(https://media.istockphoto.com/id/1322104312/photo/freedom-chains-that-transform-into-birds-charge-concept.jpg?b=1&s=170667a&w=0&k=20&c=-Y0krB2nXoyozDi-ZwKLfE0eDABiDxvanB-qOGqH4GU=) repeat;
    background-size: 100% 100%;
    opacity: 0.5;
  }

  & .${sliderUnstyledClasses.track} {
    // z-index: 1;
    display: block;
    position: absolute;
    height: inherit;
    border-radius: inherit;
    // background: url(https://media.istockphoto.com/id/1322104312/photo/freedom-chains-that-transform-into-birds-charge-concept.jpg?b=1&s=170667a&w=0&k=20&c=-Y0krB2nXoyozDi-ZwKLfE0eDABiDxvanB-qOGqH4GU=) repeat;
    // overflow: hidden;
    // background-color: transparant;
    // opacity: 0.4
  }

  & .${sliderUnstyledClasses.thumb} {
    z-index: 2;
    pointer-events: all !important;
    position: absolute;
    width: 4px;
    height: calc(100% + 4px);
    margin: -2px -2px 0 ;
    background-color: #fff;
    border-radius: inherit;
    box-sizing: border-box;
    box-shadow: ${ThumbBoxShadow};


    :hover,
    &.${sliderUnstyledClasses.focusVisible} {
      box-shadow: 0 0 0 0.25rem ${alpha(
    theme.palette.mode === "light" ? blue[400] : blue[300],
    0.15
  )};
    }

    &.${sliderUnstyledClasses.active} {
      box-shadow: 0 0 0 0.25rem ${alpha(
    theme.palette.mode === "light" ? blue[200] : blue[300],
    0.3
  )};
    }
  }

  & .${sliderUnstyledClasses.mark} {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 2px;
    background-color: currentColor;
    top: 50%;
    opacity: 0.7;
    transform: translateX(-50%);
  }

  & .${sliderUnstyledClasses.markActive} {
    background-color: #fff;
  }

  // & .${sliderUnstyledClasses.valueLabel} {
  //   font-family: IBM Plex Sans;
  //   font-size: 14px;
  //   display: block;
  //   position: relative;
  //   top: -1.6em;
  //   text-align: center;
  //   transform: translateX(-50%);
  // }

  & .${sliderUnstyledClasses.markLabel} {
    font-family: IBM Plex Sans;
    font-size: 12px;
    position: absolute;
    top: 20px;
    transform: translateX(-50%);
    margin-top: 8px;
  }

  &.${sliderUnstyledClasses.disabled} { 
    pointer-events: none;
    cursor: default;
  }
`
);

// Sortable Item within the ClipsContainer
function SortableItem(props: any) {


  // Clipitem functions

  const thumbnailUrl =
    "https://media.istockphoto.com/id/1322104312/photo/freedom-chains-that-transform-into-birds-charge-concept.jpg?b=1&s=170667a&w=0&k=20&c=-Y0krB2nXoyozDi-ZwKLfE0eDABiDxvanB-qOGqH4GU=";


  const [thumbValue, setThumbValue] = React.useState([props.clip.frameStart, props.clip.frameEnd]);


  const clipWidth = props.clip.frameEnd * 0.5;

  function formatDuration(currentFrame: number) {
    // const frames = props.clip.endFrame;
    const fps = props.clip.fps;

    const minute = Math.floor(currentFrame / (fps * 60)) % 60;
    const second = Math.floor(currentFrame / fps) % 60;
    const frame = currentFrame % fps;
    return `${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}:${frame < 10 ? `0${frame}` : frame}`;
  }

  // Set handles at the correct position when the thumbhandle is moved.
  const handleChange = (event: Event, newValue: number | number[]) => {
    setThumbValue(newValue as number[]);

  };


  const handleChangeEnd = (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    props.clip.trim = thumbValue;
    // TODO: Css trimmed part delete.
  };


  // SortableItem functions

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging

  } = useSortable({
    id: props.clip.id,

  });

  //  transition: {
  //   duration: 150, // milliseconds
  //   easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
  // },

  // const {
  //   transition,
  // } = useSortable({
  //   transition: {
  //     duration: 150, // milliseconds
  //     easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  //   },
  // });

  // const CustomTransition = {
  //   property: '',
  //   easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  //   duration: isDragging ? 0 : 200, // milliseconds
  // }

  const CustomTransform = transform ? {
    x: transform.x,
    // Only allow horizontal movement
    y: 1,
    scaleX: isDragging ? 0.9 : 1,
    scaleY: isDragging ? 0.9 : 1,
  } : transform

  const style = {
    transform: CSS.Transform.toString(CustomTransform),
    transition,
    // transition: CSS.Transition.toString(CustomTransition),
    padding: 4,


  };


  return (
    <div ref={setNodeRef} style={style}>
      <Card
        style={{
          overflow: "unset",
          height: "100%",
          position: "relative",
          width: clipWidth,
        }}>

        {/* This div is the transparent overlay that is used to catch the mouse events. */}
        <div

          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: 0,
            zIndex: 1,
            borderRadius: 3,
            boxSizing: "border-box",
            border: props.isSelected ? `4px solid ${blue[400]}` : "none",

          }}
          {...attributes}
          {...listeners}
          // Click event handler for selecting the clips. 
          // Because the thumbs are used for the slider, the overlay is used to catch the mouse events.
          onClick={
            event => { props.onSelect(event) }
          }
        />

        <CustomSlider
          sx={{
            position: "absolute",

            "& .MuiSlider-track": {
              backgroundImage: "url(" + thumbnailUrl + ");",
              backgroundPosition:
                -((thumbValue[0] / props.clip.frameEnd) * 100) * 0.01 * clipWidth,
              backgroundSize:
                clipWidth - thumbValue[0] / clipWidth + "px 100%",
            },
            "& .MuiSlider-rail": {
              backgroundImage: "url(" + thumbnailUrl + ");",
            },
            "& .MuiSlider-thumb": {
              display: props.isSelected ? "block" : "none",
            },
          }}
          disabled={!props.isSelected}
          value={thumbValue}
          onChange={handleChange}
          onChangeCommitted={handleChangeEnd}
          // defaultValue={60}
          // step={1} // 1 frame per step
          disableSwap
          min={0}
          max={props.clip.frameEnd}
          // marks={[{ value: 0, label: "0" }, { value: 100, label: "100" }]}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDuration}
        />

        {/* <p>Begin={value[0]}</p><p>End={value[1]}</p> */}
        {/* <p>{props.clip.trim}</p> */}
      </Card></div>
  );
}

export default SortableItem;