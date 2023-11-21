"""
Filename: video_editor.py

Description:
This file describes how the API should create the edited video from the
several smaller video clips.

Usage:
- This file is part of the video editing functionality in the Flask API.

TODO: give proccessed/trimmed a dedicated folder in app.config?

Note:
- The filesystem appears like this in the code.
    assets/
        processed/
        trimmed/
        asset1
        asset2
        ...
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
    ffmpeg_process_asset,
    get_duration,
)
from app.util.util import random_file_name
from flask import abort
from flask_jwt_extended import get_jwt
from flask_restx import Resource, reqparse
from sqlalchemy.orm.exc import NoResultFound

ns = api.namespace("video-editor")


PROCESSED_DIR = "/processed/"
TRIMMED_DIR = "/trimmed/"


def _asset_key(clip: dict):
    """Return the part of `clip` that uniquely identifies an asset."""
    return clip["asset_id"]


def _trim_key(clip: dict) -> tuple[str]:
    """Return the part of `clip` that uniquely identifies a trim."""
    return clip["asset_id"], clip["start_time"], clip["duration"]


def trim_and_join_assets(clips: dict, video_path: Path):
    """Trim and concatenate the video clips together in `video_path`."""
    # Find all unique assets in `clips`.
    asset_paths = {}
    for clip in clips:
        if _asset_key(clip) not in asset_paths:
            asset: AssetModel = find_asset(clip["asset_id"])
            asset_paths[_asset_key(clip)] = Path(ASSET_DIR, asset.path)

    # Perform all unique trims in `clips`.
    trimmed_paths = {}
    for clip in clips:
        if _trim_key(clip) not in trimmed_paths:
            src_path = asset_paths[_asset_key(clip)]
            # dst_path = Path("trimmed" + random_file_name() + ".mp4")
            dst_path = Path(TRIMMED_DIR, random_file_name() + ".mp4")
            if not trim_asset(clip, src_path, dst_path):
                return HTTPStatus.INTERNAL_SERVER_ERROR
            trimmed_paths[_trim_key(clip)] = dst_path

    # List all trimmed assets in chronological order to concatenate.
    video_clips = []
    for clip in clips:
        video_clips.append(trimmed_paths[_trim_key(clip)])

    # Join/Concatenate the assets together.
    if not ffmpeg_join_assets(video_clips, video_path):
        print("An error occurred during concatenation of video clips.")
        return HTTPStatus.INTERNAL_SERVER_ERROR

    return HTTPStatus.OK


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
    start_time = clip["start_time"]
    duration = clip["duration"]
    return ffmpeg_trim_asset(start_time, duration, src_path, dst_path)


def find_project(project_id: int) -> ProjectModel | None:
    """Find the project using its ID `project_id`.

    Parameters:
        project_id : int
            the ID of the project to find.

    Returns:
        the found project on success, aborts with 404 Not Found on failure.
    """
    claims = get_jwt()
    try:
        found_project = ProjectModel.query.filter_by(
            id=project_id, user_id=claims["id"]
        ).first_or_404()
        return found_project
    except NoResultFound:
        abort(HTTPStatus.NOT_FOUND, "Project not found")


def find_asset(asset_id: int) -> AssetModel | None:
    """Find the asset using its ID `asset_id`.

    Parameters:
        asset_id : int
            the ID of the asset to find.

    Returns:
        the found asset on success, aborts with 404 Not Found on failure.
    """
    try:
        found_asset = AssetModel.query.filter_by(id=asset_id).first_or_404()
        return found_asset
    except NoResultFound:
        abort(HTTPStatus.NOT_FOUND, "Asset not found")


def cleanup_partial_results(filepaths: list[str]) -> None:
    """Remove the files specified by `filepaths`.

    Parameters:
        filepaths : list[str]
            list of filepaths to remove.

    Side effects:
        removes files.
    """
    for path in filepaths:
        Path(ASSET_DIR, path).unlink()


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
    duration = get_duration(video_path)

    thumbnail_path = Path(ASSET_DIR, filename + ".jpg")
    if not create_thumbnail(video_path.as_posix(), thumbnail_path.as_posix()):
        return

    size = video_path.stat().st_size

    return {
        "user_id": project.user_id,
        "duration": duration,
        "thumbnail_path": thumbnail_path.name,
        "file_size": size,
        "projects": [project],
    }


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
        project = find_project(project_id)

        # Retrieve edit information.
        args = asset_export.parse_args()
        clips = args.get("edits", [])
        display_name = args.get("filename", "Untitled_Video.mp4")

        # Define the location of the resulting video.
        extension = ".mp4"
        base_name = random_file_name()
        video_filename = base_name + extension
        video_path = Path(ASSET_DIR, base_name + extension)

        # Put the result in ASSET_DIR directly if there is only one trim.
        if len(clips) == 1:
            clip = clips[0]
            asset: AssetModel = find_asset(asset_id=clip["asset_id"])
            src_path = Path(ASSET_DIR, asset.path)
            if not trim_asset(clip, src_path, video_path):
                return HTTPStatus.INTERNAL_SERVER_ERROR
        # Otherwise, put trim results in folder and concatenate after.
        else:
            status = trim_and_join_assets(clips, video_path)
            if status is not HTTPStatus.OK:
                return status

        # TODO: hls? see project.py

        # Add video to database.
        meta = generate_asset_meta(project, base_name, video_path)
        asset = create_asset(display_name, video_filename, meta)
        if not asset:
            return HTTPStatus.INTERNAL_SERVER_ERROR
        db.session.add(asset)
        db.session.commit()

        return asset, HTTPStatus.CREATED
