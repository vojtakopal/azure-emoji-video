const compose = require('lodash/fp').compose;
const renderFaceToContext = require('./utils/renderFaceToContext');
const startWebcam = require('./utils/startWebcam');
const analyzeImage = require('./utils/analyzeImage');
const makeBlob = require('./utils/makeBlob');

const drawVideoFrame = params => {
    const { context, video, canvas } = params
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    return params;
};

const getSnapshot = ({ canvas, ...params }) => {
    const snapshot = makeBlob(canvas.toDataURL('image/png'));
    return { ...params, canvas, snapshot };
};

const renderFaces = ({ context, detectedFaces, ...params }) => {
    context.scale(-1, 1);
    context.beginPath();
    Object
        .keys(detectedFaces)
        .map(faceId => renderFaceToContext(context, detectedFaces[faceId]));
    context.stroke();
    context.closePath();
    return { ...params, detectedFaces, context };
};

const analyzeSnapshot = params => {
    const { snapshot, frameCounter, frameRate, onDetectedFaces } = params;
    if (frameCounter % frameRate === 0) {
        analyzeImage(snapshot).then(onDetectedFaces);
    }
    return params;
};

(function(container){

    const maxWidth = 960;
    const defaultWidth = Math.min(window.innerWidth, maxWidth);

    const tick = compose(
        analyzeSnapshot,
        renderFaces,
        getSnapshot,
        drawVideoFrame,
    );

    const handleButtonClick = ({ canvas, video }) => () => {
        startWebcam({ defaultWidth, video, canvas });
        video.play();
        const frameRate = Math.floor(1000 / 60);
        let frameCounter = 0;
        let detectedFaces = {};   
        const context = canvas.getContext('2d');
        setInterval(() => {
            tick({
                video,
                canvas,
                context,
                frameCounter,
                frameRate,
                detectedFaces,
                onDetectedFaces: faces => (detectedFaces = faces),
            });
            frameCounter++;
        }, frameRate);

        canvas.style.display = 'block';
        buttonWrapper.style.display = 'none';
    };

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const button = document.createElement('button');
    const buttonWrapper = document.createElement('div');

    button.setAttribute('type', 'button');
    button.className = 'btn btn-default';
    button.innerText = 'Start';
    button.addEventListener('click', handleButtonClick({ canvas, video }));

    buttonWrapper.style.padding = '1em';

    container.appendChild(video);
    container.appendChild(canvas);
    container.appendChild(buttonWrapper).appendChild(button);
    
    video.style.display = 'none';
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    canvas.style.display = 'none';

    const handleResize = () => {
        canvas.style.width = window.innerWidth;
        canvas.style.height = video.videoHeight / (video.videoWidth / window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

})(document.getElementById('app'));
