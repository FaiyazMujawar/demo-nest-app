import { ProductResponse } from '../product/types';
import { Market, Product, User } from '../schema';

export function toUserResponse(user: User, market: Market | undefined) {
  delete user.password;
  return {
    ...user,
    market,
  };
}

export function toProductResponses(
  ...products: {
    product: Product;
    market: Market;
  }[]
): ProductResponse[] {
  const result: { id?: string; product?: ProductResponse } = {};
  products.forEach(({ product, market }) => {
    if (result[product.id] === undefined) {
      result[product.id] = {
        ...product,
        markets: [market],
      };
    } else {
      result[product.id].markets.push(market);
    }
  });
  return Object.values(result) as ProductResponse[];
}
