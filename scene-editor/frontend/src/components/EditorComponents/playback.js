export function playRecording (audioFile) {
    console.log("path = ", audioFile)
    const audio = new Audio(audioFile)
    audio.play();
}