import * as DiffParser from './diff-parser';
import { FileListRenderer } from './file-list-renderer';
import LineByLineRenderer, { LineByLineRendererConfig, defaultLineByLineRendererConfig } from './line-by-line-renderer';
import SideBySideRenderer, { SideBySideRendererConfig, defaultSideBySideRendererConfig } from './side-by-side-renderer';
import WrappedSideBySideRenderer, {
  WrappedSideBySideRendererConfig,
  defaultWrappedSideBySideRendererConfig,
} from './wrapped-side-by-side-renderer';
import { DiffFile, OutputFormatType } from './types';
import HoganJsUtils, { HoganJsUtilsConfig } from './hoganjs-utils';

export interface Diff2HtmlConfig
  extends DiffParser.DiffParserConfig,
    LineByLineRendererConfig,
    SideBySideRendererConfig,
    WrappedSideBySideRendererConfig,
    HoganJsUtilsConfig {
  outputFormat?: OutputFormatType;
  drawFileList?: boolean;
}

export const defaultDiff2HtmlConfig = {
  ...defaultLineByLineRendererConfig,
  ...defaultSideBySideRendererConfig,
  ...defaultWrappedSideBySideRendererConfig,
  outputFormat: OutputFormatType.LINE_BY_LINE,
  drawFileList: true,
};

export function parse(diffInput: string, configuration: Diff2HtmlConfig = {}): DiffFile[] {
  return DiffParser.parse(diffInput, { ...defaultDiff2HtmlConfig, ...configuration });
}

export function html(diffInput: string | DiffFile[], configuration: Diff2HtmlConfig = {}): string {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };

  const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;

  const hoganUtils = new HoganJsUtils(config);

  const { colorScheme } = config;
  const fileListRendererConfig = { colorScheme };

  const fileList = config.drawFileList ? new FileListRenderer(hoganUtils, fileListRendererConfig).render(diffJson) : '';

  const diffOutput =
    config.outputFormat === 'line-by-line'
      ? new LineByLineRenderer(hoganUtils, config).render(diffJson)
      : config.outputFormat === 'side-by-side'
        ? new SideBySideRenderer(hoganUtils, config).render(diffJson)
        : new WrappedSideBySideRenderer(hoganUtils, config).render(diffJson);

  return fileList + diffOutput;
}
