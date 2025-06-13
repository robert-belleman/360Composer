export function playRecording (audioFile) {
    const audio = new Audio(audioFile)
    audio.play();
}