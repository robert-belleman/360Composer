import AFRAME from 'aframe';
import { Scene, Assets, Entity } from '@belivvr/aframe-react';
import {
  stereoscopic,
  StereoscopicCamera,
  StereoscopicVideo,
} from '@belivvr/aframe-react-stereoscopic';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

type ScenePlayerProps = {
    sceneID: string;
    onSceneStart: any;
    onNextScene: any; // next scene callback
  };

const ScenePlayerComponentAframe: React.FC<ScenePlayerProps> = ({sceneID, onSceneStart, onNextScene}: ScenePlayerProps) => {
    const [rendered, setRendered] = useState<boolean>(false);

    useEffect(() => {
        setRendered(true);

        if (typeof window !== 'undefined') {
        stereoscopic(AFRAME); // Doing AFRAME.registerComponent in stereoscopic function.
        }
    }, [stereoscopic, setRendered]);

    const [scene, setScene]: any = useState(undefined);
    const [video, setVideo]: any = useState(undefined);
    
    const [annotations, setAnnotations] = useState([]);
    const [activeAnnotation, setActiveAnnotation]: any = useState(undefined);

    var [currentVideoTime, setCurrentVideoTime]: any = useState(0);
    const [currentVideoLength, setCurrentVideoLength]: any = useState(0);

    const fetchSceneData = async () => {
        axios
          .get(`/api/scenes/${sceneID}/`)
          .then((res) => {setScene(res.data)})
          .catch((e) => {
            console.log(e);
        })
    };

    const fetchVideo = async () => {
      axios.get(`/api/asset/${scene.video_id}`)
          .then((res: any) => {setVideo(res.data); onSceneStart();})
          .catch((e) => console.log(e))
    };

    const fetchAnnotations = async () => {
        axios.get(`/api/scenes/${sceneID}/annotations`)
            .then((res:any) => res.data).then(setAnnotations)
            .catch((e) => console.log(e))
    };

    useEffect(() => {
      if( sceneID !== undefined) {
            console.log(`Loading scene ${sceneID}`);
            fetchSceneData();
            fetchAnnotations();
        }
    }, [sceneID]);

    useEffect(() =>{
      if (scene !== undefined) {
        console.log(`Loading video ${scene.video_id}`);
        fetchVideo();
      }
    }, [scene])

    useEffect(() => {
        // filter annotations that are later in the video than current timestamp
        const filteredAnnotations = annotations.filter((obj: any) => {
            return obj.timestamp <= currentVideoTime;
        })
        const active: any = filteredAnnotations[filteredAnnotations.length - 1];
        if (active !== activeAnnotation) {
            setActiveAnnotation(active);
        }
    }, [currentVideoTime]);
    

    if (!rendered) {
      console.log("Unfinished")
      return <>loading</>;
    }

    if (video === undefined) {
      return <>loading video</>;
    }

    return (
        <Scene>
          <Assets>
            <video 
              id="video"
              src={"/asset/" + video?.path}
              controls
              autoPlay
              playsInline
              crossOrigin="crossorigin"
            />
          </Assets>
    
          <StereoscopicCamera
            wasdControlsEnabled={false}
            reverseMouseDrag
          >
            <Entity
              id="cursor"
              cursor-enter
              cursor-leave
              position={{x: 0, y: 0, z:-1}}
              geometry={{primitive: "ring", radiusInner: 0.01, radiusOuter: 0.02}}
              material={{color: 'white', shader: "flat"}}
              raycaster={{objects: ".clickable"}}
              animation__click={{property: "scale", startEvents: ["click"], easing: "easeInCubic", dur: 150, from: "2 2 2", to: "1 1 1"}}
              animation__fusing={{property: "scale", startEvents: ["fusing"], easing: "easeInCubic", dur: 50, from: "1 1 1", to: "2 2 2"}}
              animation__mouseleave={{property: "scale", startEvents: ["mouseleave"], easing: "easeInCubic", dur: 500, to: "1 1 1"}}
            />
          </StereoscopicCamera>
          <StereoscopicVideo
            src="#video"
            mode="full" // full or half
          />
        </Scene>
      );
};

export default ScenePlayerComponentAframe;