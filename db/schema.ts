import {
  pgTable,
  varchar,
  timestamp,
  text,
  boolean,
  index,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";



/* ============================
   ENUMS
============================ */

export const taxPercentageEnum = pgEnum("tax_percentage", [
  "0",
  "5",
  "12",
  "18",
  "28",
  "40",
]);

export const unitsEnum = pgEnum("units", [
  "pieces",
  "kilograms", 
  "boxes",
  "sets",
  "units",
  "others",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "invoice",
  "delivery_challan",
  "proforma_invoice",
  "shipping_label",
  "quotation",
  "estimate",
]);


export const pageSizeEnum = pgEnum("page_size", [
  "A4",
  "A3",
  "A5",
  "Letter",
  "Legal",
]);

/* ============================
   ORGANIZATIONS
============================ */

 // Organizations table removed — organization info is no longer stored
// in a dedicated table. Organization identifiers may still be stored on
// the `users` rows as plain strings when available.

/* ============================
   USERS
============================ */



export const usersTable = pgTable(
  "users",
  {
    id: varchar("id", { length: 255 }).primaryKey(), // Clerk user ID

    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).unique(), // Made nullable to handle missing email data
    // orgId may be nullable for users who sign up without an organization
    // orgId is an optional plain string (no organizations table reference)
    orgId: varchar("org_id", { length: 255 }),

    // Clerk-specific fields
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
    
    // Profile data from Clerk
    imageUrl: text("image_url"),
    metadata: text("metadata"), // JSON string for additional Clerk data

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    orgIdIdx: index("users_org_id_idx").on(table.orgId),
    clerkUserIdIdx: index("users_clerk_user_id_idx").on(table.clerkUserId),
    emailIdx: index("users_email_idx").on(table.email),
  })
);

/* ============================
   CLIENTS
============================ */

export const clientsTable = pgTable(
  "clients",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'client_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

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

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("clients_user_id_idx").on(table.userId),
    orgIdIdx: index("clients_org_id_idx").on(table.orgId),
  })
);

/* ============================
   PRODUCTS
============================ */

export const productsTable = pgTable(
  "products",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'product_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    orgId: varchar("org_id", { length: 255 }).notNull(),

    isService: boolean("is_service").default(false).notNull(),

    name: varchar("name", { length: 255 }).notNull(),

    sellingPrice: decimal("selling_price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    taxPercentage: taxPercentageEnum("tax_percentage")
      .default("0")
      .notNull(),

    isPriceTaxInclusive: boolean("is_price_tax_inclusive")
      .default(false)
      .notNull(),

    primaryUnits: unitsEnum("primary_units")
      .default("pieces")
      .notNull(),

    hsnSacCode: varchar("hsn_sac_code", { length: 20 }),

    productImage: text("product_image"),

    availableStock: decimal("available_stock", {
      precision: 10,
      scale: 2,
    })
      .default("0.00")
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("products_user_id_idx").on(table.userId),
    orgIdIdx: index("products_org_id_idx").on(table.orgId),
    isServiceIdx: index("products_is_service_idx").on(table.isService),
    nameIdx: index("products_name_idx").on(table.name),
  })
);




/* ============================
   SIGNATURES
============================ */

export const signaturesTable = pgTable(
  "signatures",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'signature_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    orgId: varchar("org_id", { length: 255 }).notNull(),
    
    name: varchar("name", { length: 255 }).notNull(),
    
    imageUrl: text("image_url").notNull(),
    
    isDefault: boolean("is_default").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("signatures_user_id_idx").on(table.userId),
    orgIdIdx: index("signatures_org_id_idx").on(table.orgId),
    defaultIdx: index("signatures_default_idx").on(table.isDefault),
  })
);


/* ============================
   BANK DETAILS
============================ */

export const bankDetailsTable = pgTable(
  "bank_details",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'bank_detail_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    orgId: varchar("org_id", { length: 255 }).notNull(),
    
    accountHolderName: varchar("account_holder_name", { length: 255 }).notNull(),
    bankName: varchar("bank_name", { length: 255 }).notNull(),
    accountNumber: varchar("account_number", { length: 50 }).notNull(),
    ifscCode: varchar("ifsc_code", { length: 20 }),
    swiftCode: varchar("swift_code", { length: 20 }),
    branchName: varchar("branch_name", { length: 255 }),
    upiId: varchar("upi_id", { length: 255 }),
    
    isDefault: boolean("is_default").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("bank_details_user_id_idx").on(table.userId),
    orgIdIdx: index("bank_details_org_id_idx").on(table.orgId),
    defaultIdx: index("bank_details_default_idx").on(table.isDefault),
  })
);


/* ============================
   COMPANY DETAILS
============================ */

export const companyDetailsTable = pgTable(
  "company_details",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'company_detail_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    orgId: varchar("org_id", { length: 255 }).notNull(),
    
    companyName: varchar("company_name", { length: 255 }),
    legalName: varchar("legal_name", { length: 255 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 10 }),
    gst: varchar("gst", { length: 20 }),
    pan: varchar("pan", { length: 20 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    logoUrl: text("logo_url"),
    
    isDefault: boolean("is_default").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("company_details_user_id_idx").on(table.userId),
    orgIdIdx: index("company_details_org_id_idx").on(table.orgId),
    defaultIdx: index("company_details_default_idx").on(table.isDefault),
    gstIdx: index("company_details_gst_idx").on(table.gst),
  })
);

