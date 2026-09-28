import { defineResource } from "./resource.js";

export default defineResource("leads", "Lead", {
  company_id: { type: "string", nullable: true, maxLength: 36 }, contact_id: { type: "string", nullable: true, maxLength: 36 },
  title: { type: "string", maxLength: 240 }, source: { type: "string", nullable: true, maxLength: 120 },
  status: { type: "string", maxLength: 40, values: ["new", "open", "qualified", "converted", "lost"] },
  priority: { type: "string", maxLength: 40, values: ["low", "medium", "high"] },
  estimated_value: { type: "number", nullable: true, min: 0 }, notes: { type: "string", nullable: true, maxLength: 5000 }
}, ["title"], ["title", "source", "status"]);
