const port = 8080;

const express = require('express');
const app = express();
app.use(express.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'output');
const previousOutputDir = path.join(__dirname, 'previous-outputs');

// const scriptPath = path.join(__dirname, 'run-stable-diffusion.bat');
const scriptPath = path.join(__dirname, 'dummy-diffusion.sh');

let running = false;

async function cleanUp(prompt) {
    const files = await fs.promises.readdir(outputDir);
    // make prompt valid filename
    const filePrefix = `${(new Date()).toISOString()}-${prompt.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, "-")}`;
    
    for (const file of files) {
        // move file to previous outputs directory
        await fs.promises.rename(path.join(outputDir, file), path.join(previousOutputDir, `${filePrefix}-${file}`))
    }
}

io.on('connection', socket => {
    socket.on('send-prompt', prompt => {
        if (running)
            return;

        const sd = spawn(scriptPath, [ prompt ]);
        running = true;
        socket.emit('run-status', true); // signal client that we're running
        // send stdout directly to client 
        sd.stdout.on('data', data => socket.emit('stdout', data.toString('utf8')));
        sd.on('exit', async () => {
            // stable diffusion is done, yoink the output images and send them
            const files = await fs.promises.readdir(outputDir);

            for( const file of files ) {
                const imagePath = path.join(outputDir, file);
                const stat = await fs.promises.stat(imagePath);
    
                if(!stat.isFile())
                    continue
                
                const image = await fs.promises.readFile(imagePath, {encoding: 'base64'});

                socket.emit('output', {
                    filename: file,
                    image
                });
            }

            running = false;
            socket.emit('run-status', false); // signal client that we finished

            // send output to previous outputs and clean up

            await cleanUp(prompt);
        });
    })
});

app.use(express.static(__dirname + '/static'));

server.listen(port, () => console.log('Listening on port', port));