/* ============================
   DOCUMENT SETTINGS
============================ */

export const documentSettingsTable = pgTable(
  "document_settings",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'doc_setting_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    orgId: varchar("org_id", { length: 255 }).notNull(),
    
    documentType: documentTypeEnum("document_type").notNull(),
    prefix: varchar("prefix", { length: 50 }),
    nextNumber: decimal("next_number", {
      precision: 10,
      scale: 0,
    }).default("1").notNull(),
    showQrCode: boolean("show_qr_code").default(false).notNull(),
    pageSize: pageSizeEnum("page_size").default("A4").notNull(),
    termsConditions: text("terms_conditions"),
    notes: text("notes"),
    
    isDefault: boolean("is_default").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("document_settings_user_id_idx").on(table.userId),
    orgIdIdx: index("document_settings_org_id_idx").on(table.orgId),
    documentTypeIdx: index("document_settings_document_type_idx").on(table.documentType),
    defaultIdx: index("document_settings_default_idx").on(table.isDefault),
  })
);




/* ============================
   INVOICES
============================ */

export const invoicesTable = pgTable(
  "invoices",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'invoice_' || gen_random_uuid()`),

    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    orgId: varchar("org_id", { length: 255 }).notNull(),
    
    invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
    clientId: varchar("client_id", { length: 255 })
      .notNull()
      .references(() => clientsTable.id, { onDelete: "restrict" }),

    invoiceDate: timestamp("invoice_date", { withTimezone: true })
      .defaultNow()
      .notNull(),

    dueDate: timestamp("due_date", { withTimezone: true }),
    
    referenceNumber: varchar("reference_number", { length: 100 }),
    
    subtotal: decimal("subtotal", {
      precision: 12,
      scale: 2,
    }).notNull(),

    taxAmount: decimal("tax_amount", {
      precision: 12,
      scale: 2,
    }).default("0.00").notNull(),

    totalAmount: decimal("total_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    paidAmount: decimal("paid_amount", {
      precision: 12,
      scale: 2,
    }).default("0.00").notNull(),

    balanceAmount: decimal("balance_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    status: varchar("status", { length: 50 })
      .default("draft")
      .notNull(),

    notes: text("notes"),
    termsConditions: text("terms_conditions"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("invoices_user_id_idx").on(table.userId),
    orgIdIdx: index("invoices_org_id_idx").on(table.orgId),
    clientIdIdx: index("invoices_client_id_idx").on(table.clientId),
    invoiceNumberIdx: index("invoices_invoice_number_idx").on(table.invoiceNumber),
    statusIdx: index("invoices_status_idx").on(table.status),
    invoiceDateIdx: index("invoices_invoice_date_idx").on(table.invoiceDate),
  })
);

/* ============================
   INVOICE ITEMS
============================ */

export const invoiceItemsTable = pgTable(
  "invoice_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => sql`'invoice_item_' || gen_random_uuid()`),

    invoiceId: varchar("invoice_id", { length: 255 })
      .notNull()
      .references(() => invoicesTable.id, { onDelete: "cascade" }),

    productId: varchar("product_id", { length: 255 })
      .references(() => productsTable.id, { onDelete: "restrict" }),

    itemName: varchar("item_name", { length: 255 }).notNull(),
    description: text("description"),
    
    quantity: decimal("quantity", {
      precision: 10,
      scale: 2,
    }).notNull(),

    rate: decimal("rate", {
      precision: 10,
      scale: 2,
    }).notNull(),

    taxPercentage: taxPercentageEnum("tax_percentage")
      .default("0")
      .notNull(),

    taxAmount: decimal("tax_amount", {
      precision: 10,
      scale: 2,
    }).default("0.00").notNull(),

    totalAmount: decimal("total_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    hsnSacCode: varchar("hsn_sac_code", { length: 20 }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    invoiceIdIdx: index("invoice_items_invoice_id_idx").on(table.invoiceId),
    productIdIdx: index("invoice_items_product_id_idx").on(table.productId),
  })
);

/* ============================
   TYPES
============================ */

// Organization type removed (no organizations table)

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Client = typeof clientsTable.$inferSelect;
export type NewClient = typeof clientsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type Signature = typeof signaturesTable.$inferSelect;
export type NewSignature = typeof signaturesTable.$inferInsert;
export type BankDetail = typeof bankDetailsTable.$inferSelect;
export type NewBankDetail = typeof bankDetailsTable.$inferInsert;

export type CompanyDetail = typeof companyDetailsTable.$inferSelect;
export type NewCompanyDetail = typeof companyDetailsTable.$inferInsert;
export type DocumentSetting = typeof documentSettingsTable.$inferSelect;
export type NewDocumentSetting = typeof documentSettingsTable.$inferInsert;

export type Invoice = typeof invoicesTable.$inferSelect;
export type NewInvoice = typeof invoicesTable.$inferInsert;
export type InvoiceItem = typeof invoiceItemsTable.$inferSelect;
export type NewInvoiceItem = typeof invoiceItemsTable.$inferInsert;
