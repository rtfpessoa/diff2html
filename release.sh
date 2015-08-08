#!/bin/bash

#
# diff2html release script
# by rtfpessoa
#

OUTPUT_DIR=dist
OUTPUT_JS_FILE=${OUTPUT_DIR}/diff2html.js
OUTPUT_MIN_JS_FILE=${OUTPUT_DIR}/diff2html.min.js
OUTPUT_CSS_FILE=${OUTPUT_DIR}/diff2html.css
OUTPUT_MIN_CSS_FILE=${OUTPUT_DIR}/diff2html.min.css

echo "Creating diff2html release ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

echo "Generating js aggregation file in ${OUTPUT_JS_FILE}"

webpack ./src/diff2html.js ${OUTPUT_JS_FILE}

echo "Minifying ${OUTPUT_JS_FILE} to ${OUTPUT_MIN_JS_FILE}"

uglifyjs ${OUTPUT_JS_FILE} -c -o ${OUTPUT_MIN_JS_FILE}

echo "Copying css file to ${OUTPUT_CSS_FILE}"

cp -f css/diff2html.css ${OUTPUT_CSS_FILE}

echo "Minifying ${OUTPUT_CSS_FILE} to ${OUTPUT_MIN_CSS_FILE}"

lessc -x ${OUTPUT_CSS_FILE} ${OUTPUT_MIN_CSS_FILE}

echo "diff2html release created successfully!"
