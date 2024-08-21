import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import { PgLiteral } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = {
  primary_uuid: {
    type: "uuid",
    primaryKey: true,
    notNull: true,
    default: PgLiteral.create("gen_random_uuid()"),
  },
  created_or_modified_at: {
    type: "timestamptz",
    notNull: true,
    default: PgLiteral.create("current_timestamp"),
  },
}

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("soup_group", {
    soup_group_id: "primary_uuid",
    soup_group_name: {
      type: "text",
      unique: true,
      notNull: true,
    },
    created_at: "created_or_modified_at",
  })

  pgm.createTable("soup", {
    soup_id: "primary_uuid",
    soup_group_id: {
      type: "uuid",
      notNull: true,
      references: "soup_group.soup_group_id",
    },
    soup_name: {
      type: "text",
      notNull: true,
    },
    created_at: "created_or_modified_at",
    modified_at: "created_or_modified_at",
    content: {
      type: "jsonb",
      notNull: true,
    },
  })
}
