import subprocess
from dataclasses import dataclass
from pathlib import Path
from app.config import ASSET_DIR
from app.models.asset import ViewType
from app.util.util import generate_random_filename

import ffmpeg


MAX_COMMAND_LENGTH = 8191


class VideoEditorClip:
    """Represents a single clip of an edit in the Video Editor.

    This class is responsible for parsing data from the frontend to how
    FFmpeg wants it.

    Attributes:
        filepath (str): Path to the asset.
        start_time (str): Time to start the trim.
        duration (str): Duration of the trim.
        stereo_format (str): Stereo format of the asset.
        projection_format (str): Projection format of the asset.

    Last updated: FFmpeg Version 5.1.4
    """

    def __init__(
        self,
        filepath: Path,
        start_time: str,
        duration: str,
        stereo_format: str,
        projection_format: str = None,
    ) -> None:
        self.filepath = filepath
        self.start_time = start_time
        self.end_time = self._add_float_strings(start_time, duration)
        self.stereo_format = self._parse_stereo_format(stereo_format)
        self.projection_format = projection_format

    def __str__(self):
        return (
            f"VideoEditorClip(filepath={self.filepath}, "
            f"trim={self.start_time}:{self.end_time}, "
            f"stereo_format={self.stereo_format}, "
            f"projection_format='{self.projection_format}')"
        )

    def _add_float_strings(self, float_a: str, float_b: str) -> str | None:
        """Compute the sum of two strings that can be parsed to floats.
        Return the sum as a string."""
        try:
            result = float(float_a) + float(float_b)
            return str(result)
        except ValueError:
            return None

    def _parse_stereo_format(self, stereo_format: str) -> str:
        """Parse view type from display name to ffmpeg value."""
        view_type_mappings = {
            ViewType.mono: "2d",
            ViewType.sidetoside: "sbs",
            ViewType.toptobottom: "tb",
        }

        return view_type_mappings.get(stereo_format, None)


class VideoEditorEdit:
    """Represents the entire video edit in the Video Editor.

    This class is responsible for parsing data from the frontend to how
    FFmpeg wants it.

    Attributes:
        clips (List[VideoEditorClip]): List of clips in the video edit.
        filepath (str): Path to store the output asset.
        resolution (str): Resolution of the video (separated with 'x').
        frame_rate (str): Frame rate of the output.
        stereo_format (str): Stereo format of the output.
        projection_format (str): Projection format of the output.
        video_codec (str): Codec for the video.
        audio_codec (str): Codec for the audio.

    Last updated: FFmpeg Version 5.1.4
    """

    def __init__(
        self,
        clips: list[VideoEditorClip],
        filepath: Path,
        resolution: str,
        frame_rate: str,
        stereo_format: str,
        projection_format: str,
        video_codec: str = None,
        audio_codec: str = None,
    ):
        self.clips = clips
        self.filepath = filepath
        self.width, self.height = resolution.split("x")
        self.frame_rate = frame_rate
        self.stereo_format = self._parse_stereo_format(stereo_format)
        self.projection_format = projection_format
        self.video_codec = self._parse_video_codec(video_codec)
        self.audio_codec = self._parse_audio_codec(audio_codec)

    def __str__(self):
        clips_str = ", ".join(str(clip) for clip in self.clips)
        return (
            f"VideoEditorEdit(clips={clips_str}, "
            f"filepath={self.filepath}, "
            f"resolution={self.width}:{self.height}, "
            f"frame_rate={self.frame_rate}, "
            f"stereo_format={self.stereo_format}, "
            f"projection_format='{self.projection_format}', "
            f"video_codec='{self.video_codec}', "
            f"audio_codec='{self.audio_codec}')"
        )

    def _parse_video_codec(self, codec: str) -> str:
        """Parse video codecs from display name to ffmpeg value."""
        if not codec:
            return None

        video_codec_mappings = {
            "default": "",
            "h.264 (avc)": "libx264",
            "h.265 (hevc)": "libx265",
            "vp9": "libvpx-vp9",
            "av1": "libaom-av1",
            # Add more mappings as needed
        }

        normalized_codec = codec.lower()
        return video_codec_mappings.get(normalized_codec, None)

    def _parse_audio_codec(self, codec: str) -> str:
        """Parse audio codecs from display name to ffmpeg value."""
        if not codec:
            return None

        audio_codec_mappings = {
            "default": "",
            "aac": "aac",
            "opus": "libopus",
            "vorbis": "libvorbis",
            "mp3": "libmp3lame",
            # Add more mappings as needed
        }

        normalized_codec = codec.lower()
        return audio_codec_mappings.get(normalized_codec, None)

    def _parse_stereo_format(self, stereo_format: str) -> str:
        """Parse view type from display name to ffmpeg value."""
        view_type_mappings = {
            ViewType.mono: "2d",
            ViewType.sidetoside: "sbs",
            ViewType.toptobottom: "tb",
        }

        return view_type_mappings.get(stereo_format, None)


def create_thumbnail(in_path: str, out_path: str):
    try:
        ffmpeg.input(in_path, ss=1).filter("scale", 500, -1).output(
            out_path, vframes=1
        ).run()
        return True
    except ffmpeg.Error as e:
        print(e)
        return False


def get_duration(path):
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return int(float(result.stdout))


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

    if clip.start_time and clip.end_time:
        options.extend(
            [f"trim={clip.start_time}:{clip.end_time}", "setpts=PTS-STARTPTS"]
        )
    if edit.frame_rate:
        options.append(f"framerate={edit.frame_rate}")

    return ",".join(options)


def _video_editor_audio_options(clip: VideoEditorClip) -> list[str]:
    """Specify the audio options for an input video in a complex filter graph
    of FFmpeg. The content of a clip is trimmed.
    """
    options = []

    if clip.start_time and clip.end_time:
        options.extend(
            [f"atrim={clip.start_time}:{clip.end_time}", "asetpts=PTS-STARTPTS"]
        )

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
    HlsProfile(1920, 1080, 6000, 128),
    HlsProfile(1280, 720, 3000, 128),
    HlsProfile(960, 540, 2000, 96),
)


def create_hls(inp_path: Path, output_dir: Path) -> None:
    args = (
        "ffmpeg",
        "-hide_banner",
        "-i",
        inp_path.as_posix(),
        "-preset",
        "veryfast",
        "-g",
        "30",
        "-sc_threshold",
        "0",
        "-movflags",
        "frag_keyframe+empty_moov",
    )  # fragmented MP4

    var_stream_map = []
    for i, prof in enumerate(HLS_PROFILES):
        args += ("-map", "0:0", "-map", "0:1")
        args += (
            f"-filter:v:{i}",
            f"scale={prof.width}:{prof.height}:force_original_aspect_ratio=decrease",
            f"-c:v:{i}",
            "libx264",
            f"-b:v:{i}",
            f"{prof.video_bitrate}k",
            f"-c:a:{i}",
            "aac",
            f"-b:a:{1}",
            f"{prof.audio_bitrate}k",
        )
        var_stream_map.append(f"v:{i},a:{i}")

    args += ("-var_stream_map", " ".join(var_stream_map))

    # Output
    args += (
        "-f",
        "hls",
        "-hls_time",
        "6",
        "-hls_list_size",
        "0",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_type",
        "mpegts",
        "-master_pl_name",
        f"main.m3u8",
        "-hls_segment_filename",
        f"{output_dir}/v%v-s%d.ts",
        f"{output_dir}/v%v.m3u8",
    )

    # now call ffmpeg
    subprocess.check_call(args)
