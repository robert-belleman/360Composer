"""
Filename: video_editor.py

Description:
This file describes how the API should create the edited video from the
several smaller video clips.

Usage:
- This file is part of the video editing functionality in the Flask API.

"""

from http import HTTPStatus
from pathlib import Path

from app.config import ASSET_DIR
from app.models.asset import Asset as AssetModel
from app.models.asset import AssetType, ViewType
from app.models.database import db
from app.models.project import Project as ProjectModel
from app.routes.api import api
from app.schemas.asset import asset_schema
from app.util.auth import project_access_required, user_jwt_required
from app.util.ffmpeg import (
    create_thumbnail,
    get_duration,
    ffmpeg_trim_concat_convert,
    VideoEditorClip,
    VideoEditorEdit,
)
from app.util.util import random_file_name
from flask_jwt_extended import get_jwt
from flask_restx import Resource, reqparse
from sqlalchemy.orm.exc import NoResultFound

ns = api.namespace("video-editor")


EXTENSION = ".mp4"


class EditsValueException(Exception):
    """Exception for ValueErrors in the `edits` dictionary ."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message


class FFmpegException(Exception):
    """Exception for errors during FFmpeg utilization."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message


class SettingsParsingException(Exception):
    """Exception when parsing of settings fails."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message


class AssetMetaGenerationError(Exception):
    """Exception for errors during metadata generation."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message


