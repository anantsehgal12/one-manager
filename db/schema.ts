
import { 
  pgTable, 
  varchar, 
  timestamp, 
  text,
  boolean,
  primaryKey,
  foreignKey,
  index,
  decimal
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";



// Users table
export const usersTable = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // This will be Clerk user ID
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clerkUserIdIdx: index("users_clerk_user_id_idx").on(table.clerkUserId),
  orgIdIdx: index("users_org_id_idx").on(table.orgId),
}));


// Clients table



export const clientsTable = pgTable("clients", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => `client_${crypto.randomUUID()}`),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  gst: varchar("gst", { length: 20 }),
  mobileNo: varchar("mobile_no", { length: 15 }),
  email: varchar("email", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  billingMainAddress: text("billing_main_address"),
  billingPincode: varchar("billing_pincode", { length: 10 }),
  billingCity: varchar("billing_city", { length: 100 }),
  billingState: varchar("billing_state", { length: 100 }),
  billingCountry: varchar("billing_country", { length: 100 }).default("India"),
  shippingAddress: text("shipping_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

}, (table) => ({
  userIdIdx: index("clients_user_id_idx").on(table.userId),
  orgIdIdx: index("clients_org_id_idx").on(table.orgId),
}));

// Export types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Client = typeof clientsTable.$inferSelect;
export type NewClient = typeof clientsTable.$inferInsert;
