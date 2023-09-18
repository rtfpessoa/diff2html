import * as renderUtils from './render-utils';
import HoganJsUtils from './hoganjs-utils';
import { DiffFile } from './types';

const baseTemplatesPath = 'file-summary';
const iconsBaseTemplatesPath = 'icon';

export class FileListRenderer {
  private readonly hoganUtils: HoganJsUtils;

  constructor(hoganUtils: HoganJsUtils) {
    this.hoganUtils = hoganUtils;
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
      filesNumber: diffFiles.length,
      files: files,
    });
  }
}
