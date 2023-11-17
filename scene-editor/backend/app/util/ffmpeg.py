import subprocess
from dataclasses import dataclass
from pathlib import Path
from app.models.asset import ViewType

import ffmpeg


def create_thumbnail(in_path: str, out_path: str):
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


def ffmpeg_process_asset(input_path: str, output_path: str, format: str) -> bool:
    """Process an asset so they can be joined together later."""
    # TODO: ensure consistency in resolution, frame rate and codec.
    # TODO: ensure consistency in stereoscopy.
    command = []

    if format == ViewType.mono:
        pass
    elif format == ViewType.sidetoside:
        pass
    elif format == ViewType.toptobottom:
        pass
    else:
        print(f"Unsupported format: {format}")
        return None

    try:
        subprocess.run(command, check=True)
        return True
    except subprocess.CalledProcessError:
        print(f"Failed to process video: {input_path}")
        return False


def ffmpeg_trim_asset(start_time: str, end_time: str, input_path: str, output_path: str) -> bool:
    """Trim an asset from `input_path` to `output_path` from `start_time` to `end_time`."""
    command = []

    try:
        subprocess.run(command, check=True)
        return True
    except subprocess.CalledProcessError:
        print(f"Failed to trim video: {input_path}")
        return False


def ffmpeg_join_assets(input_paths: list[str], output_path: str) -> bool:
    """Join the assets from `filepaths` to `output_path`. """
    command = []

    try:
        subprocess.run(command, check=True)
        return True
    except subprocess.CalledProcessError:
        print(f"Failed to join videos: {input_paths}")
        return False


@dataclass
class HlsProfile:
    width: int
    height: int
    video_bitrate: int  # kbit/s
    audio_bitrate: int  # kbit/s


HLS_PROFILES = (
    HlsProfile(3840, 2160, 16000, 192),
    HlsProfile(1920, 1080,  6000, 128),
    HlsProfile(1280,  720,  3000, 128),
    HlsProfile( 960,  540,  2000, 96),
)


def create_hls(inp_path: Path, output_dir: Path) -> None:
    args = ('ffmpeg',
            '-hide_banner',
            '-i', inp_path.as_posix(),
            '-preset', 'veryfast',
            '-g', '30',
            '-sc_threshold', '0',
            '-movflags', 'frag_keyframe+empty_moov')  # fragmented MP4

    var_stream_map = []
    for i, prof in enumerate(HLS_PROFILES):
        args += ('-map', '0:0', '-map', '0:1')
        args += (f'-filter:v:{i}', f'scale={prof.width}:{prof.height}:force_original_aspect_ratio=decrease',
                 f'-c:v:{i}', 'libx264',
                 f'-b:v:{i}', f'{prof.video_bitrate}k',
                 f'-c:a:{i}', 'aac',
                 f'-b:a:{1}', f'{prof.audio_bitrate}k')
        var_stream_map.append(f"v:{i},a:{i}")

    args += ('-var_stream_map', ' '.join(var_stream_map))

    # Output
    args += ('-f', 'hls',
             '-hls_time', '6',
             '-hls_list_size', '0',
             '-hls_playlist_type', 'vod',
             '-hls_segment_type', 'mpegts',
             '-master_pl_name', f'main.m3u8',
             '-hls_segment_filename', f'{output_dir}/v%v-s%d.ts', f'{output_dir}/v%v.m3u8')

    # now call ffmpeg
    subprocess.check_call(args)
