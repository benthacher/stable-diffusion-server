#!/bin/zsh

[[ -z "$1" ]] && exit

# echo dummy output
for i in {1..5}
do
    echo "Doing stuff..."
    sleep 0.3
done

echo "text 1,$(wc -c <<< \"$1\") \"$1\"" > output.txt
convert -size 100x100 xc:white -font "FreeMono" -pointsize 12 -fill black -draw @output.txt "output/output.png"
rm output.txt

echo "Done!"