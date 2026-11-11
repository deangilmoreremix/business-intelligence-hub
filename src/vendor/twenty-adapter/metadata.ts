/**
 * Object/field catalog describing this app's Supabase tables (contacts, deals, companies)
 * in the shape Twenty's page-layout widgets expect (EnrichedObjectMetadataItem / FieldMetadataItem).
 * Field `name`s are camelCase; the `dashboard_aggregate` RPC maps them to snake_case columns.
 */
import { v5 as uuidv5 } from 'uuid';
import { FieldMetadataType } from 'twenty-shared/types';

const NS = '6f1f5b0e-2f4e-4b1d-9a55-0a1c7c1d2e00';
export const metaId = (key: string): string => uuidv5(key, NS);

export type CatalogObjectName = 'contact' | 'deal' | 'company';
export const TABLE_BY_OBJECT: Record<CatalogObjectName, 'contacts' | 'deals' | 'companies'> = {
  contact: 'contacts',
  deal: 'deals',
  company: 'companies',
};

type Opt = { value: string; label: string; color: string };
type FieldSpec = { name: string; label: string; type: FieldMetadataType; icon?: string; options?: Opt[]; nullable?: boolean };

const STATUS_OPTIONS: Opt[] = [
  { value: 'lead', label: 'Lead', color: 'blue' },
  { value: 'prospect', label: 'Prospect', color: 'orange' },
  { value: 'customer', label: 'Customer', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
];

const T = FieldMetadataType;

const OBJECTS: Array<{
  nameSingular: CatalogObjectName; namePlural: string; labelSingular: string; labelPlural: string; icon: string; color: string;
  labelIdentifier: string; fields: FieldSpec[];
}> = [
  {
    nameSingular: 'contact', namePlural: 'contacts', labelSingular: 'Contact', labelPlural: 'Contacts', icon: 'IconUser', color: 'blue',
    labelIdentifier: 'firstName',
    fields: [
      { name: 'id', label: 'Id', type: T.UUID },
      { name: 'firstName', label: 'First name', type: T.TEXT },
      { name: 'lastName', label: 'Last name', type: T.TEXT },
      { name: 'email', label: 'Email', type: T.TEXT, nullable: true },
      { name: 'phone', label: 'Phone', type: T.TEXT, nullable: true },
      { name: 'company', label: 'Company', type: T.TEXT, nullable: true },
      { name: 'jobTitle', label: 'Job title', type: T.TEXT, nullable: true },
      { name: 'city', label: 'City', type: T.TEXT, nullable: true },
      { name: 'status', label: 'Status', type: T.SELECT, options: STATUS_OPTIONS },
      { name: 'leadScore', label: 'Lead score', type: T.NUMBER, nullable: true },
      { name: 'createdAt', label: 'Created', type: T.DATE_TIME },
      { name: 'updatedAt', label: 'Updated', type: T.DATE_TIME },
      { name: 'lastContactedAt', label: 'Last contacted', type: T.DATE_TIME, nullable: true },
    ],
  },
  {
    nameSingular: 'deal', namePlural: 'deals', labelSingular: 'Deal', labelPlural: 'Deals', icon: 'IconTargetArrow', color: 'green',
    labelIdentifier: 'title',
    fields: [
      { name: 'id', label: 'Id', type: T.UUID },
      { name: 'title', label: 'Title', type: T.TEXT },
      { name: 'value', label: 'Value', type: T.NUMBER, nullable: true },
      { name: 'stageId', label: 'Stage', type: T.TEXT, nullable: true },
      { name: 'probability', label: 'Probability', type: T.NUMBER, nullable: true },
      { name: 'assignedTo', label: 'Assigned to', type: T.TEXT, nullable: true },
      { name: 'expectedCloseDate', label: 'Expected close', type: T.DATE_TIME, nullable: true },
      { name: 'createdAt', label: 'Created', type: T.DATE_TIME },
      { name: 'updatedAt', label: 'Updated', type: T.DATE_TIME },
    ],
  },
  {
    nameSingular: 'company', namePlural: 'companies', labelSingular: 'Company', labelPlural: 'Companies', icon: 'IconBuildingSkyscraper', color: 'purple',
    labelIdentifier: 'name',
    fields: [
      { name: 'id', label: 'Id', type: T.UUID },
      { name: 'name', label: 'Name', type: T.TEXT },
      { name: 'domain', label: 'Domain', type: T.TEXT, nullable: true },
      { name: 'industry', label: 'Industry', type: T.TEXT, nullable: true },
      { name: 'employees', label: 'Employees', type: T.NUMBER, nullable: true },
      { name: 'createdAt', label: 'Created', type: T.DATE_TIME },
      { name: 'updatedAt', label: 'Updated', type: T.DATE_TIME },
    ],
  },
];

const NOW = '2026-01-01T00:00:00.000Z';

export const buildCatalog = () => {
  const flatObjects: Record<string, unknown>[] = [];
  const flatFields: Record<string, unknown>[] = [];

  for (const o of OBJECTS) {
    const objectId = metaId(`object.${o.nameSingular}`);
    const fieldItems = o.fields.map((f, i) => ({
      id: metaId(`field.${o.nameSingular}.${f.name}`),
      universalIdentifier: metaId(`field.${o.nameSingular}.${f.name}`),
      objectMetadataId: objectId,
      name: f.name,
      label: f.label,
      type: f.type,
      icon: f.icon ?? null,
      description: null,
      isActive: true,
      isSystem: f.name === 'id',
      isNullable: f.nullable ?? false,
      isUnique: f.name === 'id',
      isCustom: false,
      isUIReadOnly: false,
      isUIEditable: f.name !== 'id',
      isLabelSyncedWithName: true,
      defaultValue: null,
      options: f.options?.map((opt, p) => ({ id: metaId(`opt.${o.nameSingular}.${f.name}.${opt.value}`), position: p, ...opt })) ?? null,
      settings: null,
      relation: null,
      morphRelations: null,
      createdAt: NOW,
      updatedAt: NOW,
      position: i,
    }));
    flatFields.push(...fieldItems);

    flatObjects.push({
      id: objectId,
      universalIdentifier: objectId,
      nameSingular: o.nameSingular,
      namePlural: o.namePlural,
      labelSingular: o.labelSingular,
      labelPlural: o.labelPlural,
      icon: o.icon,
      color: o.color,
      description: null,
      shortcut: null,
      isActive: true,
      isSystem: false,
      isCustom: false,
      isRemote: false,
      isSearchable: true,
      isAuditLogged: false,
      isLabelSyncedWithName: true,
      isUICreatable: true,
      isUIEditable: true,
      isUIReadOnly: false,
      openRecordIn: 'SIDE_PANEL',
      labelIdentifierFieldMetadataId: metaId(`field.${o.nameSingular}.${o.labelIdentifier}`),
      imageIdentifierFieldMetadataId: null,
      duplicateCriteria: null,
      disabledObjectPermissionActions: [],
      createdAt: NOW,
      updatedAt: NOW,
    });
  }
  return { flatObjects, flatFields };
};

export const getObjectId = (name: CatalogObjectName): string => metaId(`object.${name}`);
export const getFieldId = (object: CatalogObjectName, field: string): string => metaId(`field.${object}.${field}`);

export const CATALOG_OBJECTS = OBJECTS.map(o => ({ nameSingular: o.nameSingular, labelSingular: o.labelSingular, labelPlural: o.labelPlural, namePlural: o.namePlural, fields: o.fields }));
