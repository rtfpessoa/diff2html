import * as DiffParser from './diff-parser';
import * as fileListPrinter from './file-list-renderer';
import LineByLineRenderer, { LineByLineRendererConfig, defaultLineByLineRendererConfig } from './line-by-line-renderer';
import SideBySideRenderer, { SideBySideRendererConfig, defaultSideBySideRendererConfig } from './side-by-side-renderer';
import { DiffFile, OutputFormatType } from './types';
import HoganJsUtils, { HoganJsUtilsConfig } from './hoganjs-utils';

export interface Diff2HtmlConfig
  extends DiffParser.DiffParserConfig,
    LineByLineRendererConfig,
    SideBySideRendererConfig,
    HoganJsUtilsConfig {
  outputFormat?: OutputFormatType;
  drawFileList?: boolean;
  lazy?: boolean;
}

export const defaultDiff2HtmlConfig = {
  ...defaultLineByLineRendererConfig,
  ...defaultSideBySideRendererConfig,
  outputFormat: OutputFormatType.LINE_BY_LINE,
  drawFileList: true,
  lazy: false,
};

export function parse(diffInput: string, configuration: Diff2HtmlConfig = {}): DiffFile[] {
  return DiffParser.parse(diffInput, { ...defaultDiff2HtmlConfig, ...configuration });
}

export function html(diffInput: string | DiffFile[], configuration: Diff2HtmlConfig = {}): string {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };

  const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;

  const hoganUtils = new HoganJsUtils(config);

  const fileList = config.drawFileList ? fileListPrinter.render(diffJson, hoganUtils) : '';

  const diffOutput =
    config.outputFormat === 'side-by-side'
      ? new SideBySideRenderer(hoganUtils, config).render(config.lazy ? [] : diffJson)
      : new LineByLineRenderer(hoganUtils, config).render(config.lazy ? [] : diffJson);

  return fileList + diffOutput;
}

export function htmlFile(diffFile: DiffFile, configuration: Diff2HtmlConfig = {}): string {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };

  const hoganUtils = new HoganJsUtils(config);

  return config.outputFormat === 'side-by-side'
      ? new SideBySideRenderer(hoganUtils, config).renderFile(diffFile)
      : new LineByLineRenderer(hoganUtils, config).renderFile(diffFile);
}
