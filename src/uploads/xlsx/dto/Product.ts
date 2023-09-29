import { XlsxColumn, XlsxColumnType } from '../decorators/xlsxcolumn.decorator';

const { STRING, REAL, INT } = XlsxColumnType;

export class ProductImportDto {
  @XlsxColumn({ name: 'Name', type: STRING })
  name: string = undefined;

  @XlsxColumn({ name: 'Description', type: STRING })
  description: string = undefined;

  @XlsxColumn({ name: 'Buying Price', type: REAL })
  buyingPrice: number = undefined;

  @XlsxColumn({ name: 'Selling Price', type: REAL })
  sellingPrice: number = undefined;

  @XlsxColumn({ name: 'Market', type: INT })
  market: number = undefined;
}
