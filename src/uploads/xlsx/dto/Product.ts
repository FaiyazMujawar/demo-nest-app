import { isNil, isNumber } from 'lodash';
import { XlsxColumn, XlsxColumnType } from '../decorators/xlsxcolumn.decorator';

const { STRING, REAL } = XlsxColumnType;

export class ProductImportDto {
  @XlsxColumn({ name: 'Product Code', type: STRING })
  code: string = undefined;

  @XlsxColumn({ name: 'Product Name', type: STRING })
  name: string = undefined;

  @XlsxColumn({ name: 'Description', type: STRING })
  description: string = undefined;

  @XlsxColumn({ name: 'Buying Price', type: REAL })
  buyingPrice: number = undefined;

  @XlsxColumn({ name: 'Selling Price', type: REAL })
  sellingPrice: number = undefined;

  @XlsxColumn({
    name: 'Markets',
    type: STRING,
    transform: (value) =>
      isNil(value)
        ? []
        : (value as string)
            .split(/,\s*/)
            .map((v) => parseInt(v))
            .filter((v) => isNumber(v)),
  })
  markets: number[] = [];
}
