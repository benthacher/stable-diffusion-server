@echo off

@REM Make sure 1st argument is here
IF [%1]==[] exit

@REM Activate anaconda
<anaconda_dir>/Scripts/activate.bat <anaconda_dir>

@REM Move to the stable diffusion directory
cd C:\Users\Ben\Projects\ai\stable-diffusion

@REM Activate the conda environment
conda activate ldm

@REM Run stable diffusion with the first argument to this script
python scripts/txt2img.py --plms --n_samples 1 --prompt "%1"

@REM When this script exits, the new images are in the output directory