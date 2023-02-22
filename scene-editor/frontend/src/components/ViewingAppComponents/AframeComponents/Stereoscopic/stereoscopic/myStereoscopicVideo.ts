export default (AFRAME: any) => ({
    schema: {
      eye: { default: 'left', oneOf: ['left', 'right'] },
      mode: { default: 'full', oneOf: ['full', 'half'] },
      stereo: {default: true, oneOf: [true, false]},
      split: {default: 'horizontal', oneOf: ['horizontal', 'vertical']}
    },

    
    init() {
      const { data } = this as any;
      if (!data.stereo) { return }
      this.createGeometry(data);
    },
  
    update(oldData: any) {
      const data = (this as any).data;
      const {_, oldMode, oldSplit, oldStereo} = oldData
      const { eye, mode, split, stereo  } = data;

      if (oldMode !== mode || oldSplit !== split || oldStereo !== stereo) {
        this.createGeometry(data);
      }
      
      const layer: number = eye === 'left' ? 1 : 2;
      const object3D = (this as any).el.object3D.children[0];
      
      object3D.layers.set(layer);
    },

    createGeometry(data: any) {
      const { eye, mode, split, stereo } = data;
      
      const object3D = (this as any).el.object3D.children[0];
      object3D.rotation.y = Math.PI / 2;
      
      const geometry = mode === 'full'
      ? new AFRAME.THREE.SphereGeometry(100, 64, 64)
      : new AFRAME.THREE.SphereGeometry(100, 64, 64, Math.PI / 2, Math.PI, 0, Math.PI);
      
      const axis = split === 'horizontal' ? 'y' : 'x';
      const offset = !stereo ? {x: 0, y: 0} : eye === 'left' ? (axis === 'y' ? {x: 0, y: 0} : {x: 0, y: 0.5}) : (axis === 'y' ? {x: 0.5, y: 0} : {x: 0, y: 0});
      const repeat = !stereo ? {x: 1, y: 1} : axis === 'y' ? {x: 0.5, y: 1} : {x: 1, y: 0.5};
      
      const uvAttribute = geometry.attributes.uv;
      
      for (let i = 0; i< uvAttribute.count; i++) {
        var u = uvAttribute.getX(i)*repeat.x + offset.x;
        var v = uvAttribute.getY(i)*repeat.y + offset.y;

        uvAttribute.setXY(i, u, v);
      }
      
      uvAttribute.needsUpdate = true;
      
      const bufferGeometry = geometry.clone();
      bufferGeometry.normalizeNormals();
      bufferGeometry.computeVertexNormals();
      
      object3D.geometry = bufferGeometry;
    },
  });