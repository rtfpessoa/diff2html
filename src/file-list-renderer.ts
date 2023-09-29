import * as renderUtils from './render-utils';
import HoganJsUtils from './hoganjs-utils';
import { ColorSchemeType, DiffFile } from './types';

const baseTemplatesPath = 'file-summary';
const iconsBaseTemplatesPath = 'icon';

export interface FileListRendererConfig {
  colorScheme?: ColorSchemeType;
}

export const defaultFileListRendererConfig = {
  colorScheme: renderUtils.defaultRenderConfig.colorScheme,
};

export class FileListRenderer {
  private readonly hoganUtils: HoganJsUtils;
  private readonly config: typeof defaultFileListRendererConfig;

  constructor(hoganUtils: HoganJsUtils, config: FileListRendererConfig = {}) {
    this.hoganUtils = hoganUtils;
    this.config = { ...defaultFileListRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string {
    const files = diffFiles
      .map(file =>
        this.hoganUtils.render(
          baseTemplatesPath,
          'line',
          {
            fileHtmlId: renderUtils.getHtmlId(file),
            oldName: file.oldName,
            newName: file.newName,
            fileName: renderUtils.filenameDiff(file),
            deletedLines: '-' + file.deletedLines,
            addedLines: '+' + file.addedLines,
          },
          {
            fileIcon: this.hoganUtils.template(iconsBaseTemplatesPath, renderUtils.getFileIcon(file)),
          },
        ),
      )
      .join('\n');

    return this.hoganUtils.render(baseTemplatesPath, 'wrapper', {
      colorScheme: renderUtils.colorSchemeToCss(this.config.colorScheme),
      filesNumber: diffFiles.length,
      files: files,
    });
  }
}
