#!/usr/bin/env bash

set -e

SCRIPT_DIRECTORY="$( cd "$( dirname "$0" )" && pwd )"

INPUT_DIR=${SCRIPT_DIRECTORY}/../src
INPUT_UI_DIR=${INPUT_DIR}/ui
INPUT_CSS_FILE=${INPUT_UI_DIR}/css/diff2html.css

OUTPUT_DIR=${SCRIPT_DIRECTORY}/../build/css
OUTPUT_CSS_FILE=${OUTPUT_DIR}/diff2html.css
OUTPUT_MIN_CSS_FILE=${OUTPUT_DIR}/diff2html.min.css

echo "Creating diff2html css ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

echo "Minifying ${OUTPUT_CSS_FILE} to ${OUTPUT_MIN_CSS_FILE}"
postcss --use autoprefixer -o ${OUTPUT_CSS_FILE} ${INPUT_CSS_FILE}
cleancss --advanced --compatibility=ie8 -o ${OUTPUT_MIN_CSS_FILE} ${OUTPUT_CSS_FILE}

echo "diff2html css created successfully!"
