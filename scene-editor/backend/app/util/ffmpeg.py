import subprocess
from dataclasses import dataclass
from pathlib import Path
from app.config import ASSET_DIR
from app.models.asset import ViewType
from app.util.util import generate_random_filename

import ffmpeg


MAX_COMMAND_LENGTH = 1000


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


def get_resolution(path: Path) -> (int, int):
    """Get the width and height of a video on path `path`. In cases where the
    resolution of the file cannot be retrieved, (None, None) will be returned.
    """
    command = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=s=x:p=0",
        path,
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
        )
        print(f"ffprobe output: {result.stdout}")
        resolution = result.stdout.strip().rstrip('x').split('x')
        if len(resolution) != 2:
            print(f"Unexpected resolution format: {result.stdout}")
            return None, None

        width, height = map(int, resolution)
        return width, height
    except subprocess.CalledProcessError as e:
        print(f"Error retrieving resolution: {e}")
        return None, None


@dataclass
class VideoEditorClip:
    """Represents a single clip of an edit in the Video Editor.

    Attributes:
        filepath (str): Path to the asset.
        trim (str): Information about the trim.
        stereo_format (str): Stereo format of the asset.
        projection_format (str): Projection format of the asset.

    Notes:
      - The attributes `stereo_format` and `projection_format` should
        be set according to FFmpeg's syntax. For instance, the stereo
        format should be set to '2d' instead of mono (FFmpeg v4.4.2).
      - Format specific options for a projection format can be added
        using the colon `:` as separator. For instance, to specify a
        cubemap with a 3x2 layout and a ouput padding of 1%:

        projection_format="c3x2:out_pad=0.01"

        For further information regarding options, see the 'v360'
        video filter of FFmpeg.
    """

    filepath: str
    trim: str
    stereo_format: str
    projection_format: str = None


@dataclass
class VideoEditorEdit:
    """Represents the entire video edit in the Video Editor.

    Attributes:
        clips (List[VideoEditorClip]): List of clips in the video edit.
        filepath (str): Path to store the output asset.
        width (str): Width of the output.
        height (str): Height of the output.
        frame_rate (str): Frame rate of the output.
        stereo_format (str): Stereo format of the output.
        projection_format (str): Projection format of the output.
        video_codec (str): Codec for the video.
        audio_codec (str): Codec for the audio.
        video_bitrate (str): Bitrate of the video.
        audio_bitrate (str): Bitrate of the audio.

    Notes:
      - Attributes that are listed after the `filepath` attribute are
        options for the output. Attempts will be made to convert each
        clip in the edit to those specified attributes. If not enough
        information is provided, then no special transformations are
        performed. Instead, it will be treated as a general video.
      - The attributes `stereo_format` and `projection_format` should
        be set according to FFmpeg's syntax. For instance, the stereo
        format should be set to '2d' instead of mono (FFmpeg v4.4.2).
      - Format specific options for a projection format can be added
        using the colon `:` as separator. For instance, to specify a
        cubemap with a 3x2 layout and a ouput padding of 1%:

        projection_format="c3x2:out_pad=0.01"

        For further information regarding options, see the 'v360'
        video filter of FFmpeg.
    """

    clips: list[VideoEditorClip]
    filepath: str
    width: str
    height: str
    frame_rate: str
    stereo_format: str
    projection_format: str = None
    video_codec: str = None
    audio_codec: str = None
    video_bitrate: str = None
    audio_bitrate: str = None


def _video_editor_generate_input_options(
    clips: list[VideoEditorClip],
) -> list[str]:
    """Generate the input options of the FFmpeg command for the video editor.
    The asset of each clip is added to the command using the `-i` flag.
    """
    options = []

    for clip in clips:
        options.extend(["-i", clip.filepath])

    return options


def _video_editor_v360_options(
    clip: VideoEditorClip,
    edit: VideoEditorEdit,
) -> str:
    """Specify the filter options for the `v360` video filter of FFmpeg.
    This filter enables conversion in projection format or stereo format.
    """
    options = [f"v360=output={edit.projection_format}"]

    if clip.projection_format:
        options.append(f"input={clip.projection_format}")

    if clip.stereo_format != edit.stereo_format:
        options.extend(
            [
                f"in_stereo={clip.stereo_format}",
                f"out_stereo={edit.stereo_format}",
            ]
        )
    options.extend([f"w={edit.width}", f"h={edit.height}"])

    return ":".join(options)


