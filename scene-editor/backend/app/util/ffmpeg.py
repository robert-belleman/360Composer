import subprocess
from dataclasses import dataclass
from pathlib import Path
from app.models.asset import ViewType

import ffmpeg


# The maximum number of characters a commandline command may have.
MAX_COMMAND_LENGTH = 8191


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


def ffmpeg_trim_concat(
    input_paths: list[str],
    output_path: str,
    trims: list[str],
    resolution: str = None,
    frame_rate: str = None,
    video_codec: str = None,
    audio_codec: str = None,
    bitrate: str = None,
):
    """Trim each file in `input_paths` and concatenate them. Put the
    result in `output_path`. Note that if only a single file is given,
    then that file it trimmed and stored in `output_path`.

    # Trims
    The trims are performed according to the given list of strings `trims`,
    where each string should take one of the following forms:
        '<start_time>:<end_time>',
        '<start_time>:duration<duration>'.

    # Keyword Arguments
    The function will process the videos to use the given resolution,
    frame rate, video codec, audio codec and bitrate. If these arguments
    are omitted, then FFmpeg will use its default behavior. This often
    means that it will use the parameters of the first video.

    # Limitations
    The commandline has a maximum length that depends on the operating
    system. The function will return False when the length of the command
    exceeds the length of MAX_COMMAND_LENGTH.

    Assuming that someone uses all 128 available characters for all their
    assets they want to trim and concatenate, then each asset will add
    approximately 320 characters to the total length of the command. If
    we use the limit of the Windows operating system in this example, then
    someone requested to trim and concatenate 8191 / 320 ≈ 25 assets. This
    is an absurd amount and will therefore be considered as an attack and
    be ignored.

    Returns:
        True on succes, False otherwise.
    """
    if not input_paths or not trims:
        print("Input paths or trims are empty. Nothing to process.")
        return False

    cmd = ["ffmpeg"]

    # Generate the filter_complex string.
    labels = ""
    filter_complex = ""
    for i, trim in enumerate(trims):
        cmd.extend(["-i", input_paths[i]])

        video_label, audio_label = f"[v{i}]", f"[a{i}]"
        labels += f"{video_label}{audio_label}"

        # Trim video stream.
        filter_complex += f"[{i}:v]"
        if trim:
            filter_complex += f"trim={trim},setpts=PTS-STARTPTS,"
        if resolution:
            filter_complex += f"scale={resolution},setsar=1,"
        if frame_rate:
            filter_complex += f"framerate={frame_rate}"
        filter_complex += f"{video_label};"

        # Trim audio stream.
        filter_complex += f"[{i}:a]"
        if trim is not None:
            filter_complex += f"atrim={trim},asetpts=PTS-STARTPTS"
        filter_complex += f"{audio_label};"
    filter_complex += f"{labels}concat=n={len(trims)}:v=1:a=1[vout][aout]"

    # Apply filters and options for the output.
    cmd.extend(
        [
            "-filter_complex", filter_complex,
            "-map", "[vout]",
            "-map", "[aout]",
        ]  # fmt: skip
    )
    if video_codec:
        cmd.extend(["-c:v", video_codec])
    if audio_codec:
        cmd.extend(["-c:a", audio_codec])
    if bitrate:
        cmd.extend(["-b:a", bitrate])
    cmd.extend(["-strict", "experimental", output_path])

    # Check the total length of the command.
    total_cmd_length = sum(len(arg) for arg in cmd)
    if total_cmd_length > MAX_COMMAND_LENGTH:
        print("Command is too long.")
        return False

    try:
        res = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(res.stdout)
        print(res.stderr)
        return True
    except subprocess.CalledProcessError as error:
        print(f"Failed to trim and concat. Error: {error.stderr}")
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