class NoAssetFound(Exception):
    """Exception for when asset cannot be found in database."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message


class NoProjectFound(Exception):
    """Exception for when project cannot be found in database."""

    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message


def _get_total_pixels(video):
    width = int(video["width"])
    height = int(video["height"])
    return width * height


def parse_resolution(settings: str, clips: list) -> (str, str):
    """Parse the resolution option set in the frontend to be a width and
    height."""
    option = settings["resolution"]
    if option == "custom":
        return settings["width"], settings["height"]
    if option == "min":
        min_video = min(clips, key=_get_total_pixels)
        return min_video["width"], min_video["height"]
    if option == "max":
        max_video = max(clips, key=_get_total_pixels)
        return max_video["width"], max_video["height"]
    if option == "first":
        return clips[0]["width"], clips[0]["height"]

    # Use "first" as default option.
    return clips[0]["width"], clips[0]["height"]


def parse_settings(settings: dict, clips: list) -> dict:
    """Parse settings from display name to ffmpeg value."""
    display_name = settings.get("name", "Untitled_Video" + EXTENSION)
    if not display_name.endswith(EXTENSION):
        display_name += EXTENSION

    width, height = parse_resolution(settings, clips)
    frame_rate = settings.get("frame_rate", "30")

    # Convert str to ViewType enum.
    try:
        stereo_format = getattr(
            ViewType,
            settings.get("stereo_format", "mono"),
        )
    except AttributeError as error:
        status = HTTPStatus.INTERNAL_SERVER_ERROR
        msg = f"AttributeError with view type: {settings['stereo_format']}."
        raise SettingsParsingException(status, msg) from error

    projection_format = settings.get("projection_format", "")
    video_codec = video_codec_to_ffmpeg(settings.get("video_codec", ""))
    audio_codec = audio_codec_to_ffmpeg(settings.get("audio_codec", ""))
    video_bitrate = settings.get("video_bitrate", "")
    audio_bitrate = settings.get("audio_bitrate", "")

    parsed_settings = {
        "name": display_name,
        "width": width,
        "height": height,
        "frame_rate": frame_rate,
        "stereo_format": stereo_format,
        "projection_format": projection_format,
        "video_codec": video_codec,
        "audio_codec": audio_codec,
        "video_bitrate": "" if video_bitrate == "Default" else video_bitrate,
        "audio_bitrate": "" if audio_bitrate == "Default" else audio_bitrate,
    }
    return parsed_settings


def video_codec_to_ffmpeg(codec: str) -> str:
    """Parse video codecs from display name to ffmpeg value."""
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


def audio_codec_to_ffmpeg(codec: str) -> str:
    """Parse audio codecs from display name to ffmpeg value."""
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


def stereo_format_to_ffmpeg(stereo_format: str) -> str:
    """Parse view type from display name to ffmpeg value."""
    view_type_mappings = {
        ViewType.mono: "2d",
        ViewType.sidetoside: "sbs",
        ViewType.toptobottom: "tb",
    }

    return view_type_mappings.get(stereo_format, None)


def add_float_strings(float_a: str, float_b: str) -> str | None:
    """Compute the sum of two strings that can be parsed to floats.
    Return the sum as a string.

    Parameters:
        float_a : str
            string of a float.
        float_b : str
            string of a float.

    Returns:
        the sum of the float strings.
    """
    try:
        result = float(float_a) + float(float_b)
        return str(result)
    except ValueError:
        return None


def parse_clip(clip: dict) -> VideoEditorClip:
    """Parse the information inside the dictionary `clip` to the syntax of
    FFmpeg.

    Parameters:
        clips : dict
            dictionary containing information of each clip.
    """
    asset_id = clip["asset_id"]
    start_time = clip["start_time"]
    duration = clip["duration"]
    end_time = add_float_strings(start_time, duration)

    asset: AssetModel = find_asset(asset_id=asset_id)
    path = Path(ASSET_DIR, asset.path)

    return VideoEditorClip(
        filepath=path,
        trim=f"{start_time}:{end_time}",
        stereo_format=stereo_format_to_ffmpeg(asset.view_type),
        # projection_format="equirect",
    )


def edit_assets(clips: list, video_path: Path, settings: dict) -> None:
    """Trim and concatenate the clips `clips` and store the result in
    Path `video_path`.

    Parameters:
        clips : list
            list containing information of each clip.
        video_path : str
            Path to store the result in.
        settings : dict
            settings of the output video.
    """
    video_clips = [parse_clip(clip) for clip in clips]

    edit = VideoEditorEdit(
        clips=video_clips,
        filepath=video_path,
        width=settings["width"],
        height=settings["height"],
        frame_rate=settings["frame_rate"],
        stereo_format=stereo_format_to_ffmpeg(settings["stereo_format"]),
        projection_format=settings["projection_format"],
        video_codec=settings["video_codec"],
        audio_codec=settings["audio_codec"],
    )

    if not ffmpeg_trim_concat_convert(edit):
        status = HTTPStatus.INTERNAL_SERVER_ERROR
        msg = "Error trimming and joining assets"
        raise FFmpegException(status, msg)


def find_project(project_id: int) -> ProjectModel | None:
    """Find the project using its ID `project_id`.

    Parameters:
        project_id : int
            the ID of the project to find.

    Returns:
        the found project on success, None on failure.
    """
    claims = get_jwt()
    try:
        found_project = ProjectModel.query.filter_by(
            id=project_id, user_id=claims["id"]
        ).first_or_404()
        return found_project
    except NoResultFound as error:
        status = HTTPStatus.NOT_FOUND
        msg = f"Project not found with ID: {project_id}"
        raise NoAssetFound(status, msg) from error


def find_asset(asset_id: int) -> AssetModel | None:
    """Find the asset using its ID `asset_id`.

    Parameters:
        asset_id : int
            the ID of the asset to find.

    Returns:
        the found asset on success, None on failure.
    """
    try:
        found_asset = AssetModel.query.filter_by(id=asset_id).first_or_404()
        return found_asset
    except NoResultFound as error:
        status = HTTPStatus.NOT_FOUND
        msg = f"Asset not found with ID: {asset_id}"
        raise NoAssetFound(status, msg) from error


def generate_asset_meta(
    project: ProjectModel, filename: Path, video_path: Path, settings: dict
) -> dict:
    """Generate the metadata of the asset.

    Parameters:
        project : ProjectModel
            project that the asset is part of.
        filename : Path
            random file name generated by util.random_file_name().
        video_path : Path
            raw path of the video (ASSET_DIR + filename + extension).
        settings : dict
            dictionary containing video output settings.

    Returns:
        dictionary containing metadata.
    """
    try:
        thumbnail_path = Path(ASSET_DIR, filename + ".jpg")

        # Create a thumbnail on `thumbnail_path` if it does not exist.
        video_path_str = video_path.as_posix()
        thumbnail_path_str = thumbnail_path.as_posix()
        if not create_thumbnail(video_path_str, thumbnail_path_str):
            status = HTTPStatus.INTERNAL_SERVER_ERROR
            msg = "Error generating thumbnail"
            raise AssetMetaGenerationError(status, msg)

        return {
            "user_id": project.user_id,
            "width": settings["width"],
            "height": settings["height"],
            "duration": get_duration(video_path),
            "thumbnail_path": thumbnail_path.name,
            "view_type": settings["stereo_format"],
            "file_size": video_path.stat().st_size,
            "projects": [project],
        }
    except Exception as error:
        status = HTTPStatus.INTERNAL_SERVER_ERROR
        msg = f"Error generating asset metadata {str(error)}"
        raise AssetMetaGenerationError(status, msg) from error


def create_asset(name: str, path: str, meta: dict) -> AssetModel:
    """Create an asset using the parameters.

    Parameters:
        name : str
            display name of the asset.
        path : str
            path to the video file (starting from ASSET_DIR).
        meta: dict
            metadata of the asset.

    Returns:
        the created asset.
    """
    if not meta:
        return

    return AssetModel(
        name=name,
        user_id=meta["user_id"],
        path=path,
        asset_type=AssetType.video,
        view_type=meta["view_type"],
        thumbnail_path=meta["thumbnail_path"],
        width=meta["width"],
        height=meta["height"],
        duration=meta["duration"],
        file_size=meta["file_size"],
        projects=meta["projects"],
    )


asset_export = reqparse.RequestParser()
asset_export.add_argument(
    "edits",
    type=dict,
    action="append",
    help="List of video files with start and end times",
    required=True,
)
asset_export.add_argument(
    "settings",
    type=dict,
    help="Dictionary of video settings for resolution, fps, etc.",
    required=True,
)


@ns.route("/<string:project_id>/edit")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("project_id", "The project identifier")
class EditAssets(Resource):
    """Edit assets by trimming them and joining them together."""

    @user_jwt_required
    @project_access_required
    @ns.marshal_with(asset_schema)
    @ns.expect(asset_export)
    def post(self, project_id: int):
        """Receive the information of the clip(s), edit them, and add the
        resulting video to the database."""
        try:
            project = find_project(project_id)

            # Retrieve edit information.
            args = asset_export.parse_args()
            clips = args.get("edits", [])
            settings = parse_settings(args.get("settings", {}), clips)

            # Define the location of the resulting video.
            filename = random_file_name()
            video_filename = filename + EXTENSION
            video_path = Path(ASSET_DIR, filename + EXTENSION)

            edit_assets(clips, video_path, settings)

            # Add video to database.
            meta = generate_asset_meta(project, filename, video_path, settings)
            asset = create_asset(settings["name"], video_filename, meta)
            db.session.add(asset)
            db.session.commit()
            return asset, HTTPStatus.CREATED
        except (
            EditsValueException,
            NoAssetFound,
            NoProjectFound,
            FFmpegException,
            AssetMetaGenerationError,
            SettingsParsingException,
        ) as error:
            return {"message": error.message}, error.status_code
