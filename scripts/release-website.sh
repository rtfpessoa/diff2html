#!/bin/bash

set -e

SCRIPT_DIRECTORY="$( cd "$( dirname "$0" )" && pwd )"

INPUT_DIR=${SCRIPT_DIRECTORY}/../website
INPUT_DEMO_JS=${INPUT_DIR}/templates/pages/demo/demo.js
INPUT_CSS_FILE=${INPUT_DIR}/main.css

OUTPUT_DIR=${SCRIPT_DIRECTORY}/../docs
OUTPUT_DEMO_JS=${OUTPUT_DIR}/demo.js
OUTPUT_DEMO_MIN_JS=${OUTPUT_DIR}/demo.min.js
OUTPUT_CSS_FILE=${OUTPUT_DIR}/main.css
OUTPUT_MIN_CSS_FILE=${OUTPUT_DIR}/main.min.css

echo "Creating diff2html website release ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}/assets

echo "Minifying ${OUTPUT_CSS_FILE} to ${OUTPUT_MIN_CSS_FILE}"
postcss --use autoprefixer -o ${OUTPUT_CSS_FILE} ${INPUT_CSS_FILE}
cleancss --advanced --compatibility=ie8 -o ${OUTPUT_MIN_CSS_FILE} ${OUTPUT_CSS_FILE}

echo "Generating website js aggregation file in ${OUTPUT_DEMO_JS}"
browserify -e ${INPUT_DEMO_JS} -o ${OUTPUT_DEMO_JS}

echo "Minifying ${OUTPUT_DEMO_JS} to ${OUTPUT_DEMO_MIN_JS}"
terser ${OUTPUT_DEMO_JS} -c -o ${OUTPUT_DEMO_MIN_JS}

echo "Generating HTMLs from templates ..."
node ${SCRIPT_DIRECTORY}/release-website.js

echo "Copying static files ..."
cp -rf ${INPUT_DIR}/img ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/CNAME ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/favicon.ico ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/robots.txt ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/sitemap.xml ${OUTPUT_DIR}/

echo "Copying diff2html resources ..."
cp ${SCRIPT_DIRECTORY}/../build/browser/diff2html.min.js ${SCRIPT_DIRECTORY}/../docs/assets/
cp ${SCRIPT_DIRECTORY}/../build/browser/diff2html-ui.min.js ${SCRIPT_DIRECTORY}/../docs/assets/
cp ${SCRIPT_DIRECTORY}/../build/css/diff2html.min.css ${SCRIPT_DIRECTORY}/../docs/assets/

echo "diff2html website release created successfully!"
