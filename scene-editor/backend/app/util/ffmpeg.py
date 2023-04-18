import subprocess
from pathlib import Path
from dataclasses import dataclass

import ffmpeg


def create_thumbnail(in_path, out_path):
    try:
        ffmpeg.input(in_path, ss=1) \
              .filter('scale', 500, -1) \
              .output(out_path, vframes=1) \
              .run()
        return True
    except ffmpeg.Error as e:
        print(e)
        return False


def get_duration(path):
    result = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                             "format=duration", "-of",
                             "default=noprint_wrappers=1:nokey=1", path],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT)
    return int(float(result.stdout))


@dataclass
class HlsProfile:
    width: int
    height: int
    name: str
    video_bitrate: int
    audio_bitrate: int


HLS_PROFILES = (
    HlsProfile(3840, 2160, 'main', 16000, 192),
    HlsProfile(1920, 1080, 'main',  6000, 192),
    HlsProfile(1280,  720, 'main',  3000, 128),
    HlsProfile( 960,  540, 'main',  2000, 128),
    HlsProfile( 768,  432, 'main',  1000,  96),
)


def create_hls(inp_path: Path):
    args = ['ffmpeg',
            '-i', inp_path.as_posix()]

    filters = []

    # Build the concatenate filter chain
    filters.append('[0:v][0:a] concat=n=1:v=1:a=1 [vconcat][aconcat]')

    # Build the video split filter chain
    temp = f'[vconcat] split={len(HLS_PROFILES)} '
    temp += ''.join(f'[vsplit{i}]' for i in range(len(HLS_PROFILES)))
    filters.append(temp)

    # Build the audio split filter chain
    temp = f'[aconcat] asplit={len(HLS_PROFILES)} '
    temp += ''.join(f'[asplit{i}]' for i in range(len(HLS_PROFILES)))
    filters.append(temp)

    # Build the rescale filter chain (one per output)
    for i, prof in enumerate(HLS_PROFILES):
        filters.append(f'[vsplit{i}] scale={prof.width}:{prof.height}:force_original_aspect_ratio=decrease [vscale{i}]')

    args += ('-filter_complex', ";".join(filters))

    # Output
    for i, prof in enumerate(HLS_PROFILES):
        args += ('-map', f'[vscale{i}]',
                 '-map', f'[asplit{i}]',
                 '-c:a', 'aac',
                 '-c:v', 'h264',
                 '-profile:v', prof.name,
                 '-b:v', str(prof.video_bitrate),
                 '-b:a', str(prof.audio_bitrate),
                 '-movflags', '+faststart',
                 '-hls_time', '4',
                 '-hls_list_size', '0',
                 '-hls_playlist_type', 'vod',
                 '-hls_segment_type', 'mpegts',
                 '-master_pl_name', 'main.m3u8')

        name_prefix = '.'.join(inp_path.as_posix().split('.')[:-1])
        args.append(f'{name_prefix}-{prof.height}.m3u8')

    # now call ffmpeg
    subprocess.check_call(args)
