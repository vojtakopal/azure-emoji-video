(function(container){

    let detectedFaces = {};
    let context;

    const fontPadding = 2;
    const fontSize = 20;
    const defaultWidth = 320;

    const startWebcam = ({ video, canvas }) => navigator.mediaDevices.getUserMedia({
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

    const renderFace = face => {
        const { top, left, width, height, age, gender, emotion } = face;
        const majorEmotion = Object.keys(emotion).reduce((acc, name) => emotion[name] > acc.value ? { name, value: emotion[name] } : acc, { name: 'none', value: 0 });
        const barHeight = 2*fontPadding+fontSize;

        context.rect(left, top, width, height);

        // top
        context.fillStyle = 'black';
        context.fillRect(left, top-barHeight, width, barHeight);
        context.font = `bold ${fontSize}px verdana, sans-serif`;
        context.fillStyle = 'white';
        context.fillText(majorEmotion.name, left+fontPadding, top-fontPadding);

        // bottom
        context.fillStyle = 'black';
        context.fillRect(left, top+height, width, barHeight);
        context.font = `bold ${fontSize}px verdana, sans-serif`;
        context.fillStyle = 'white';
        context.fillText(`${age}, ${gender}`, left+fontPadding, top+height+fontSize);
    }

    const takeSnapshot = ({ video, canvas }) => {
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        const snapshot = makeBlob(canvas.toDataURL('image/png'));
        context.scale(-1, 1);
        context.beginPath();
        Object
            .keys(detectedFaces)
            .map(faceId => renderFace(detectedFaces[faceId]));
        context.stroke();
        context.closePath();
        return snapshot;
    };

    const makeBlob = dataURL => {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);
            return new Blob([raw], { type: contentType });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    };

    const analyzeImage = body => (
        fetch('/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body,
        }).then(
            response => response.json(),
        ).then(
            faces => (
                detectedFaces = faces.reduce((acc, face) => ({ ...acc, [face.faceId]: { ...face.faceRectangle, ...face.faceAttributes } }), {})
            ),
        )
    );

    const handleButtonClick = ({ canvas, video }) => () => {
        startWebcam({ video, canvas });
        video.play();
        const frameRate = Math.floor(1000 / 60);
        let frameCounter = 0;
        setInterval(() => {
            const snapshot = takeSnapshot({ video, canvas });
            if (frameCounter % frameRate === 0) {
                analyzeImage(snapshot);
            }
            frameCounter++;
        }, frameRate);
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

    context = canvas.getContext('2d');

})(document.getElementById('app'));
