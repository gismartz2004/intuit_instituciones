import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", [
  "super_admin",
  "admin",
  "teacher",
  "student",
]);
export const plansEnum = pgEnum("plans", ["digital", "plata", "pro"]);
export const userStatusEnum = pgEnum("user_status", ["active", "disabled"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: text("password").notNull(), // Should store a hashed password
  role: rolesEnum("role").notNull(),
  plan: plansEnum("plan"),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 100 }), // e.g., "4 weeks", "20 hours"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseAssignments = pgTable(
  "course_assignments",
  {
    userId: serial("user_id")
      .notNull()
      .references(() => users.id),
    courseId: serial("course_id")
      .notNull()
      .references(() => courses.id),
    role: rolesEnum("role").notNull(), // Role within the course: 'teacher' or 'student'
  },
  (table) => ({ pk: primaryKey({ columns: [table.userId, table.courseId] }) }),
);