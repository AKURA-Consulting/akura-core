import { defineResource } from "./resource.js";

export default defineResource("activities", "Actividad", {
  company_id: { type: "string", nullable: true, maxLength: 36 }, contact_id: { type: "string", nullable: true, maxLength: 36 },
  opportunity_id: { type: "string", nullable: true, maxLength: 36 }, type: { type: "string", maxLength: 60, values: ["call", "meeting", "email", "other"] },
  subject: { type: "string", maxLength: 240 }, description: { type: "string", nullable: true, maxLength: 5000 },
  activity_date: { type: "string", maxLength: 40, format: "dateTime" }
}, ["type", "subject", "activity_date"], ["type", "subject", "description"]);
