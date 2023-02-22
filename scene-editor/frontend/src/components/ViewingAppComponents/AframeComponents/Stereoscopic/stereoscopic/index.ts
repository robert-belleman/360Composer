import stereoscopicCamera from './stereoscopicCamera';
import stereoscopicVideo from './stereoscopicVideo';
import myStereoscopicVideo from './myStereoscopicVideo';

export default (AFRAME: any) => {
  AFRAME.registerComponent('stereoscopic-camera', stereoscopicCamera);
  AFRAME.registerComponent('stereoscopic-video', stereoscopicVideo(AFRAME));
  AFRAME.registerComponent('my-stereoscopic-video', myStereoscopicVideo(AFRAME));
};