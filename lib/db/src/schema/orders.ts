import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { menuItemsTable } from "./menuItems";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "completed",
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  tableNumber: integer("table_number").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalPrice: numeric("total_price", { precision: 10, scale: 3 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("orders_status_idx").on(table.status),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
}));

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  menuItemId: integer("menu_item_id")
    .notNull()
    .references(() => menuItemsTable.id, { onDelete: "cascade" }),
  menuItemName: text("menu_item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 3 }).notNull(),
}, (table) => ({
  orderIdx: index("order_items_order_idx").on(table.orderId),
}));

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({
  id: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
