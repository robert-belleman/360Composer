Download the video from YouTube (3840x2160 VP9 + opus audio):

```
yt-dlp -f 313+251 -o yt.webm 'https://www.youtube.com/watch?v=r8f4J80Z9eY'
```

Convert from YouTube's special format:

```
ffmpeg \
-y \
-hide_banner \
-i yr.webm \
-vf "v360=c3x2:e:cubic:in_forder='lfrdbu':in_frot='000313',scale=3840:1920,setsar=1:1" \
-pix_fmt yuv420p -c:v libx264 -preset faster -crf 21 \
-c:a copy -ss 16 -t 10 -movflags +faststart \
output.mp4
```

Source: http://paulbourke.net/panorama/youtubeformat/
