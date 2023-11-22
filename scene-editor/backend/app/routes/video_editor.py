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
from app.models.asset import AssetType
from app.models.database import db
from app.models.project import Project as ProjectModel
from app.routes.api import api
from app.schemas.asset import asset_schema
from app.util.auth import user_jwt_required
from app.util.ffmpeg import (
    create_thumbnail,
    ffmpeg_join_assets,
    ffmpeg_trim_asset,
    get_duration,
)
from app.util.util import random_file_name
from flask_jwt_extended import get_jwt
from flask_restx import Resource, reqparse
from sqlalchemy.orm.exc import NoResultFound

ns = api.namespace("video-editor")


PROCESSED_DIR = "/processed/"
TRIMMED_DIR = "/trimmed/"
EXTENSION = ".mp4"


class FFmpegException(Exception):
    """Exception for errors during FFmpeg utilization."""

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


def _asset_key(clip: dict):
    """Return the part of `clip` that uniquely identifies an asset."""
    return clip["asset_id"]


def _trim_key(clip: dict) -> tuple[str]:
    """Return the part of `clip` that uniquely identifies a trim."""
    return clip["asset_id"], clip["start_time"], clip["duration"]


def find_unique_assets(clips: dict) -> dict:
    """Find all unique assets in `clips`. An asset is uniquely defined by
    the id.

    Returns:
        a dict with asset id as key and asset path as value.
    """
    asset_paths = {}
    for clip in clips:
        if _asset_key(clip) not in asset_paths:
            asset: AssetModel = find_asset(clip["asset_id"])
            asset_paths[_asset_key(clip)] = Path(ASSET_DIR, asset.path)
    return asset_paths


def perform_unique_trims(clips: dict, asset_paths: dict) -> dict:
    """Perform all unique trims in `clips`. A trim is uniquely defined by
    the id of the asset, the start time of the trim, and the duration.

    Returns:
        a dictionary with (asset_id, start_time, duration) as key and"""
    trimmed_paths = {}
    for clip in clips:
        if _trim_key(clip) not in trimmed_paths:
            src_path = asset_paths[_asset_key(clip)]
            dst_path = Path(TRIMMED_DIR, random_file_name() + EXTENSION)
            trim_asset(clip, src_path, dst_path)
            trimmed_paths[_trim_key(clip)] = dst_path
    return trimmed_paths


def list_video_clips(clips: dict, trimmed_paths: dict) -> list:
    """List all trimmed assets in chronological order to concatenate."""
    return [trimmed_paths[_trim_key(clip)] for clip in clips]


def edit_assets(clips: dict, video_path: Path) -> HTTPStatus:
    """Trim and concatenate the video clips together in `video_path`.

    Parameters:
        clip : dict
            dictionary with trimming information of the clip.
        dst_path : Path
            file to write the trim result to.

    Returns:
        True on succes, False on error.
    """
    try:
        # Put the result in ASSET_DIR directly if there is only one trim.
        if len(clips) == 1:
            clip = clips[0]
            asset: AssetModel = find_asset(asset_id=clip["asset_id"])
            src_path = Path(ASSET_DIR, asset.path)
            trim_asset(clip, src_path, video_path)

        # Otherwise, perform unique trims and concatenate them together.
        unique_assets = find_unique_assets(clips)
        unique_trims = perform_unique_trims(clips, unique_assets)
        video_clips = list_video_clips(clips, unique_trims)
        return ffmpeg_join_assets(video_clips, video_path)
    finally:
        cleanup_temporary_files(unique_trims)


def trim_asset(clip: dict, src_path: Path, dst_path: Path):
    """Trim an asset using the information of dictionary `clip`. The asset can
    be found on `src_path` and the result will be written to `dst_path`.

    Parameters:
        clip : dict
            dictionary with trimming information of the clip.
        src_path : Path
            file to read the asset to trim from.
        dst_path : Path
            file to write the trim result to.

    Returns:
        True on succes, False on error.
    """
    try:
        start_time = clip["start_time"]
        duration = clip["duration"]
        return ffmpeg_trim_asset(start_time, duration, src_path, dst_path)
    except Exception as error:
        status = HTTPStatus.INTERNAL_SERVER_ERROR
        msg = f"Error trimming asset with ID: {clip['asset_id']}"
        raise FFmpegException(status, msg) from error


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


def cleanup_temporary_files(filepaths: list | dict) -> None:
    """Remove the files specified by `filepaths`.

    Parameters:
        filepaths : list[str]
            list or dictionary of filepaths to remove.

    Side effects:
        removes files.
    """
    if isinstance(filepaths, list):
        for path in filepaths:
            Path(path).unlink()
    elif isinstance(filepaths, dict):
        for path in filepaths.values():
            Path(path).unlink()
    else:
        raise TypeError("Unsupported type for filepaths. Use list or dict.")


def generate_asset_meta(
    project: ProjectModel, filename: Path, video_path: Path
) -> dict:
    """Generate the metadata of the asset.

    Parameters:
        project : ProjectModel
            project that the asset is part of.
        filename : Path
            random file name generated by util.random_file_name().
        video_path : Path
            raw path of the video (ASSET_DIR + filename + extension).

    Returns:
        dictionary containing metadata.
    """
    try:
        thumbnail_path = Path(ASSET_DIR, filename + ".jpg")

        # Create a thumbnail on `thumbnail_path` if it does not exist.
        video_path_str = video_path.as_posix()
        thumbnail_path_str = thumbnail_path.as_posix()
        if not create_thumbnail(video_path_str, thumbnail_path_str):
            return

        return {
            "user_id": project.user_id,
            "duration": get_duration(video_path),
            "thumbnail_path": thumbnail_path.name,
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
        thumbnail_path=meta["thumbnail_path"],
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
    "filename",
    type=str,
    help="Output filename for the resulting video",
    required=True,
)


@ns.route("/<string:project_id>/edit")
@ns.response(HTTPStatus.NOT_FOUND, "Project not found")
@ns.param("project_id", "The project identifier")
class EditAssets(Resource):
    """Edit assets by trimming them and joining them together."""

    @user_jwt_required
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
            display_name = args.get("filename", "Untitled_Video" + EXTENSION)

            # Define the location of the resulting video.
            base_name = random_file_name()
            video_filename = base_name + EXTENSION
            video_path = Path(ASSET_DIR, base_name + EXTENSION)

            edit_assets(clips, video_path)

            # Add video to database.
            meta = generate_asset_meta(project, base_name, video_path)
            asset = create_asset(display_name, video_filename, meta)
            db.session.add(asset)
            db.session.commit()
            return asset, HTTPStatus.CREATED
        except (
            NoAssetFound,
            NoProjectFound,
            FFmpegException,
            AssetMetaGenerationError,
        ) as error:
            return {"message": error.message}, error.status_code
