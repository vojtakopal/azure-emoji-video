const fontPadding = 2;
const fontSize = 20;

module.exports = (context, face) => {
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
};
