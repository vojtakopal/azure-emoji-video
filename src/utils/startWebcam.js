module.exports = ({ video, canvas, defaultWidth }) => navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    try {
        video.srcObject = stream;
    } catch (error) {
        video.src = window.URL.createObjectURL(stream);
    }
    video.addEventListener('canplay', () => {
        if (!video.playing) {
            height = video.videoHeight / (video.videoWidth / defaultWidth);
            video.setAttribute('width', defaultWidth);
            video.setAttribute('height', height);
            canvas.setAttribute('width', defaultWidth);
            canvas.setAttribute('height', height);
        }
    }, false);
}).catch(err => {
    console.log("An error occured!" + err);
});