def _video_editor_video_options(
    clip: VideoEditorClip,
    edit: VideoEditorEdit,
) -> list[str]:
    """Specify the video options for an input video in a complex filter graph
    of FFmpeg. The content of a clip is trimmed and the frame rate is changed.
    """
    options = []

    v360_options = _video_editor_v360_options(clip, edit)
    if v360_options:
        options.append(v360_options)

    if clip.trim:
        options.extend([f"trim={clip.trim}", "setpts=PTS-STARTPTS"])
    if edit.frame_rate:
        options.append(f"framerate={edit.frame_rate}")

    return ",".join(options)


def _video_editor_audio_options(clip: VideoEditorClip) -> list[str]:
    """Specify the audio options for an input video in a complex filter graph
    of FFmpeg. The content of a clip is trimmed.
    """
    options = []

    if clip.trim:
        options.extend([f"atrim={clip.trim}", "asetpts=PTS-STARTPTS"])

    return ",".join(options)


def _video_editor_generate_filter_complex(edit: VideoEditorEdit) -> list[str]:
    """Generate the complex filtergraph filter for the given edit `edit`."""
    filter_options = []
    labels = ""

    for i, clip in enumerate(edit.clips):
        video_label, audio_label = f"[v{i}]", f"[a{i}]"
        labels += f"{video_label}{audio_label}"

        video_filter = _video_editor_video_options(clip, edit)
        filter_options.append(f"[{i}:v]{video_filter}{video_label}")

        audio_filter = _video_editor_audio_options(clip)
        filter_options.append(f"[{i}:a]{audio_filter}{audio_label}")

    concatenate = f"{labels}concat=n={len(edit.clips)}:v=1:a=1[vout][aout]"
    filter_options.append(concatenate)
    filter_options = ";".join(filter_options)

    options = [
        "-filter_complex",
        filter_options,
        "-map",
        "[vout]",
        "-map",
        "[aout]",
    ]
    return options


def _video_editor_generate_output_options(edit: VideoEditorEdit) -> list[str]:
    """Specify the output options of the video edit `edit`."""
    options = []

    if edit.video_codec:
        options.extend(["-c:v", edit.video_codec])
    if edit.audio_codec:
        options.extend(["-c:a", edit.audio_codec])
    if edit.video_bitrate:
        options.extend(["-b:v", edit.video_bitrate])
    if edit.audio_bitrate:
        options.extend(["-b:a", edit.audio_bitrate])

    options.extend(["-strict", "experimental", edit.filepath])

    return options


def _video_editor_run_ffmpeg_command(
    command: list[str],
    error_message="Command failed.",
) -> bool:
    """Run a FFmpeg command. If the command is too long, then write the
    filter to a script instead. The command is changed to use another
    flag accordingly.

    Parameters:
        command (list[str]): FFmpeg command to execute.
        error_message (str): Message to log when command execution failed.

    TODO: Use logging instead of print().
    """
    script_path = None

    # Check if the length of the command is too long.
    if MAX_COMMAND_LENGTH < sum(map(len, map(str, command))):
        # Write the filter complex to a file.
        script_path = Path(ASSET_DIR, generate_random_filename(".txt"))
        filter_index = command.index("-filter_complex")
        filter_complex = command[filter_index + 1]
        script_path.write_text(filter_complex, encoding="utf-8")

        # Update the command to use the file.
        command[filter_index] = "-filter_complex_script"
        command[filter_index + 1] = script_path

    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as error:
        print(f"{error_message} Error: {error.stderr}")
        return False
    finally:
        # Remove the file after execution.
        if script_path and script_path.exists():
            script_path.unlink()


def ffmpeg_trim_concat_convert(edit: VideoEditorEdit) -> bool:
    """Generate and execute a command that trims and concatenates each clip
    in the video edit `edit`. If a `projection_format` or `stereo_format`
    conversion is required, also include those in the command.

    TODO:
      - The function trims the video and audio stream of an asset. A problem
        occurs when a video file does not have exactly one audio stream. For
        the videos without audio streams, an error will occur. For the other
        videos, trimming will only be performed on their first audio stream.
      - If the length of the command is too long, then the `filter_complex`
        is written to a '.txt' file. The command is then altered to use the
        new script instead of specifying the filter in-line. A problem will
        occur when too many input videos are specified. The command without
        the `filter_complex` may still exceed the maximum command length. A
        solution is to limit the number of clips that can be inside an edit
        in the frontend as well as the backend.
    """
    if not 0 < len(edit.clips):
        return False

    command = ["ffmpeg"]
    command.extend(_video_editor_generate_input_options(edit.clips))
    command.extend(_video_editor_generate_filter_complex(edit))
    command.extend(_video_editor_generate_output_options(edit))

    return _video_editor_run_ffmpeg_command(
        command,
        error_message="Failed to trim, concatenate or convert.",
    )


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
