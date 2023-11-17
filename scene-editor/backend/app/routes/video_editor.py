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
from flask import abort
from flask_jwt_extended import get_jwt
from flask_restx import Resource, reqparse
from sqlalchemy.orm.exc import NoResultFound

ns = api.namespace("video-editor")


def trim_and_join_assets(clips: dict, output_path: str) -> bool:
    """Trim and join the assets using the instructions in `clips`. Put the
    resulting video in `output_path`. If there is only a single clip, then
    trim it and put the resulting video in ouput_path instantly. Note that
    trimmed assets are usually partial results that are deleted at a later
    time.

    Parameters:
        clips : dict
            dictionary containing the trim parameters for each clip.
        output_path : str
            path to store the end result in.

    Returns:
        True if successful, False otherwise.
    """
    # If there is only a single clip, then just trim.
    if len(clips) == 1:
        for clip in clips:
            return trim_asset(clip, output_path)

    # Trim the assets, store temporary results at `trimmed_files`.
    trimmed_files = trim_all_assets(clips)
    if not trimmed_files:
        return False

    # If joining is necessary, join the trimmed assets into a video.
    ffmpeg_join_assets(trimmed_files, output_path)

    # Cleanup the temporary trim results.
    cleanup_partial_results(trimmed_files)

    return True


def trim_all_assets(clips: dict) -> list[str]:
    """Trim all assets according to the parameters found in `clips`. These
    trimmed assets are partial results and have to be removed later.

    Parameters:
        clips : dict
            dictionary containing trim parameters for all assets.

    Returns:
        filepaths for trimmed assets, [] on error.

    Side effects:
        creates multiple video files that are not assets.
    """
    # Keep track of partial results to clean up later.
    trimmed_files = []
    for clip in clips:
        filename = "trimmed/" + random_file_name() + ".mp4"
        if not trim_asset(clip, filename):
            return []

        # Store the path towards the partial result.
        trimmed_files.append(filename)

    return trimmed_files


def trim_asset(clip: dict, filename: str) -> bool:
    """Trim `asset` to be from `start` to `end`. Put the result in `dst`.

    Parameters:
        clip : dict
            dictionary containing trim parameters for one asset.
        filename : str
            name of the file to store the result in.

    Returns:
        True if successful, False otherwise.

    Side effects:
        could create a file that is not an asset depending on filename.
    """
    asset: AssetModel = find_asset(asset_id=clip["asset_id"])

    start_time = clip["start_time"]
    end_time = clip["end_time"]
    src = Path(ASSET_DIR, asset.path)
    dst = Path(ASSET_DIR, filename)

    # TODO: change codec based on stereoscopy of assets.
    codec = "copy"

    # Perform trim and check for errors.
    return ffmpeg_trim_asset(start_time, end_time, src, dst, codec)


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
        Path(path).unlink()


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
        thumbnail_path = None

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
    return AssetModel(
        name=name,
        user_id=meta["user_id"],
        path=path,
        asset_type=AssetType.video,
        thumbnail_path=meta["thumbnail_path"],
        duration=meta["duration"],
        file_size=meta["file_size"],
        projects=meta["project"],
    )


asset_export = reqparse.RequestParser()
asset_export.add_argument(
    "clips",
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
        clips = args["clips"]
        display_name = args["filename"]

        # Define the location of the resulting video.
        extension = ".mp4"
        base_name = random_file_name()
        video_filename = base_name + extension
        video_path = Path(ASSET_DIR, base_name + extension)

        # Trim the assets, join if necessary. Result is stored in video_path.
        trim_and_join_assets(clips, video_path)

        # TODO: hls? see project.py

        # Add video to database.
        meta = generate_asset_meta(project, base_name, video_path)
        asset = create_asset(display_name, video_filename, meta)
        db.session.add(asset)
        db.session.commit()

        return asset, HTTPStatus.CREATED
