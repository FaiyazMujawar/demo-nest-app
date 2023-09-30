import { relations } from 'drizzle-orm';
import { MARKETS } from './market';
import { PRODUCTS, PRODUCT_MARKET } from './product';
import { USERS, USER_MARKET } from './user';

// ######################## USER RELATIONS #################################

export const USER_RELATIONS = relations(USERS, ({ many }) => ({
  markets: many(USER_MARKET),
}));

export const USER_MARKET_RELATIONS = relations(USER_MARKET, ({ one }) => ({
  user: one(USERS, {
    fields: [USER_MARKET.userId],
    references: [USERS.id],
  }),
  market: one(MARKETS, {
    fields: [USER_MARKET.marketCode],
    references: [MARKETS.code],
  }),
}));

// ######################## PRODUCT RELATIONS ##############################

// RELATIONS FOR `PRODUCTS` TABLE
export const PRODUCT_RELATIONS = relations(PRODUCTS, ({ many }) => ({
  // PRODUCTS(one) => PRODUCT_MARKET(many) relation
  markets: many(PRODUCT_MARKET),
}));

// RELATIONS FOR `PRODUCT_MARKET` TABLE
export const PRODUCT_MARKET_RELATIONS = relations(
  PRODUCT_MARKET,
  ({ one }) => ({
    // PRODUCT_MARKET(many) => PRODUCTS(one) relation
    products: one(PRODUCTS, {
      fields: [PRODUCT_MARKET.productId],
      references: [PRODUCTS.id],
    }),
    // PRODUCT_MARKET(many) => MARKETS(one) relation
    markets: one(MARKETS, {
      fields: [PRODUCT_MARKET.marketCode],
      references: [MARKETS.code],
    }),
  }),
);

// ######################## MARKET RELATIONS ##############################

export const MARKET_RELATIONS = relations(MARKETS, ({ many }) => ({
  // MARKETS(one) => PRODUCT_MARKET(many) relations
  products: many(PRODUCT_MARKET),
  users: many(USER_MARKET),
}));
