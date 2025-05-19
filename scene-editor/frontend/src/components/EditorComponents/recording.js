// THIS IS THE PROBLEM
const localVideo = document.getElementById('localVideo');
let chunks = [];
let mediaRecorder;

let saved_file;
let started_recording = false;


export async function file_test () {
    // alert("imported the js file succesfully!");
    console.log("imported the js file succesfully!");
};

export async function get_mic_rights () {
    console.log("starting record");
    const mime = 'audio/webm';

    if (!MediaRecorder.isTypeSupported(mime)){
        alert('mimetype not supported');

        return;
    }

    const options = {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm',
        videoBitsPerSecond: 2500000
    }

    const mediaStream = await getLocalMediaStream();

    mediaRecorder = new MediaRecorder(mediaStream, options);

    setListeners();
}

export async function recording_test (duration, callbackController, callback_func) {
    if (!started_recording) {
        started_recording = true;
        startRecord();
        // await delay
        // sleep(5);
        await setTimeout(stopRecord(), duration * 1000).then(res => {
            console.log("using callback in js");
            callbackController(callback_func, res);
        });
        // return res
        // return stopRecord();
    }
    // return 'OK'
    // alert("stopped recording");
}

export const startRecord = async () => {
    console.log("starting record");
    const mime = 'audio/webm';

    if (!MediaRecorder.isTypeSupported(mime)){
        alert('mimetype not supported');

        return;
    }

    const options = {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm',
        videoBitsPerSecond: 2500000
    }

    const mediaStream = await getLocalMediaStream();

    mediaRecorder = new MediaRecorder(mediaStream, options);

    setListeners();

    mediaRecorder.start(1000);
};

const getLocalMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
    localVideo.srcObject = mediaStream;

    return mediaStream
};

const setListeners = () => {
    mediaRecorder.ondataavailable = handleOnDataAvailable;
    mediaRecorder.onstop = handleOnStop;
};

const handleOnDataAvailable = ({data}) => {
    if (data.size > 0) {
        chunks.push(data);
    }
};

const handleOnStop = () => {
    saveFile();

    destroyListeners();
    mediaRecorder = undefined;
};

const destroyListeners = () => {
    mediaRecorder.ondataavailable = undefined;
    mediaRecorder.onstop = undefined
};

export const stopRecord = async () => {
    console.log("stopping record");
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    return 'OK'
};

const saveFile = () => {
        const blob = new Blob(chunks,
                        {'type': mediaRecorder.mimeType});

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // uploadBlob(blob);

    link.style = 'display: none';
    link.href = blobUrl;
    link.download = 'input.mp3';

    document.body.appendChild(link);
    // link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
    chunks = [];
    console.log("done :3");
}

function uploadBlob(audioBlob) {
    const formdata = new FormData();
    formdata.append('file', audioBlob, 'file');

    const url = new URL("http://localhost:5000/upload")
    if (!audioBlob){
        console.log("NO AUDIOBLOB!");
    }
    var response = fetch(url, {
        method: 'POST',
        body: formdata
    });

    console.log(response);
    return;
}