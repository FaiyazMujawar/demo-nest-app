export enum XlsxColumnType {
  STRING = 'General',
  INT = '0',
  REAL = '#,##0.00',
  DATE = 'dd-mm-yyyy',
}

export interface XlsxColumnOptions {
  name: string;
  type: XlsxColumnType;
  transform?: (value: string | any) => any;
}

export const XLSX_COLUMN_KEY = 'XLSX_COLUMN_KEY';

export function XlsxColumn(metadata: XlsxColumnOptions): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(XLSX_COLUMN_KEY, metadata, target, propertyKey);
  };
}
