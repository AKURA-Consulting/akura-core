import { defineResource } from "./resource.js";

export default defineResource("notes", "Nota", {
  company_id: { type: "string", nullable: true, maxLength: 36 }, contact_id: { type: "string", nullable: true, maxLength: 36 },
  opportunity_id: { type: "string", nullable: true, maxLength: 36 }, title: { type: "string", maxLength: 240 },
  content: { type: "string", maxLength: 10000 }
}, ["title", "content"], ["title", "content"]);
