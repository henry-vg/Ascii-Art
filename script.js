const browseButton = document.getElementById('browseButton');
const button = document.getElementById('generateButton');
const image = new Image();
const asciiParagraph = document.getElementById('asciiParagraph');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
const backColorSelect = document.getElementById('backColorSelect');
const outputSizeNumber = document.getElementById('outputSizeNumber');
const fontSizeNumber = document.getElementById('fontSizeNumber');
const colorTypeSelect = document.getElementById('colorTypeSelect');
const charsText = document.getElementById('charsText');
const reverseButton = document.getElementById('reverseButton');
const restoreButton = document.getElementById('restoreButton');
let _outputSize;
let _cellSize;
let _fontSize;
let _colorType;

document.body.onload = () => {
    setBackColor();
    setDefaultChars();
}

backColorSelect.onchange = () => {
    setBackColor();
}

reverseButton.onclick = () => {
    reverseChars();
}

restoreButton.onclick = () => {
    setDefaultChars();
}

function reverseChars() {
    charsText.value = [...charsText.value].reverse().join('');
}

function setDefaultChars() {
    //$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'. 
    //@&Q0M$WB8%O#mpqdbXUwZhkaoj1ICfun]Y[x}{tlJziv()|Lcr?+/\*!<>;~^",_:-'.` 
    //@%#*+=-:. 
    charsText.value = '@&QOXj(!:.';
    if (backColorSelect.value == 'dark') {
        reverseChars();
    }
}

function setBackColor() {
    if (backColorSelect.value == 'light') {
        document.body.classList.remove('bodyDarkBg');
        document.body.classList.add('bodyLightBg');
    }
    else {
        document.body.classList.remove('bodyLightBg');
        document.body.classList.add('bodyDarkBg');
    }
}

image.onload = () => {
    _outputSize = outputSizeNumber.value;
    _cellSize = 1;
    _fontSize = fontSizeNumber.value;
    _colorType = colorTypeSelect.value;

    const imageSize = getImageSize(image, _outputSize);
    const fontRatioWidthHeight = 85 / 182;
    canvas.width = imageSize[0] / _cellSize;
    canvas.height = (imageSize[1] * fontRatioWidthHeight) / _cellSize;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const ascii = getImageAscii(canvas, context);
    const fontSize = _fontSize;

    asciiParagraph.style.fontSize = `${fontSize}px`;

    asciiParagraph.innerHTML = ascii;
}

image.onerror = () => {
    throwError();
}

button.onclick = () => {
    if (browseButton.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(browseButton.files[0]);

        reader.onload = (e) => {
            image.src = e.target.result;
        }
    }
    else {
        throwError();
    }
}

function getImageSize(image, maxSize) {
    const ratio = image.width / image.height;
    let width = maxSize;
    let height = maxSize;
    if (ratio < 1) {
        width = ratio * height;
    }
    else {
        height = (1 / ratio) * width;
    }
    return [width, height];
}

function getImageAscii(canvas, context) {
    let asciiChars = [...charsText.value].filter(x => !((['\t', '\n', '\v', '\f', '\r'].includes(x)) || ((_colorType == 'coloured' || _colorType == 'grayscale') && x == ' '))).map(function (x) {
        if (x == '<') {
            return x.replace('<', '&lt;');
        }
        if (x == '>') {
            return x.replace('>', '&gt;');
        }
        if (x == '&') {
            return x.replace('&', '<span>&</span>');
        }
        return x;
    });

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let result = '';

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = ((y * 4) * canvas.width) + x * 4;
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const alpha = pixels[index + 3] / 255;
            const average = (red + green + blue) / 3;
            const currentChar = asciiChars[Math.round((average * (asciiChars.length - 1)) / 255)];

            if (currentChar === undefined) {
                throwError();
                return '';
            }

            switch (_colorType) {
                case 'coloured':
                    result += `<span style="color: rgba(${red}, ${green}, ${blue}, ${alpha})">${currentChar}</span>`;
                    break;
                case 'grayscale':
                    result += `<span style="color: rgba(${average}, ${average}, ${average}, ${alpha})">${currentChar}</span>`;
                    break;
                default:
                    result += (alpha > 0.3) ? currentChar : ' ';
                    break;
            }
        }
        result += '\n';
    }
    return result;
}

function throwError() {
    alert('Erro no processo. Tente novamente.')
}