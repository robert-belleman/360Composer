const localAudio = document.getElementById('localVideo');
let chunks = [];
let mediaRecorder;


export async function getMicRights () {
    // Calls upon logging in. Prevents the user from being asked for access to
    // their microphone mid-experience.
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

    const mediaStream = await getMediaStream();

    mediaRecorder = new MediaRecorder(mediaStream, options);
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

    localAudio.srcObject = await getMediaStream();

    mediaRecorder = new MediaRecorder(localAudio.srcObject, options);

    mediaRecorder.ondataavailable = onData;
    mediaRecorder.onstop = onStop;

    mediaRecorder.start(1200);
};

const getMediaStream = async () => {
    return await navigator.mediaDevices.getUserMedia({video: false, audio: true});
};

const onData = ({data}) => {
    // If there is new audio data, push it to the chunks array.
    if (data.size > 0) {
        chunks.push(data);
    }
};

const onStop = () => {
    // Unsets all the mediaRecorder variables.
    mediaRecorder.ondataavailable = undefined;
    mediaRecorder.onstop = undefined
    mediaRecorder = undefined;
};

export const stopRecord = async (apiCallback, tag) => {
    // If there is no mediaRecorder, return immediately.
    if (!mediaRecorder) {
        return;
    }

    mediaRecorder.stop();

    const blob = new Blob(chunks,
        {'type': mediaRecorder.mimeType});

        const formdata = new FormData();
        formdata.append('file', blob, 'file');

        apiCallback(formdata, tag);

    return blob;
};
