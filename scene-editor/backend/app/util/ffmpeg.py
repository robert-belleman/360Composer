import ffmpeg
import subprocess
import sys
import json


def create_thumbnail(in_path, out_path):
    try:
        (
            ffmpeg
            .input(in_path, ss=1)
            .filter('scale', 500, -1)
            .output(out_path, vframes=1)
            .run()
        )
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


def ffmpeg_trim_video(input_file, start_time, end_time, output_file):
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'quiet', '-stats', '-progress', 'ffmpeg_progress.txt', '-i', input_file, '-ss', start_time, '-to',
               end_time, '-y', output_file]
    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    print(stdout)
    return stdout, stderr


def get_video_metadata(path):
    command = ['ffprobe', '-v', 'error', '-print_format',
               'json', '-show_format', '-show_streams', path]
    result = subprocess.run(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    info = json.loads(result.stdout.decode())
    # print(json.dumps(info, indent=1))
    return info


def __ffmpeg_get_video_duration(video_info):
    return video_info['format']['duration']


def __ffmpeg_get_video_resolution(video_info):
    return video_info['streams'][0]['width'], video_info['streams'][0]['height']


def __ffmpeg_get_video_fps(video_info):
    return video_info['streams'][0]['r_frame_rate']


def __ffmpeg_get_video_bitrate(video_info):
    return video_info['streams'][0]['bit_rate']


def __ffmpeg_get_video_codec(video_info):
    return video_info['streams'][0]['codec_name']


def __ffmpeg_get_video_format(video_info):
    return video_info['format']['format_name']


def __ffmpeg_get_video_audio_codec(video_info):
    return video_info['streams'][1]['codec_name']


def __ffmpeg_get_video_audio_bitrate(video_info):
    return video_info['streams'][1]['bit_rate']


def __ffmpeg_get_video_frame_count(video_info):
    return video_info['streams'][0]['nb_frames']


def main():

    if len(sys.argv) > 1:
        path = sys.argv[1]
        video_info = get_video_info(path)

        print(f"Duration: {__ffmpeg_get_video_duration(video_info)}")
        print(f"Resolution: {__ffmpeg_get_video_resolution(video_info)}")
        print(f"FPS: {__ffmpeg_get_video_fps(video_info)}")
        print(f"Bitrate: {__ffmpeg_get_video_bitrate(video_info)}")
        print(f"Codec: {__ffmpeg_get_video_codec(video_info)}")
        print(f"Format: {__ffmpeg_get_video_format(video_info)}")
        print(f"Audio Codec: {__ffmpeg_get_video_audio_codec(video_info)}")
        print(f"Audio Bitrate: {__ffmpeg_get_video_audio_bitrate(video_info)}")
        print(f"Frame Count: {__ffmpeg_get_video_frame_count(video_info)}")

        # print(ffmpeg_trim_video(path, '00:00:00', '00:00:25', 'test.mp4'))


if __name__ == "__main__":
    main()
