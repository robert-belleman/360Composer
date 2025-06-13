const localVideo = document.getElementById('localVideo');
let chunks = [];
let mediaRecorder;


export async function get_mic_rights () {
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

    mediaRecorder.ondataavailable = handleOnDataAvailable;
    mediaRecorder.onstop = handleOnStop;
};

export const startRecord = async () => {
    // necessary to ensure a NEW recording is being made
    chunks = []
    const mime = 'audio/webm';

    if (!MediaRecorder.isTypeSupported(mime)){
        alert('mimetype not supported');

        return;
    }

    const options = {
        audioBitsPerSecond: 128000,
        mimeType: 'audio/webm',
        videoBitsPerSecond: 2500000
    };

    const mediaStream = await getLocalMediaStream();
    localVideo.srcObject = mediaStream;

    mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.ondataavailable = handleOnDataAvailable;
    mediaRecorder.onstop = handleOnStop;

    mediaRecorder.start(1200);
};

const getLocalMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});

    return mediaStream
};

const handleOnDataAvailable = ({data}) => {
    if (data.size > 0) {
        chunks.push(data);
    }
};

const handleOnStop = () => {
    mediaRecorder.ondataavailable = undefined;
    mediaRecorder.onstop = undefined
    mediaRecorder = undefined;
};

export const stopRecord = async (apiCallback, tag) => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();

    const blob = new Blob(chunks,
        {'type': mediaRecorder.mimeType});

        const formdata = new FormData();
        formdata.append('file', blob, 'file');

        apiCallback(formdata, tag);

    return blob;
};
