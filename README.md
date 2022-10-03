# ello then

Right now the server is heavily bound to a separate repo on my PC that has a bunch of modifications from the original stable diffusion repo. Ideally the new server with flask/django should be created as a fork or something off of the original stable diffusion repo with the upscaler.

To make the new server:
- Fork OG SD [here](https://github.com/CompVis/stable-diffusion)
- Add in the modified txt2img.py and txt2imghd.py files
- Download the portable windows realesgran executable [here](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip)
- Unzip the whole directory into the root of the forked SD repo
- Convert the server to python