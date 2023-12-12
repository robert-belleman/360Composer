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


@dataclass
class VideoEditorClip:
    """Represents a single clip of an edit in the Video Editor.

    Attributes:
        filepath (str): Path to the asset.
        trim (str): Information about the trim.
        stereo_format (str): Stereo format of the asset.
        projection_format (str): Projection format of the asset.
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


def _video_editor_generate_input_options(clips: list[VideoEditorClip]):
    """Generate the input options of the FFmpeg command for the video editor.
    The asset of each clip is added to the command using the `-i` flag.
    """
    options = []

    for clip in clips:
        options.extend(["-i", clip.filepath])

    return options


def _video_editor_v360_options(clip: VideoEditorClip, edit: VideoEditorEdit):
    """Specify the filter options for the `v360` video filter of FFmpeg.
    This filter enables conversion in projection format or stereo format.
    """
    options = []

    if clip.projection_format and edit.projection_format:
        options.append(
            f"v360={clip.projection_format}:{edit.projection_format}",
        )
        if clip.stereo_format != edit.stereo_format:
            options.extend(
                [
                    f"in_stereo={clip.stereo_format}",
                    f"out_stereo={edit.stereo_format}",
                ]
            )
        options.extend([f"w={edit.width}", f"h={edit.height}"])

    return ":".join(options)


def _video_editor_video_options(clip: VideoEditorClip, edit: VideoEditorEdit):
    """Specify the video options for an input video in a complex filter graph
    of FFmpeg. The content of a clip is trimmed and the frame rate is changed.
    If the resolution could not be changed in the `v360` video filter, then
    the resolution is changed using `scale`.
    """
    options = []

    v360_options = _video_editor_v360_options(clip, edit)
    if v360_options:
        options.append(v360_options)

    if clip.trim:
        options.extend([f"trim={clip.trim}", "setpts=PTS-STARTPTS"])
    if not clip.projection_format or not edit.projection_format:
        options.extend([f"scale={edit.width}:{edit.height}", "setsar=1"])
    if edit.frame_rate:
        options.append(f"framerate={edit.frame_rate}")

    return ",".join(options)


def _video_editor_audio_options(clip: VideoEditorClip):
    """Specify the audio options for an input video in a complex filter graph
    of FFmpeg. The content of a clip is trimmed.
    """
    options = []

    if clip.trim:
        options.extend([f"atrim={clip.trim}", "asetpts=PTS-STARTPTS"])

    return ",".join(options)


def _video_editor_generate_filter_complex(edit: VideoEditorEdit):
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


def _video_editor_generate_output_options(edit: VideoEditorEdit):
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


def _run_ffmpeg_command(
    command: list[str],
    error_message="Command failed.",
):
    """Run a FFmpeg command.

    Parameters:
        command (list[str]): FFmpeg command to execute.
        error_message (str): Message to log when command execution failed.

    TODO: Use logging instead of print().
    """
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as error:
        print(f"{error_message} Error: {error.stderr}")
        return False


def ffmpeg_trim_concat_convert(edit: VideoEditorEdit):
    """Generate and execute a command that trims and concatenates each clip
    in the video edit `edit`. If a `projection_format` or `stereo_format`
    conversion is required, also include those in the command.
    """
    if not 0 < len(edit.clips):
        return False

    command = ["ffmpeg"]
    command.extend(_video_editor_generate_input_options(edit.clips))
    command.extend(_video_editor_generate_filter_complex(edit))
    command.extend(_video_editor_generate_output_options(edit))

    return _run_ffmpeg_command(
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
