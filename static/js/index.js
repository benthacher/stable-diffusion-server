const socket = io();

const promptElem = document.querySelector('.prompt');
const runButton = document.querySelector('.run');
const output = document.querySelector('.output');
const outputText = document.querySelector('.output-text');

function sendPrompt() {
    socket.emit('send-prompt', promptElem.value);
    console.log(`Sent prompt "${promptElem.value}"`);
}

runButton.onclick = sendPrompt;
promptElem.onkeydown = e => {
    if (e.key == 'Enter')
        sendPrompt(); 
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

function log(type='stdout') {
    return function(line) {
        // don't log if the string is empty
        if (line.trim().length == 0)
            return;
        // carriage return
        if (line.includes('\u001b[A\u001b[A') && outputText.hasChildNodes())
            outputText.removeChild(outputText.lastChild);
        
        if (line.includes('%'))
            document.title = line;

        outputText.innerHTML += `<span style="color:${type == 'stderr' ? "red" : "black"};">${line.replaceAll('\n', '')}<br></span>`;
        outputText.scrollTop = outputText.scrollHeight;
    }
}

socket.on('stdout', log('stdout'))

socket.on('stderr', log('stderr'));

socket.on('output', data => {
    const { filename, image } = data;

    const filenameElem = document.createElement('pre');
    const imageElem = new Image();
    
    filenameElem.innerHTML = filename;
    imageElem.src = `data:image/png;base64,${image}`;
    console.log(imageElem.src)

    output.append(filenameElem, imageElem);
})