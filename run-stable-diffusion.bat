@echo off
@REM Make sure 1st argument is here
if [%1]==[] goto :eof

@REM Activate anaconda
call C:\Users\Ben\anaconda3\Scripts\activate.bat C:\Users\Ben\anaconda3

@REM Move to the stable diffusion directory
cd "C:\Users\Ben\Projects\ai\stable-diffusion"

@REM Activate the conda environment
call conda activate ldm

@echo on
@REM Run stable diffusion with the first argument to this script
python scripts/txt2imghd.py --W 512 --H 512 --n_iter 5 --seed 7000 --prompt %1 

@REM When this script exits, the new images are in the output directory