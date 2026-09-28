import { defineResource } from "./resource.js";

export default defineResource("companies", "Empresa", {
  name: { type: "string", maxLength: 200 }, legal_name: { type: "string", nullable: true, maxLength: 240 },
  tax_id: { type: "string", nullable: true, maxLength: 80 }, industry: { type: "string", nullable: true, maxLength: 120 },
  website: { type: "string", nullable: true, maxLength: 240 }, email: { type: "string", nullable: true, maxLength: 240, format: "email" },
  phone: { type: "string", nullable: true, maxLength: 80 }, address: { type: "string", nullable: true, maxLength: 240 },
  city: { type: "string", nullable: true, maxLength: 120 }, province: { type: "string", nullable: true, maxLength: 120 },
  country: { type: "string", nullable: true, maxLength: 120 }, status: { type: "string", maxLength: 40, values: ["active", "inactive", "prospect"] },
  notes: { type: "string", nullable: true, maxLength: 5000 }
}, ["name"], ["name", "legal_name", "tax_id", "email"]);
