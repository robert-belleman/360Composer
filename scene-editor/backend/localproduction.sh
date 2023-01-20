#!/usr/bin/env bash

# Set env vars:

# Show env vars
grep -v '^#' .localproduction.env

# Export env vars
set -a
source .localproduction.env
set +a
