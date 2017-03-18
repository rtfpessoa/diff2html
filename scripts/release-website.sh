#!/bin/bash

#
# diff2html website release script
# by rtfpessoa
#

set -e

INPUT_DIR=website
INPUT_DEMO_JS=${INPUT_DIR}/templates/pages/demo/demo.js
INPUT_CSS_FILE=${INPUT_DIR}/main.css

OUTPUT_DIR=docs
OUTPUT_DEMO_JS=${OUTPUT_DIR}/demo.js
OUTPUT_DEMO_MIN_JS=${OUTPUT_DIR}/demo.min.js
OUTPUT_CSS_FILE=${OUTPUT_DIR}/main.css
OUTPUT_MIN_CSS_FILE=${OUTPUT_DIR}/main.min.css

echo "Creating diff2html website release ..."

echo "Cleaning previous versions ..."
rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

echo "Minifying ${OUTPUT_CSS_FILE} to ${OUTPUT_MIN_CSS_FILE}"
postcss --use autoprefixer -o ${OUTPUT_CSS_FILE} ${INPUT_CSS_FILE}
cleancss --advanced --compatibility=ie8 -o ${OUTPUT_MIN_CSS_FILE} ${OUTPUT_CSS_FILE}

echo "Generating website js aggregation file in ${OUTPUT_DEMO_JS}"
browserify -e ${INPUT_DEMO_JS} -o ${OUTPUT_DEMO_JS}

echo "Minifying ${OUTPUT_DEMO_JS} to ${OUTPUT_DEMO_MIN_JS}"
uglifyjs ${OUTPUT_DEMO_JS} -c -o ${OUTPUT_DEMO_MIN_JS}

echo "Generating HTMLs from templates ..."
node ./scripts/release-website.js

echo "Copying static files ..."
cp -rf ${INPUT_DIR}/img ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/CNAME ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/favicon.ico ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/robots.txt ${OUTPUT_DIR}/
cp -f ${INPUT_DIR}/sitemap.xml ${OUTPUT_DIR}/

echo "Creating diff2html assets symlink ..."
ln -s ../dist docs/assets

echo "diff2html website release created successfully!"
