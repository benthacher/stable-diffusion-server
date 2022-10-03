const port = 8080;

const express = require('express');
const app = express();
app.use(express.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const spawnAsync = require('await-spawn');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { exit } = require('process');

const outputDir = path.join(__dirname, '..\\stable-diffusion\\outputs\\txt2img-samples\\samples');
const previousOutputFolder = 'previous-outputs'
const previousOutputDir = path.join(__dirname, 'static', previousOutputFolder);

const scriptPath = path.join(__dirname, 'run-stable-diffusion.bat');
const gdrivePath = path.join(__dirname, 'gdrive.exe');
// const scriptPath = path.join(__dirname, 'dummy-diffusion.sh');

let running = false;

async function cleanUp(prompt) {
    const files = await fs.promises.readdir(outputDir);
    // make prompt valid filename
    const filePrefix = `${Date.now()}-${prompt.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, "-")}`;
    
    for (const file of files) {
        // move file to previous outputs directory
        const newPath = path.join(previousOutputDir, `${filePrefix}-${file}`.slice(0, 250));
        await fs.promises.rename(path.join(outputDir, file), newPath);

        // upload the newly renamed file
        await spawnAsync(gdrivePath, `upload --parent 13nAqtR0R9s3Xzd8KZQjKLlQ-MD-xZewI ${newPath}`.split(' '));
    }
}

io.on('connection', socket => {
    socket.on('send-prompt', prompt => {
        if (running) {
            socket.emit('stderr', 'Already running somewhere else... I\'M BUSY!\n');
            return;
        }

        const sd = spawn(scriptPath, [ prompt ]);
        running = true;

        console.log(`Generating with prompt '${prompt}'`);
        socket.emit('run-status', true); // signal client that we're running
        // send stdout directly to client 
        sd.stdout.on('data', data => socket.emit('stdout', data.toString('utf8')));
        sd.stderr.on('data', data => socket.emit('stderr', data.toString('utf8')));
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

                // upload image to 
            }

            running = false;
            socket.emit('run-status', false); // signal client that we finished

            // send output to previous outputs and clean up

            await cleanUp(prompt);
        });
    });

    socket.on('get-image-paths', async () => {
        const files = await fs.promises.readdir(previousOutputDir);
        let paths = [];

        for( const file of files ) {
            const imagePath = path.join(previousOutputDir, file);
            const stat = await fs.promises.stat(imagePath);

            if(!stat.isFile())
                continue
            
            paths.push(path.join(previousOutputFolder, file));
        }

        socket.emit('image-paths', paths);
    });
});

app.use(express.static(__dirname + '/static'));

server.listen(port, () => console.log('Listening on port', port));