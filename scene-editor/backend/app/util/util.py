import os
import datetime
import uuid
from app.models.asset import AssetType
import app.util.ffmpeg as ffmpeg_util


def random_file_name():
  # create random filename
    basename = "asset"
    suffix = datetime.datetime.now().strftime("%y%m%d%H%M%S")
    random = str(uuid.uuid4().hex)
    return "".join([basename, random, suffix])


def write_file(request, path, file):
    # save the file to system and create the database entry
    # check if file upload is chunked
    if 'Content-Range' in request.headers:
        # extract starting byte from Content-Range header string
        range_str = request.headers['Content-Range']
        start_bytes = int(range_str.split(' ')[1].split('-')[0])

        # append chunk to the file on disk, or create new
        with open(path, 'ab') as f:
            f.seek(start_bytes)
            f.write(file.stream.read())

    else:
        with open(path, 'ab') as f:
            f.write(file.stream.read())


def extension_to_type(extension):
    try:
        return {".mp4": AssetType.video, ".glb": AssetType.model}[extension]
    except KeyError:
        return None


def generate_asset_meta(asset_type, filename, path):
    size = os.path.getsize(path)

    # Initialize asset metadata
    asset_meta = {
        "file_size": size,
        "thumbnail_path": None,
        "duration": None,
        "frames": None,
        "fps": None,
    }

    # only get duration and thumbnail if it is a video
    if asset_type == AssetType.video:
        thumbnail_path = os.path.join(
            os.environ.get('ASSET_DIR'), filename + '.png')
        if not ffmpeg_util.create_thumbnail(path, thumbnail_path):
            thumbnail_path = None

        asset_meta["thumbnail_path"] = thumbnail_path
        # duration = ffmpeg_util.get_duration(path)
        video_metadata = ffmpeg_util.get_video_metadata(path)

        # TODO: instead of strings, make it the correct type
        asset_meta["duration"] = ffmpeg_util.ffmpeg_get_video_duration(video_metadata)
        asset_meta["frames"] = ffmpeg_util.ffmpeg_get_video_frame_count(
            video_metadata)  # int
        asset_meta["fps"] = ffmpeg_util.ffmpeg_get_video_fps(
            video_metadata)  # float

        return asset_meta

    return asset_meta
