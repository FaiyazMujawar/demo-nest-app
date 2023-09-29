import Joi from 'joi';
import { ProductImportDto } from '../../uploads/xlsx/dto/Product';

export function validateImportProduct(product: ProductImportDto) {
  const schema = Joi.object({
    code: Joi.string().required().length(5).label('Product Code'),
    name: Joi.string().required().label('Product Name'),
    description: Joi.string().required().label('Description'),
    buyingPrice: Joi.number().positive().required().label('Buying Price'),
    sellingPrice: Joi.number().positive().required().label('Selling Price'),
  }).options({ abortEarly: false, allowUnknown: true });
  const validation = {};
  schema
    .validate(product)
    .error?.details?.forEach(
      ({ path, message }) => (validation[path.join('.')] = message),
    );
  return validation;
}
