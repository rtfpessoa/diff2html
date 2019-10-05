#!/bin/bash

#
# diff2html release script
# by rtfpessoa
#

set -e

INPUT_DIR=src
INTPUT_TEMPLATES_DIR=${INPUT_DIR}/templates
INPUT_UI_DIR=${INPUT_DIR}/ui
INPUT_JS_FILE=${INPUT_DIR}/diff2html.js
INPUT_JS_UI_FILE=${INPUT_UI_DIR}/js/diff2html-ui.js
INPUT_CSS_FILE=${INPUT_UI_DIR}/css/diff2html.css
INPUT_TYPINGS_D_TS_FILE=${INPUT_DIR}/diff2html.d.ts

GENERATED_TEMPLATES_FILE=${INTPUT_TEMPLATES_DIR}/diff2html-templates.js

OUTPUT_DIR=dist
OUTPUT_JS_FILE=${OUTPUT_DIR}/diff2html.js
OUTPUT_MIN_JS_FILE=${OUTPUT_DIR}/diff2html.min.js
OUTPUT_JS_UI_FILE=${OUTPUT_DIR}/diff2html-ui.js
OUTPUT_MIN_JS_UI_FILE=${OUTPUT_DIR}/diff2html-ui.min.js
OUTPUT_CSS_FILE=${OUTPUT_DIR}/diff2html.css
OUTPUT_MIN_CSS_FILE=${OUTPUT_DIR}/diff2html.min.css
OUTPUT_TYPINGS_D_TS_FILE=${OUTPUT_DIR}/diff2html.d.ts

echo "Creating diff2html release ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

echo "Minifying ${OUTPUT_CSS_FILE} to ${OUTPUT_MIN_CSS_FILE}"
postcss --use autoprefixer -o ${OUTPUT_CSS_FILE} ${INPUT_CSS_FILE}
cleancss --advanced --compatibility=ie8 -o ${OUTPUT_MIN_CSS_FILE} ${OUTPUT_CSS_FILE}

echo "Pre-compile hogan.js templates"
yarn run templates

echo "Generating js aggregation file in ${OUTPUT_JS_FILE}"
browserify -e ${INPUT_JS_FILE} -o ${OUTPUT_JS_FILE}

echo "Minifying ${OUTPUT_JS_FILE} to ${OUTPUT_MIN_JS_FILE}"
uglifyjs ${OUTPUT_JS_FILE} -c -o ${OUTPUT_MIN_JS_FILE}

echo "Generating js ui aggregation file in ${OUTPUT_JS_UI_FILE}"
browserify -e ${INPUT_JS_UI_FILE} -o ${OUTPUT_JS_UI_FILE}

echo "Minifying ${OUTPUT_JS_UI_FILE} to ${OUTPUT_MIN_JS_UI_FILE}"
uglifyjs ${OUTPUT_JS_UI_FILE} -c -o ${OUTPUT_MIN_JS_UI_FILE}

echo "Copying types ${INPUT_TYPINGS_D_TS_FILE} to ${OUTPUT_TYPINGS_D_TS_FILE}"
cp -f ${INPUT_TYPINGS_D_TS_FILE} ${OUTPUT_TYPINGS_D_TS_FILE}

echo "diff2html release created successfully!"
