import { defineResource } from "./resource.js";

export default defineResource("tasks", "Tarea", {
  company_id: { type: "string", nullable: true, maxLength: 36 }, contact_id: { type: "string", nullable: true, maxLength: 36 },
  opportunity_id: { type: "string", nullable: true, maxLength: 36 }, title: { type: "string", maxLength: 240 },
  description: { type: "string", nullable: true, maxLength: 5000 }, status: { type: "string", maxLength: 40, values: ["pending", "in_progress", "completed", "cancelled"] },
  priority: { type: "string", maxLength: 40, values: ["low", "medium", "high"] }, due_date: { type: "string", nullable: true, maxLength: 40, format: "date" },
  completed_at: { type: "string", nullable: true, maxLength: 40, format: "dateTime" }
}, ["title"], ["title", "description", "status"]);
