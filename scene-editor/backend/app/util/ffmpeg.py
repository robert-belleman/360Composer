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

# '-hide_banner', '-loglevel', 'error', '-stats', '-progress', 'ffmpeg_progress.txt',
def ffmpeg_trim_video(start_time, end_time, input_file, output_file):

    if start_time == "-1":
        command = ['ffmpeg', '-i', input_file, '-ss', 0, '-to',
               end_time, '-y', output_file]
    elif end_time == "-1":
        command = ['ffmpeg', '-i', input_file, '-ss', start_time, '-y', output_file]
    else:
        command = ['ffmpeg', '-i', input_file, '-ss', start_time, '-to',
               end_time, '-y', output_file]

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    
    # If the trimming was successful, return the output file path
    if result.returncode == 0:
        return output_file

    print("Error with trimming. result: ", result)
    # TODO: Add error handling. What if the video is too short? What if the trimming fails?
    return None


def ffmpeg_join_videos(start_time, end_time, input_file, output_file):

    command = ['ffmpeg', '-i', input_file, output_file]

    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    
    # If the trimming was successful, return the output file path
    if result.returncode == 0:
        return output_file

    print("Error with trimming. result: ", result)
    # TODO: Add error handling. What if the video is too short? What if the trimming fails?
    return None
    

def get_video_metadata(path):
    command = ['ffprobe', '-v', 'error', '-print_format',
               'json', '-show_format', '-show_streams', path]
    result = subprocess.run(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    info = json.loads(result.stdout.decode())
    return info


def ffmpeg_get_video_duration(video_info):
    # Get duration of video stream in seconds.
    return float(video_info['streams'][0]['duration'])


def ffmpeg_get_video_resolution(video_info):
    return video_info['streams'][0]['width'], video_info['streams'][0]['height']


def ffmpeg_get_video_fps(video_info):
    # Gets frame rate in format like: 30/1. So we need to split it.
    fps = video_info['streams'][0]['r_frame_rate']
    return float(fps.split('/')[0]) / float(fps.split('/')[1])


def ffmpeg_get_video_bitrate(video_info):
    return video_info['streams'][0]['bit_rate']


def ffmpeg_get_video_codec(video_info):
    return video_info['streams'][0]['codec_name']


def ffmpeg_get_video_format(video_info):
    return video_info['format']['format_name']


def ffmpeg_get_video_audio_codec(video_info):
    return video_info['streams'][1]['codec_name']


def ffmpeg_get_video_audio_bitrate(video_info):
    return video_info['streams'][1]['bit_rate']


def ffmpeg_get_video_frame_count(video_info):
    return int(video_info['streams'][0]['nb_frames'])


def main():

    if len(sys.argv) > 1:
        path = sys.argv[1]
        video_info = get_video_metadata(path)
        # print(video_info)

        ffmpeg_trim_video(path, str(1.0), str(5.5), 'output1.mp4')

        # print(f"Duration: {__ffmpeg_get_video_duration(video_info)}")
        # print(f"Resolution: {__ffmpeg_get_video_resolution(video_info)}")
        # print(f"FPS: {__ffmpeg_get_video_fps(video_info)}")
        # print(f"Bitrate: {__ffmpeg_get_video_bitrate(video_info)}")
        # print(f"Codec: {__ffmpeg_get_video_codec(video_info)}")
        # print(f"Format: {__ffmpeg_get_video_format(video_info)}")
        # print(f"Audio Codec: {__ffmpeg_get_video_audio_codec(video_info)}")
        # print(f"Audio Bitrate: {__ffmpeg_get_video_audio_bitrate(video_info)}")
        # print(f"Frame Count: {__ffmpeg_get_video_frame_count(video_info)}")

        # print(ffmpeg_trim_video(path, '00:00:00', '00:00:25', 'test.mp4'))


if __name__ == "__main__":
    main()
