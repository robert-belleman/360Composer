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


def parse_stereo_format(stereo_format: str) -> str:
    """Parse view type from display name to ffmpeg value."""
    view_type_mappings = {
        ViewType.mono: "2d",
        ViewType.sidetoside: "sbs",
        ViewType.toptobottom: "tb",
    }

    return view_type_mappings.get(stereo_format, None)


class VideoEditorClip:
    """Acts as a dataclass that stores the information of a single video edit.
    Information includes the start and end time of a trim and the current
    stereo and projection formats. Note that this is implemented as a class
    so that all parsing from data to FFmpeg is centralised.

    Attributes:
        filepath (str): Path to the asset.
        start_time (str): start time of the trim.
        end_time (str): end time of the trim.
        width (str): width of the asset.
        height (str): height of the asset.
        stereo_format (str): Stereo format of the asset.
        projection_format (str): Projection format of the asset.

    """

    def __init__(
        self,
        filepath: Path,
        start_time: str,
        duration: str,
        width: str,
        height: str,
        stereo_format: str,
        projection_format: str = None,
    ) -> None:
        self.filepath = filepath
        self.start_time = start_time
        self.end_time = self._add_float_strings(start_time, duration)
        self.width, self.height = width, height
        self.stereo_format = parse_stereo_format(stereo_format)
        self.projection_format = projection_format

    def __str__(self):
        return (
            f"VideoEditorClip(filepath={self.filepath}, "
            f"trim={self.start_time}:{self.end_time}, "
            f"stereo_format={self.stereo_format}, "
            f"projection_format={self.projection_format})"
        )

    def _add_float_strings(self, float_a: str, float_b: str) -> str | None:
        """Compute the sum of two strings that can be parsed to floats.
        Return the sum as a string."""
        try:
            result = float(float_a) + float(float_b)
            return str(result)
        except ValueError:
            return None


