const socket = io();

const promptElem = document.querySelector('.prompt');
const runButton = document.querySelector('.run');
const output = document.querySelector('.output');
const outputText = document.querySelector('.output-text');

runButton.onclick = () => {
    socket.emit('send-prompt', promptElem.value);
    console.log(`Sent prompt "${promptElem.value}"`);
};

socket.on('run-status', status => {
    console.log(`Run status "${status}"`);

    // if the status is true, it's running, so disable the run button. else enable it
    runButton.disabled = status;

    // clear the output if we just started running
    if (status) {
        output.innerHTML = '';
        outputText.innerHTML = '';
    }
});

socket.on('stdout', line => {
    outputText.innerHTML += line;
});

socket.on('output', data => {
    const { filename, image } = data;

    const filenameElem = document.createElement('pre');
    const imageElem = new Image();
    
    filenameElem.innerHTML = filename;
    imageElem.src = `data:image/png;base64,${image}`;
    console.log(imageElem.src)

    output.append(filenameElem, imageElem);
})