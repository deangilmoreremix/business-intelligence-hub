import { type FieldMetadataType } from './FieldMetadataType';
import { type FieldMetadataSettings } from './FieldMetadataSettings';
import { type FormatRecordSerializedRelationProperties } from './FormatRecordSerializedRelationProperties';

export type FieldMetadataUniversalSettings<
  T extends FieldMetadataType = FieldMetadataType,
> = FormatRecordSerializedRelationProperties<FieldMetadataSettings<T>>;
