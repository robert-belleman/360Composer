import ffmpeg
import subprocess

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
