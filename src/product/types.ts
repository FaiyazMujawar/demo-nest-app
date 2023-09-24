import { Market, Product } from '../schema';

export interface ProductResponse extends Product {
  markets: Market[];
}

export interface ProductRequest extends Product {
  markets: number[];
}
