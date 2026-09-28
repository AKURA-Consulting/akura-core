export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const COMMON_TYPES = new Set(["string", "number"]);

function validCalendarDate(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return false;
  const [, year, month, day] = match;
  const normalized = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return normalized.getUTCFullYear() === Number(year) && normalized.getUTCMonth() === Number(month) - 1 && normalized.getUTCDate() === Number(day);
}

function validateValue(field, value, definition) {
  if (value === null && definition.nullable) return;
  if (definition.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new ApiError(400, `${field} debe ser un número válido.`);
    }
    if (definition.min !== undefined && value < definition.min) throw new ApiError(400, `${field} está fuera de rango.`);
    if (definition.max !== undefined && value > definition.max) throw new ApiError(400, `${field} está fuera de rango.`);
    return;
  }
  if (typeof value !== "string") throw new ApiError(400, `${field} debe ser texto.`);
  if (definition.maxLength && value.length > definition.maxLength) throw new ApiError(400, `${field} supera el máximo permitido.`);
  if (definition.values && !definition.values.includes(value)) throw new ApiError(400, `${field} contiene un valor no permitido.`);
  if (definition.format === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new ApiError(400, `${field} no tiene formato de email válido.`);
  if (definition.format === "date" && value) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/);
    if (!match || Number.isNaN(Date.parse(value))) throw new ApiError(400, `${field} debe usar una fecha ISO válida.`);
    if (!validCalendarDate(value)) throw new ApiError(400, `${field} debe usar una fecha ISO válida.`);
  }
  if (definition.format === "dateTime" && value && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value)) || !validCalendarDate(value))) {
    throw new ApiError(400, `${field} debe usar un timestamp ISO válido.`);
  }
}

function cleanInput(body, resource, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError(400, "El cuerpo debe ser un objeto JSON.");
  const output = {};
  for (const [field, value] of Object.entries(body)) {
    if (!Object.hasOwn(resource.fields, field)) throw new ApiError(400, `Campo no permitido: ${field}.`);
    validateValue(field, value, resource.fields[field]);
    output[field] = value;
  }
  for (const field of resource.required) {
    const value = body[field];
    const emptyString = typeof value === "string" && value.trim() === "";
    if ((!partial || Object.hasOwn(body, field)) && (value === undefined || value === null || emptyString)) {
      throw new ApiError(400, `El campo ${field} es obligatorio.`);
    }
  }
  if (!Object.keys(output).length) throw new ApiError(400, "Envía al menos un campo válido.");
  return output;
}

function databaseError(error) {
  const message = String(error?.message || "");
  if (/constraint failed|foreign key/i.test(message)) return new ApiError(400, "La operación viola una relación o restricción de datos.");
  return error;
}

function alignOpportunityStatus(values, current = {}) {
  const stage = values.stage ?? current.stage ?? "qualification";
  const expectedStatus = stage === "closed_won" ? "won" : stage === "closed_lost" ? "lost" : undefined;
  if (expectedStatus && values.status !== undefined && values.status !== expectedStatus) {
    throw new ApiError(400, "El estado debe coincidir con la etapa de la oportunidad.");
  }
  if (expectedStatus) values.status = expectedStatus;
  else if (["won", "lost"].includes(values.status ?? current.status)) {
    throw new ApiError(400, "Una oportunidad ganada o perdida debe usar una etapa de cierre.");
  }
}

export function createResourceHandler(resource) {
  const columns = Object.keys(resource.fields);
  const selectColumns = ["id", ...columns, "created_at", ...(resource.updatedAt ? ["updated_at"] : [])].join(", ");

  return async function handle(request, env, id) {
    const { method } = request;
    try {
      if (method === "GET" && id) {
        const row = await env.DB.prepare(`SELECT ${selectColumns} FROM ${resource.table} WHERE id = ?`).bind(id).first();
        if (!row) throw new ApiError(404, `${resource.label} no encontrado.`);
        return { status: 200, data: row };
      }
      if (method === "GET") {
        const url = new URL(request.url);
        const search = (url.searchParams.get("search") || "").trim().slice(0, 100);
        let statement;
        if (search && resource.search.length) {
          const where = resource.search.map((field) => `LOWER(COALESCE(${field}, '')) LIKE LOWER(?) ESCAPE '\\'`).join(" OR ");
          const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
          const values = resource.search.map(() => `%${escapedSearch}%`);
          statement = env.DB.prepare(`SELECT ${selectColumns} FROM ${resource.table} WHERE ${where} ORDER BY created_at DESC LIMIT 200`).bind(...values);
        } else {
          statement = env.DB.prepare(`SELECT ${selectColumns} FROM ${resource.table} ORDER BY created_at DESC LIMIT 200`);
        }
        const result = await statement.all();
        return { status: 200, data: result.results || [] };
      }
      if (method === "POST") {
        const values = cleanInput(await request.json().catch(() => { throw new ApiError(400, "JSON inválido."); }), resource);
        if (resource.table === "opportunities") alignOpportunityStatus(values);
        const now = new Date().toISOString();
        const row = { id: crypto.randomUUID(), ...values, created_at: now };
        if (resource.updatedAt) row.updated_at = now;
        const insertColumns = Object.keys(row);
        const placeholders = insertColumns.map(() => "?").join(", ");
        await env.DB.prepare(`INSERT INTO ${resource.table} (${insertColumns.join(", ")}) VALUES (${placeholders})`)
          .bind(...insertColumns.map((key) => row[key])).run();
        const saved = await env.DB.prepare(`SELECT ${selectColumns} FROM ${resource.table} WHERE id = ?`).bind(row.id).first();
        return { status: 201, data: saved };
      }
      if (method === "PUT" && id) {
        const values = cleanInput(await request.json().catch(() => { throw new ApiError(400, "JSON inválido."); }), resource, { partial: true });
        if (resource.table === "opportunities") {
          const current = await env.DB.prepare("SELECT stage, status FROM opportunities WHERE id = ?").bind(id).first();
          if (!current) throw new ApiError(404, `${resource.label} no encontrado.`);
          alignOpportunityStatus(values, current);
        }
        if (resource.updatedAt) values.updated_at = new Date().toISOString();
        const assignments = Object.keys(values).map((field) => `${field} = ?`).join(", ");
        const result = await env.DB.prepare(`UPDATE ${resource.table} SET ${assignments} WHERE id = ?`)
          .bind(...Object.values(values), id).run();
        if (!result.meta?.changes) throw new ApiError(404, `${resource.label} no encontrado.`);
        const row = await env.DB.prepare(`SELECT ${selectColumns} FROM ${resource.table} WHERE id = ?`).bind(id).first();
        return { status: 200, data: row };
      }
      if (method === "DELETE" && id) {
        const result = await env.DB.prepare(`DELETE FROM ${resource.table} WHERE id = ?`).bind(id).run();
        if (!result.meta?.changes) throw new ApiError(404, `${resource.label} no encontrado.`);
        return { status: 200, data: { id, deleted: true } };
      }
      throw new ApiError(405, "Método no permitido.");
    } catch (error) {
      throw databaseError(error);
    }
  };
}

export function defineResource(table, label, fields, required, search = []) {
  for (const [name, definition] of Object.entries(fields)) {
    if (!COMMON_TYPES.has(definition.type)) throw new Error(`Tipo de campo inválido: ${name}`);
  }
  return { table, label, fields, required, search, updatedAt: table !== "activities" };
}
