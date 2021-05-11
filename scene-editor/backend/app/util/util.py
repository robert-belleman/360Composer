import uuid
import datetime

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