import * as DiffParser from "./diff-parser";
import * as fileListPrinter from "./file-list-renderer";
import LineByLineRenderer, { LineByLineRendererConfig, defaultLineByLineRendererConfig } from "./line-by-line-renderer";
import SideBySideRenderer, { SideBySideRendererConfig, defaultSideBySideRendererConfig } from "./side-by-side-renderer";
import { DiffFile } from "./render-utils";
import HoganJsUtils, { HoganJsUtilsConfig } from "./hoganjs-utils";

type OutputFormatType = "line-by-line" | "side-by-side";

export interface Diff2HtmlConfig
  extends DiffParser.DiffParserConfig,
    LineByLineRendererConfig,
    SideBySideRendererConfig,
    HoganJsUtilsConfig {
  outputFormat?: OutputFormatType;
  drawFileList?: boolean;
}

export const defaultDiff2HtmlConfig = {
  ...defaultLineByLineRendererConfig,
  ...defaultSideBySideRendererConfig,
  outputFormat: "line-by-line" as OutputFormatType,
  drawFileList: true
};

export function parse(diffInput: string, configuration: Diff2HtmlConfig = {}): DiffFile[] {
  return DiffParser.parse(diffInput, { ...defaultDiff2HtmlConfig, ...configuration });
}

export function html(diffInput: string | DiffFile[], configuration: Diff2HtmlConfig = {}): string {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };

  const diffJson = typeof diffInput === "string" ? DiffParser.parse(diffInput, config) : diffInput;

  const hoganUtils = new HoganJsUtils(config);

  const fileList = config.drawFileList ? fileListPrinter.render(diffJson, hoganUtils) : "";

  const diffOutput =
    config.outputFormat === "side-by-side"
      ? new SideBySideRenderer(hoganUtils, config).render(diffJson)
      : new LineByLineRenderer(hoganUtils, config).render(diffJson);

  // TODO: Review error handling
  if (diffOutput === undefined) {
    throw new Error("OMG we haz no diff. Why???");
  }

  return fileList + diffOutput;
}
