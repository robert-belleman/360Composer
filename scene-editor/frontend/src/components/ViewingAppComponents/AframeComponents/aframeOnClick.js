import AFRAME from 'aframe';

AFRAME.registerComponent('onclickhandler', {
    schema: {
        index: { type: 'number', default: 0 }
    },

    init() {
        console.log("HALLO")
        this.el.addEventListener('click', () => console.log(this.el))
    },
});
