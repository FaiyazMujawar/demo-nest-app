import { XlsxColumnOptions } from './xlsx/decorators/xlsxcolumn.decorator';

export type FileUpoadType = 'products';

export interface XlsxConfig {
  [property: string]: XlsxColumnOptions;
}
