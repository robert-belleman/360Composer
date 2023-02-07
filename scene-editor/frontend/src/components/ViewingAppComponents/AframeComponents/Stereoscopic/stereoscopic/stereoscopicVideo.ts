export default (AFRAME: any) => ({
    schema: {
      eye: { default: 'left', oneOf: ['left', 'right'] },
      mode: { default: 'full', oneOf: ['full', 'half'] },
      split: {default: 'horizontal', oneOf: ['horizontal', 'vertical']}
    },
  
    init() {
      const object3D = (this as any).el.object3D.children[0];
      object3D.rotation.y = Math.PI / 2;
  
      const { data } = this as any;
      const { eye, mode, split } = data;
  
      const geometry = mode === 'full'
        ? new AFRAME.THREE.SphereGeometry(100, 64, 64)
        : new AFRAME.THREE.SphereGeometry(100, 64, 64, Math.PI / 2, Math.PI, 0, Math.PI);

      const axis = data.split === 'horizontal' ? 'y' : 'x';
      const offset = data.eye === 'left' ? (axis === 'y' ? {x: 0, y: 0} : {x: 0, y: 0.5}) : (axis === 'y' ? {x: 0.5, y: 0} : {x: 0, y: 0});
      const repeat = axis === 'y' ? {x: 0.5, y: 1} : {x: 1, y: 0.5};
        
      const uvAttribute = geometry.attributes.uv;
  
    //   for (let i = 0; i < uvs.length; i += 2) {
    //     uvs[i] *= 0.5;
  
    //     if (eye === 'right') {
    //       uvs[i] += 0.5;
    //     }
    //   }
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
  
    update() {
      const { eye } = (this as any).data;
      const layer: number = eye === 'left' ? 1 : 2;
      const object3D = (this as any).el.object3D.children[0];
  
      object3D.layers.set(layer);
    },
  });