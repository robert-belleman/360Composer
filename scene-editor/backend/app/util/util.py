import datetime
import binascii
import os


def random_file_name() -> str:
    # create random filename
    basename = "asset"
    prefix = datetime.datetime.now().strftime("%y%m%d%H%M")
    random = binascii.b2a_hex(os.urandom(8)).decode()
    return ''.join([basename, prefix, random])


def generate_random_filename(extension: str) -> str:
    """Generate a random filename with the given extension `extension`."""
    prefix = datetime.datetime.now().strftime("%y%m%d%H%M")
    random = binascii.b2a_hex(os.urandom(8)).decode()
    return ''.join([prefix, random, extension])


def write_file(request, path, file) -> None:
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
