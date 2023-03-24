import stereoscopicCamera from './stereoscopicCamera';
import myStereoscopicVideo from './myStereoscopicVideo';

export default (AFRAME: any) => {
  AFRAME.registerComponent('stereoscopic-camera', stereoscopicCamera);
  AFRAME.registerComponent('my-stereoscopic-video', myStereoscopicVideo(AFRAME));
};