class VideoEditorEdit:
    """Acts as a dataclass that stores the information to perform a video edit.
    Information can be divided into the input clips and the output options.
    Note that this is implemented as a class so that all parsing from data to
    FFmpeg is centralised.

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

    """

    def __init__(
        self,
        clips: list[VideoEditorClip],
        filepath: Path,
        width: str,
        height: str,
        frame_rate: str,
        stereo_format: str,
        projection_format: str = None,
        video_codec: str = None,
        audio_codec: str = None,
    ):
        self.clips = clips
        self.filepath = filepath
        self.width, self.height = width, height
        self.frame_rate = frame_rate
        self.stereo_format = parse_stereo_format(stereo_format)
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
            f"projection_format={self.projection_format}, "
            f"video_codec={self.video_codec}, "
            f"audio_codec={self.audio_codec})"
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

    def _generate_input_options(self) -> list[str]:
        """Generate the input option of the FFmpeg command. The asset of
        each clip is added to the command using the `-i` flag."""
        options = []

        for clip in self.clips:
            options.extend(["-i", clip.filepath])

        return options

    def _generate_v360_options(self, clip: VideoEditorClip) -> str:
        """Specify the filter options for the `v360` video filter of FFmpeg.
        This filter enables conversion in projection or stereo format."""
        options = [f"v360=output={self.projection_format}"]

        if clip.projection_format is not None:
            options.append(f"input={clip.projection_format}")

        if clip.stereo_format != self.stereo_format:
            options.extend(
                [
                    f"in_stereo={clip.stereo_format}",
                    f"out_stereo={self.stereo_format}",
                ]
            )
        options.extend([f"w={self.width}", f"h={self.height}"])

        return ":".join(options)

    def _generate_video_options(self, clip: VideoEditorClip) -> list[str]:
        """Specify the video options for an input video. The content of
        a clip is trimmed and the frame rate is changed."""
        options = []

        # Trim the input before applying filters (does not decode).
        if clip.start_time is not None and clip.end_time is not None:
            trim = f"{clip.start_time}:{clip.end_time}"
            options.extend([f"trim={trim}", "setpts=PTS-STARTPTS"])

        # Apply video filters (does decode).
        if self.frame_rate is not None:
            options.append(f"framerate={self.frame_rate}")
        v360_options = self._generate_v360_options(clip)
        if v360_options:
            options.append(v360_options)

        return ",".join(options)

    def _generate_audio_options(self, clip: VideoEditorClip) -> list[str]:
        """Specify the audio options for an input video. The content of
        a clip is trimmed."""
        options = []

        if clip.start_time is not None and clip.end_time is not None:
            trim = f"{clip.start_time}:{clip.end_time}"
            options.extend([f"atrim={trim}", "asetpts=PTS-STARTPTS"])

        return ",".join(options)

    def _generate_filter_complex(self) -> list[str]:
        """Generate the complex filtergraph filter for the given
        edit `edit`."""
        filter_options = []
        labels = ""

        for i, clip in enumerate(self.clips):
            video_label, audio_label = f"[v{i}]", f"[a{i}]"
            labels += f"{video_label}{audio_label}"

            video_filter = self._generate_video_options(clip)
            filter_options.append(f"[{i}:v]{video_filter}{video_label}")

            audio_filter = self._generate_audio_options(clip)
            filter_options.append(f"[{i}:a]{audio_filter}{audio_label}")

        concatenate = f"{labels}concat=n={len(self.clips)}:v=1:a=1[vout][aout]"
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

    def _generate_output_options(self) -> list[str]:
        """Specify the output options of the video edit `edit`."""
        options = []

        if self.video_codec:
            options.extend(["-c:v", self.video_codec])
        if self.audio_codec:
            options.extend(["-c:a", self.audio_codec])

        options.extend(["-strict", "experimental", self.filepath])

        return options

    def _run_command(
        self,
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

    def _requires_reencoding(self) -> bool:
        return any(
            clip.width != self.width
            or clip.height != self.height
            or clip.stereo_format != self.stereo_format
            or (
                clip.projection_format
                and clip.projection_format != self.projection_format
            )
            for clip in self.clips
        )

    def _trim_using_streamcopy(
        self,
        clip: VideoEditorClip,
        output_path: Path,
    ) -> bool:
        command = ["ffmpeg"]
        command.extend(["-ss", clip.start_time])
        command.extend(["-to", clip.end_time])
        command.extend(["-i", clip.filepath])
        command.extend(["-map", "0"])
        command.extend(["-c", "copy"])
        command.append(output_path)

        try:
            res = subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
            )
            print(res.stdout)
            print(res.stderr)
            return True
        except subprocess.CalledProcessError as error:
            print(f"Failed to trim {clip.filepath}. Error: {error.stderr}")
            return False

    def _concat_using_streamcopy(self, input_paths: list[Path]) -> bool:
        textfile_path = Path(ASSET_DIR, generate_random_filename(".txt"))

        # Create a text file with the list of video paths
        with open(textfile_path, "w", encoding="utf-8") as file:
            for path in input_paths:
                file.write(f"file '{path}'\n")

        command = ["ffmpeg"]
        command.extend(["-f", "concat"])
        command.extend(["-safe", "0"])
        command.extend(["-i", textfile_path])
        command.extend(["-c", "copy"])
        command.append(self.filepath)

        try:
            res = subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
            )
            print(res.stdout)
            print(res.stderr)
            return True
        except subprocess.CalledProcessError as error:
            print(f"Failed to to join videos. Error: {error.stderr}")
            return False
        finally:
            textfile_path.unlink()
            for path in input_paths:
                Path(ASSET_DIR, path).unlink()

    def ffmpeg_trim_concat_convert(self, allow_copy: bool = True) -> bool:
        """Generate and execute a command that trims and concatenates each clip
        in the video edit `edit`. If a `projection_format` or `stereo_format`
        conversion is required, also include those in the command.

        Parameters:
            allow_copy : bool
                set this flag to false if you want to force re-encoding.
                Copying is only attempted when no conversions are needed.

        Notes:
        - Copying the stream could cause 'Non-monotonous DTS', meaning that
          the output could not be displayed correctly. This can be checked
          by inspecting the result. In the case of a faulty output, the user
          can attempt to send the edit again, but this time requesting to
          re-encode the video.

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
        if not 0 < len(self.clips):
            return False

        # If there is no need to re-encode, use stream copy.
        if allow_copy and not self._requires_reencoding():
            # If there is only 1 clip, immediately write to output file.
            if len(self.clips) == 1:
                return self._trim_using_streamcopy(
                    self.clips[0], output_path=self.filepath
                )

            # Otherwise, write to temporary files and concat them.
            filepaths = []
            for clip in self.clips:
                filename = Path(generate_random_filename(".mp4"))
                path = Path(ASSET_DIR, filename)
                self._trim_using_streamcopy(clip, output_path=path)
                filepaths.append(filename)
            return self._concat_using_streamcopy(filepaths)

        command = ["ffmpeg"]
        command.extend(self._generate_input_options())
        command.extend(self._generate_filter_complex())
        command.extend(self._generate_output_options())
        return self._run_command(
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
