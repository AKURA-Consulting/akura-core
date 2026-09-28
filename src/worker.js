import { createResourceHandler, ApiError } from "./api/resource.js";
import companies from "./api/companies.js";
import contacts from "./api/contacts.js";
import leads from "./api/leads.js";
import opportunities from "./api/opportunities.js";
import tasks from "./api/tasks.js";
import activities from "./api/activities.js";
import notes from "./api/notes.js";

const resources = new Map([
  ["companies", companies], ["contacts", contacts], ["leads", leads],
  ["opportunities", opportunities], ["tasks", tasks],
  ["activities", activities], ["notes", notes]
]);

function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

async function dashboardData(DB) {
  const statement = (sql, values) => {
    const prepared = DB.prepare(sql);
    return values.length ? prepared.bind(...values) : prepared;
  };
  const one = (sql, ...values) => statement(sql, values).first();
  const all = async (sql, ...values) => {
    const result = await statement(sql, values).all();
    return result.results || [];
  };
  const optional = (label, query) => query.catch((error) => {
    console.warn(`Dashboard section unavailable: ${label}`, { message: error?.message });
    return [];
  });
  const [companies, contacts, leads, opportunities, tasks, opportunityValue, pipeline, upcomingTasks, recentActivities, recentRecords] = await Promise.all([
    one("SELECT COUNT(*) AS total FROM companies"),
    one("SELECT COUNT(*) AS total FROM contacts"),
    one("SELECT COUNT(*) AS total FROM leads WHERE status IN (?, ?, ?)", "new", "open", "qualified"),
    one("SELECT COUNT(*) AS total FROM opportunities WHERE status = ?", "open"),
    one("SELECT COUNT(*) AS total FROM tasks WHERE status IN (?, ?)", "pending", "in_progress"),
    one("SELECT COALESCE(SUM(estimated_value), 0) AS total FROM opportunities WHERE status = ?", "open"),
    optional("pipeline", all("SELECT stage, COUNT(*) AS count, COALESCE(SUM(estimated_value), 0) AS total_value, COALESCE(AVG(probability), 0) AS average_probability, COALESCE(SUM(COALESCE(estimated_value, 0) * probability / 100), 0) AS weighted_value FROM opportunities GROUP BY stage ORDER BY CASE stage WHEN 'qualification' THEN 1 WHEN 'discovery' THEN 2 WHEN 'proposal' THEN 3 WHEN 'negotiation' THEN 4 WHEN 'closed_won' THEN 5 WHEN 'closed_lost' THEN 6 ELSE 7 END")),
    optional("upcoming tasks", all("SELECT t.id, t.title, t.due_date, t.priority, t.status, c.name AS company_name FROM tasks t LEFT JOIN companies c ON c.id = t.company_id WHERE t.status IN (?, ?) AND t.due_date IS NOT NULL AND date(t.due_date) <= date('now', '+7 days') ORDER BY date(t.due_date) ASC LIMIT 8", "pending", "in_progress")),
    optional("recent activities", all("SELECT a.id, a.subject, a.type, a.activity_date, c.name AS company_name, trim(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')) AS contact_name FROM activities a LEFT JOIN companies c ON c.id = a.company_id LEFT JOIN contacts p ON p.id = a.contact_id ORDER BY a.activity_date DESC LIMIT 8")),
    optional("recent records", all("SELECT * FROM (SELECT id, 'companies' AS resource, name AS title, created_at FROM companies UNION ALL SELECT id, 'contacts', trim(first_name || ' ' || last_name), created_at FROM contacts UNION ALL SELECT id, 'leads', title, created_at FROM leads UNION ALL SELECT id, 'opportunities', title, created_at FROM opportunities UNION ALL SELECT id, 'tasks', title, created_at FROM tasks UNION ALL SELECT id, 'notes', title, created_at FROM notes) ORDER BY created_at DESC LIMIT 8"))
  ]);
  return {
    counts: {
      companies: companies.total, contacts: contacts.total, open_leads: leads.total,
      open_opportunities: opportunities.total, pending_tasks: tasks.total,
      open_opportunity_value: opportunityValue.total
    },
    pipeline, upcoming_tasks: upcomingTasks, recent_activities: recentActivities, recent_records: recentRecords
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api" && !url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204 });
    if (url.pathname.replace(/\/$/, "") === "/api/dashboard") {
      if (request.method !== "GET") return json({ success: false, error: "Método no permitido." }, 405, { Allow: "GET" });
      try { return json({ success: true, data: await dashboardData(env.DB) }); }
      catch (error) {
        console.error("Dashboard request failed", { message: error?.message });
        return json({ success: false, error: "Error interno del servidor." }, 500);
      }
    }

    const match = url.pathname.match(/^\/api\/([a-z-]+)(?:\/([^/]+))?\/?$/);
    if (!match) return json({ success: false, error: "Ruta API no encontrada." }, 404);
    const resource = resources.get(match[1]);
    if (!resource) return json({ success: false, error: "Recurso API no encontrado." }, 404);
    const allowed = match[2] ? ["GET", "PUT", "DELETE"] : ["GET", "POST"];
    if (!allowed.includes(request.method)) return json({ success: false, error: "Método no permitido." }, 405, { Allow: allowed.join(", ") });

    let id;
    try {
      try { id = match[2] ? decodeURIComponent(match[2]) : undefined; }
      catch { throw new ApiError(400, "Identificador inválido."); }
      if (id && !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)) throw new ApiError(400, "Identificador inválido.");
      const result = await createResourceHandler(resource)(request, env, id);
      return json({ success: true, data: result.data }, result.status);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      if (status === 500) console.error("API request failed", { path: url.pathname, message: error?.message });
      const message = status === 500 ? "Error interno del servidor." : error.message;
      return json({ success: false, error: message }, status);
    }
  }
};
