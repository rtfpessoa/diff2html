#!/bin/bash

#
# diff2html release script
# by rtfpessoa
#

INPUT_DIR=src
INPUT_UI_DIR=${INPUT_DIR}/ui
INPUT_JS_FILE=${INPUT_DIR}/diff2html.js
INPUT_JS_UI_FILE=${INPUT_UI_DIR}/js/diff2html-ui.js
INPUT_CSS_FILE=${INPUT_UI_DIR}/css/diff2html.css

OUTPUT_DIR=dist
OUTPUT_JS_FILE=${OUTPUT_DIR}/diff2html.js
OUTPUT_MIN_JS_FILE=${OUTPUT_DIR}/diff2html.min.js
OUTPUT_JS_UI_FILE=${OUTPUT_DIR}/diff2html-ui.js
OUTPUT_MIN_JS_UI_FILE=${OUTPUT_DIR}/diff2html-ui.min.js
OUTPUT_CSS_FILE=${OUTPUT_DIR}/diff2html.css
OUTPUT_MIN_CSS_FILE=${OUTPUT_DIR}/diff2html.min.css

echo "Creating diff2html release ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

echo "Generating js aggregation file in ${OUTPUT_JS_FILE}"

webpack ${INPUT_JS_FILE} ${OUTPUT_JS_FILE}

echo "Minifying ${OUTPUT_JS_FILE} to ${OUTPUT_MIN_JS_FILE}"

uglifyjs ${OUTPUT_JS_FILE} -c -o ${OUTPUT_MIN_JS_FILE}

echo "Generating js ui aggregation file in ${OUTPUT_JS_UI_FILE}"

webpack ${INPUT_JS_UI_FILE} ${OUTPUT_JS_UI_FILE}

echo "Minifying ${OUTPUT_JS_UI_FILE} to ${OUTPUT_MIN_JS_UI_FILE}"

uglifyjs ${OUTPUT_JS_UI_FILE} -c -o ${OUTPUT_MIN_JS_UI_FILE}

echo "Copying css file to ${OUTPUT_CSS_FILE}"

cp -f ${INPUT_CSS_FILE} ${OUTPUT_CSS_FILE}

echo "Minifying ${OUTPUT_CSS_FILE} to ${OUTPUT_MIN_CSS_FILE}"

lessc -x ${OUTPUT_CSS_FILE} ${OUTPUT_MIN_CSS_FILE}

echo "diff2html release created successfully!"
