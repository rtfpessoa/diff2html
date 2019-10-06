#!/usr/bin/env bash

set -e

SCRIPT_DIRECTORY="$( cd "$( dirname "$0" )" && pwd )"

INPUT_DIR=${SCRIPT_DIRECTORY}/../build/commonjs-node
INPUT_UI_DIR=${INPUT_DIR}/ui
INPUT_JS_FILE=${INPUT_DIR}/diff2html.js
INPUT_JS_UI_FILE=${INPUT_UI_DIR}/js/diff2html-ui.js

OUTPUT_DIR=${SCRIPT_DIRECTORY}/../build/browser
OUTPUT_JS_FILE=${OUTPUT_DIR}/diff2html.js
OUTPUT_MIN_JS_FILE=${OUTPUT_DIR}/diff2html.min.js
OUTPUT_JS_UI_FILE=${OUTPUT_DIR}/diff2html-ui.js
OUTPUT_MIN_JS_UI_FILE=${OUTPUT_DIR}/diff2html-ui.min.js

echo "Creating diff2html browser bundle ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

echo "Generating js aggregation file in ${OUTPUT_JS_FILE}"
browserify -e ${INPUT_JS_FILE} -o ${OUTPUT_JS_FILE}

echo "Minifying ${OUTPUT_JS_FILE} to ${OUTPUT_MIN_JS_FILE}"
terser ${OUTPUT_JS_FILE} -c -o ${OUTPUT_MIN_JS_FILE}

echo "Generating js ui aggregation file in ${OUTPUT_JS_UI_FILE}"
browserify -e ${INPUT_JS_UI_FILE} -o ${OUTPUT_JS_UI_FILE}

echo "Minifying ${OUTPUT_JS_UI_FILE} to ${OUTPUT_MIN_JS_UI_FILE}"
terser ${OUTPUT_JS_UI_FILE} -c -o ${OUTPUT_MIN_JS_UI_FILE}

echo "diff2html browser bundle created successfully!"
