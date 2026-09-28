import { defineResource } from "./resource.js";

export default defineResource("contacts", "Contacto", {
  company_id: { type: "string", nullable: true, maxLength: 36 }, first_name: { type: "string", maxLength: 120 },
  last_name: { type: "string", maxLength: 120 }, email: { type: "string", nullable: true, maxLength: 240, format: "email" },
  phone: { type: "string", nullable: true, maxLength: 80 }, position: { type: "string", nullable: true, maxLength: 160 },
  status: { type: "string", maxLength: 40, values: ["active", "inactive"] }, notes: { type: "string", nullable: true, maxLength: 5000 }
}, ["first_name", "last_name"], ["first_name", "last_name", "email", "phone"]);
