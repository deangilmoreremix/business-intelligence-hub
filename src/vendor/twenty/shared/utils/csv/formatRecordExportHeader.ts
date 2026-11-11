import { type RecordExportColumn } from '../../types/RecordExportColumn';
import { formatValueForCSV } from './formatValueForCSV';
import { sanitizeValueForCSVExport } from './sanitizeValueForCSVExport';

export const formatRecordExportHeader = (
  columns: Pick<RecordExportColumn, 'label'>[],
): string =>
  '\uFEFF' +
  columns
    .map((column) => formatValueForCSV(sanitizeValueForCSVExport(column.label)))
    .join(',') +
  '\n';
