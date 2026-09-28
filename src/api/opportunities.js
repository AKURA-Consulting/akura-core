import { defineResource } from "./resource.js";

export default defineResource("opportunities", "Oportunidad", {
  company_id: { type: "string", nullable: true, maxLength: 36 }, contact_id: { type: "string", nullable: true, maxLength: 36 },
  lead_id: { type: "string", nullable: true, maxLength: 36 }, title: { type: "string", maxLength: 240 },
  stage: { type: "string", maxLength: 60, values: ["qualification", "discovery", "proposal", "negotiation", "closed_won", "closed_lost"] }, probability: { type: "number", min: 0, max: 100 },
  estimated_value: { type: "number", nullable: true, min: 0 }, expected_close_date: { type: "string", nullable: true, maxLength: 40, format: "date" },
  status: { type: "string", maxLength: 40, values: ["open", "won", "lost", "on_hold"] }, notes: { type: "string", nullable: true, maxLength: 5000 }
}, ["title"], ["title", "stage", "status"]);
