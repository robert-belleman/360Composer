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


def trim_and_join_assets(output_path: str, clips: dict) -> bool:
    """Trim and join the assets using the instructions in `clips`. Put the
    resulting video in `output_path`. If there is only a single clip, then
    trim it and put the resulting video in ouput_path instantly. Note that
    trimmed assets are usually partial results that are deleted at a later
    time.

    Parameters:
        output_path : str
            path to the file to store the end result.
        clips : dict
            dictionary containing the trim parameters for each clip.

    Returns:
        True if successful, False otherwise.
    """
    # If there is only a single clip, then just trim.
    if len(clips) == 1:
        for clip in clips:
            asset: AssetModel = find_asset(asset_id=clip["asset_id"])
            return trim_asset(asset.path, output_path, clip)

    # Process the assets, store temporary partial results in `processed_files`.
    processed_files = process_all_assets(clips)
    if not processed_files:
        cleanup_partial_results(processed_files)
        return False

    # Trim the assets, store temporary partial results in `trimmed_files`.
    trimmed_files = trim_all_assets(processed_files, clips)
    if not trimmed_files:
        cleanup_partial_results(processed_files)
        cleanup_partial_results(trimmed_files)
        return False

    # If joining is necessary, join the trimmed assets into a video.
    ffmpeg_join_assets(trimmed_files, output_path)

    # Cleanup the temporary partial results.
    cleanup_partial_results(processed_files)
    cleanup_partial_results(trimmed_files)

    return True


def process_all_assets(clips: dict) -> list[str]:
    """Process all assets according to the parameters found in `clips`. These
    processed assets are partial results and have to be removed later.

    Parameters:
        input_paths : list[str]
            list of paths to files to process.
        clips : dict
            dictionary containing information about the assets.

    Returns:
        filepaths for processed assets, [] on error.

    Side effects:
        creates multiple video files that are not assets.
    """
    # Keep track of partial results to clean up later.
    processed = []
    for clip in clips:
        asset: AssetModel = find_asset(asset_id=clip["asset_id"])

        filename = "processed/" + random_file_name() + ".mp4"
        if not process_asset(asset.path, filename, clip):
            return []

        # Store the path towards the partial result.
        processed.append(filename)

    return processed


def process_asset(input_path: str, output_path: str, clip: dict) -> bool:
    """Process `asset` to allow it to be joined with other assets later.

    Parameters:
        input_path : str
            path to the file to process.
        output_path : str
            path to give the processed file.
        clip : dict
            dictionary containing information about one asset.

    Returns:
        True if successful, False otherwise.

    Side effects:
        creates a file that is not an asset.
    """
    input_path = Path(ASSET_DIR, input_path)
    output_path = Path(ASSET_DIR, output_path)
    view_type = clip["view_type"]

    # Perform processing and check for errors.
    return ffmpeg_process_asset(input_path, output_path, view_type)


def trim_all_assets(input_paths: list[str], clips: dict) -> list[str]:
    """Trim all assets according to the parameters found in `clips`. These
    trimmed assets are partial results and have to be removed later.

    Parameters:
        input_paths : list[str]
            list of paths to files to trim.
        clips : dict
            dictionary containing trim parameters for all assets.

    Returns:
        filepaths for trimmed assets, [] on error.

    Side effects:
        creates multiple video files that are not assets.
    """
    # Keep track of partial results to clean up later.
    trimmed_files = []
    for i, clip in enumerate(clips):
        filename = "trimmed/" + random_file_name() + ".mp4"
        if not trim_asset(input_paths[i], filename, clip):
            return []

        # Store the path towards the partial result.
        trimmed_files.append(filename)

    return trimmed_files


def trim_asset(input_path: str, output_path: str, clip: dict) -> bool:
    """Trim `asset` to be from `start` to `end`. Put the result in `dst`.

    Parameters:
        input_path : str
            path to the file to trim.
        output_path : str
            path to give the trimmed file.
        clip : dict
            dictionary containing trim parameters for one asset.

    Returns:
        True if successful, False otherwise.

    Side effects:
        could create a file that is not an asset depending on filename.
    """
    start_time = clip["start_time"]
    end_time = clip["end_time"]
    src = Path(ASSET_DIR, input_path)
    dst = Path(ASSET_DIR, output_path)

    # Perform trim and check for errors.
    return ffmpeg_trim_asset(start_time, end_time, src, dst)


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
        trim_and_join_assets(video_path, clips)

        # TODO: hls? see project.py

        # Add video to database.
        meta = generate_asset_meta(project, base_name, video_path)
        asset = create_asset(display_name, video_filename, meta)
        db.session.add(asset)
        db.session.commit()

        return asset, HTTPStatus.CREATED
