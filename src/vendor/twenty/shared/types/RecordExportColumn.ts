import { type FieldMetadataType } from './FieldMetadataType';

export type RecordExportColumn = {
  fieldName: string;
  label: string;
  type: FieldMetadataType;
  subFieldName?: string;
};
