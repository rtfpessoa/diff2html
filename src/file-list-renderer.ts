import * as renderUtils from "./render-utils";
import HoganJsUtils from "./hoganjs-utils";
import { DiffFile } from "./types";

const baseTemplatesPath = "file-summary";
const iconsBaseTemplatesPath = "icon";

export function render(diffFiles: DiffFile[], hoganUtils: HoganJsUtils): string {
  const files = diffFiles
    .map(file =>
      hoganUtils.render(
        baseTemplatesPath,
        "line",
        {
          fileHtmlId: renderUtils.getHtmlId(file),
          oldName: file.oldName,
          newName: file.newName,
          fileName: renderUtils.filenameDiff(file),
          deletedLines: "-" + file.deletedLines,
          addedLines: "+" + file.addedLines
        },
        {
          fileIcon: hoganUtils.template(iconsBaseTemplatesPath, renderUtils.getFileIcon(file))
        }
      )
    )
    .join("\n");

  return hoganUtils.render(baseTemplatesPath, "wrapper", {
    filesNumber: diffFiles.length,
    files: files
  });
}
