import type { LibraryGame } from "@pages/api/games/library";

/** The five hybrid menu sections (playtime courses + rotating themed special). */
export type SectionId = "aperitifs" | "mains" | "chefs-table" | "desserts" | "todays-special";

/** Accent token keys — resolved to real colours in the web UI / PDF. */
export type SectionAccent = "olive" | "brick" | "plum" | "mustard" | "teal";

export interface SectionConfig {
  readonly id: SectionId;
  readonly icon: string;
  readonly label: string;
  readonly subtitle: string;
  readonly accent: SectionAccent;
  /** For Today's Special: the category/mechanic the section is themed on. */
  readonly themeTag?: string;
}

/** Section id → the games chosen for it. Shared by the page, PDF, and export. */
export interface MenuSelection {
  [sectionId: string]: LibraryGame[];
}

export interface GeneratedMenu {
  /** Ordered sections that actually have a slot in tonight's menu. */
  sections: SectionConfig[];
  selection: MenuSelection;
}
