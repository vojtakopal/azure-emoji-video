module.exports = body => (
    fetch('/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        body,
    }).then(
        response => response.json(),
    ).then(
        faces => faces.reduce((acc, face) => ({ ...acc, [face.faceId]: { ...face.faceRectangle, ...face.faceAttributes } }), {}),
    )
);
