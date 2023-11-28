import subprocess
from dataclasses import dataclass
from pathlib import Path
from app.models.asset import ViewType
import os
import time

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


def ffmpeg_process_and_trim(
    start_time: str,
    duration: str,
    input_path: str,
    output_path: str,
    resolution: str = None,
    frame_rate: str = None,
    video_codec: str = None,
    audio_codec: str = None,
    input_stereo_format: str = None,
    output_stereo_format: str = None,
) -> bool:
    """Trim the file on `input_path` and write the result to `output_path`.
    The trim is from `start_time` to (`start_time` + `duration`).

    If any of the keyword arguments are specified, then the file is also
    processed. This is in the same function so that less re-encoding is
    required.

    # resolution / frame_rate
    Note that if the resolution or frame_rate is not specified, FFmpeg will
    use the resolution and frame rate of the first video. In addition, FFmpeg
    ignores the specified `resolution` and `frame_rate` arguments if the codec
    is specified as 'copy'.

    # codec
    Note that when no codecs are specified, FFmpeg will use the default
    behavior. The default is to attempt to copy when certain conditions
    are met. If the conditions are not met, then the output has to be
    re-encoded.

    # stereo_format
    Note that the stereo format keywords argumnts have not been tested.
    Although specifying the stereo format allows FFmpeg to work more efficient.

    Trim Flags:
        -ss  <start time>  : specify the start time of the trim.
        -t   <duration>    : specify duration of trim from `start_time`.
        -i   <input path>  : specify the input path of the file to trim.
             <output path> : specify the output path of the result.

    Process Flags:
        -vf  <options>     : specify resolution / stereo format to encode to.
        -r   <frame rate>  : specify the frame rate to encode to.
        -c:v <video codec> : specify the video codec to use in encoding.
        -c:a <audio codec> : specify the audio codec to use in encoding.

    Other Flags:
        -strict <mode> : allow experimental codecs.
    """
    vf_filter = ""

    if resolution:
        vf_filter += f"scale={resolution}"

    if input_stereo_format and output_stereo_format:
        if vf_filter:
            vf_filter += ","
        vf_filter += (
            f"v360=input_stereo_format={input_stereo_format}:"
            f"output_stereo_format={output_stereo_format}"
        )

    cmd = [
        "ffmpeg",
        "-ss", start_time,
        "-t", duration,
        "-strict", "experimental",
        "-i", input_path,
    ]

    if vf_filter:
        cmd.extend(["-vf", vf_filter])
    if frame_rate:
        cmd.extend(["-r", frame_rate])
    if video_codec:
        cmd.extend(["-c:v", video_codec])
    if audio_codec:
        cmd.extend(["-c:a", audio_codec])

    cmd.append(output_path)

    try:
        res = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(res.stdout)
        print(res.stderr)
        return True
    except subprocess.CalledProcessError as error:
        print(f"Failed to process/trim {input_path}. Error: {error.stderr}")
        return False


def ffmpeg_concat_assets(input_paths: list[str], output_path: str) -> bool:
    """Concatenate the assets in `input_paths` to `output_path`.

    Every input path is written on a newline in a temporary .txt file to
    circumvent the maximum commandline length. This temporary .txt file
    is automatically removed after the function executes.

    Flags:
        -f    <format>      : input is a concatenation of media.
        -safe <mode>        : disable safe mode to allow absolute paths.
        -i    <input path>  : specify the temporary .txt file as input.
              <output path> : specify the output path of the result.
    """
    # Generate a unique filename using a timestamp and process ID
    timestamp = int(time.time())
    process_id = os.getpid()
    temp_filenames_txt = f"/trimmed/input_{timestamp}_{process_id}.txt"

    # Create a text file with the list of video paths
    with open(temp_filenames_txt, "w", encoding="utf-8") as file:
        for path in input_paths:
            file.write(f"file '{path}'\n")

    cmd = [
        "ffmpeg",
        "-f", "concat",
        "-safe", "0",
        "-i", temp_filenames_txt,
        output_path,
    ]

    try:
        res = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(res.stdout)
        print(res.stderr)
        return True
    except subprocess.CalledProcessError as error:
        print(f"Failed to to join videos. Error: {error.stderr}")
        return False
    finally:
        try:
            os.remove(temp_filenames_txt)
        except OSError:
            pass


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
