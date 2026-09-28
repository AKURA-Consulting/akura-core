const modules = {
  companies: { title: "Empresas", singular: "empresa", icon: "▦", description: "Gestiona las organizaciones y sus datos comerciales.", columns: ["name", "industry", "email", "phone", "city", "status"], fields: [
    ["name", "Nombre", "text", true], ["legal_name", "Razón social", "text"], ["tax_id", "CUIT / identificación fiscal", "text"], ["industry", "Industria", "text"], ["website", "Sitio web", "url"], ["email", "Email", "email"], ["phone", "Teléfono", "tel"], ["address", "Dirección", "text"], ["city", "Ciudad", "text"], ["province", "Provincia", "text"], ["country", "País", "text"], ["status", "Estado", "select", true, ["active", "inactive", "prospect"]], ["notes", "Notas", "textarea"]
  ] },
  contacts: { title: "Contactos", singular: "contacto", icon: "♙", description: "Personas relacionadas con tus empresas y oportunidades.", columns: ["first_name", "last_name", "company_id", "email", "phone", "position", "status"], fields: [
    ["company_id", "Empresa", "relation", false, "companies"], ["first_name", "Nombre", "text", true], ["last_name", "Apellido", "text", true], ["email", "Email", "email"], ["phone", "Teléfono", "tel"], ["position", "Cargo", "text"], ["status", "Estado", "select", true, ["active", "inactive"]], ["notes", "Notas", "textarea"]
  ] },
  leads: { title: "Leads", singular: "lead", icon: "◉", description: "Califica nuevos contactos y oportunidades comerciales.", columns: ["title", "company_id", "contact_id", "source", "status", "priority", "estimated_value"], fields: [
    ["title", "Nombre del lead", "text", true], ["company_id", "Empresa", "relation", false, "companies"], ["contact_id", "Contacto", "relation", false, "contacts"], ["source", "Origen", "text"], ["status", "Estado", "select", true, ["new", "open", "qualified", "converted", "lost"]], ["priority", "Prioridad", "select", true, ["low", "medium", "high"]], ["estimated_value", "Valor estimado", "number"], ["notes", "Notas", "textarea"]
  ] },
  opportunities: { title: "Oportunidades", singular: "oportunidad", icon: "◇", description: "Sigue el pipeline, el valor y la fecha de cierre estimada.", columns: ["title", "company_id", "stage", "probability", "estimated_value", "expected_close_date", "status"], fields: [
    ["title", "Nombre", "text", true], ["company_id", "Empresa", "relation", false, "companies"], ["contact_id", "Contacto", "relation", false, "contacts"], ["lead_id", "Lead", "relation", false, "leads"], ["stage", "Etapa", "select", true, ["qualification", "discovery", "proposal", "negotiation", "closed_won", "closed_lost"]], ["probability", "Probabilidad (%)", "number", true], ["estimated_value", "Valor estimado", "number"], ["expected_close_date", "Fecha estimada de cierre", "date"], ["status", "Estado del pipeline", "select", true, ["open", "won", "lost", "on_hold"]], ["notes", "Notas", "textarea"]
  ] },
  tasks: { title: "Tareas", singular: "tarea", icon: "✓", description: "Organiza seguimientos y próximos pasos.", columns: ["title", "company_id", "opportunity_id", "due_date", "priority", "status"], fields: [
    ["title", "Tarea", "text", true], ["description", "Descripción", "textarea"], ["company_id", "Empresa", "relation", false, "companies"], ["contact_id", "Contacto", "relation", false, "contacts"], ["opportunity_id", "Oportunidad", "relation", false, "opportunities"], ["status", "Estado", "select", true, ["pending", "in_progress", "completed", "cancelled"]], ["priority", "Prioridad", "select", true, ["low", "medium", "high"]], ["due_date", "Fecha límite", "date"], ["completed_at", "Completada el", "datetime-local"]
  ] },
  activities: { title: "Actividades", singular: "actividad", icon: "↗", description: "Registra llamadas, reuniones y otros puntos de contacto.", rowActions: ["view"], columns: ["subject", "type", "company_id", "contact_id", "activity_date"], fields: [
    ["type", "Tipo", "select", true, ["call", "meeting", "email", "other"]], ["subject", "Asunto", "text", true], ["company_id", "Empresa", "relation", false, "companies"], ["contact_id", "Contacto", "relation", false, "contacts"], ["opportunity_id", "Oportunidad", "relation", false, "opportunities"], ["description", "Descripción", "textarea"], ["activity_date", "Fecha de actividad", "datetime-local", true]
  ] },
  notes: { title: "Notas", singular: "nota", icon: "▤", description: "Centraliza información relevante de clientes y oportunidades.", columns: ["title", "company_id", "contact_id", "opportunity_id", "created_at"], fields: [
    ["title", "Título", "text", true], ["company_id", "Empresa", "relation", false, "companies"], ["contact_id", "Contacto", "relation", false, "contacts"], ["opportunity_id", "Oportunidad", "relation", false, "opportunities"], ["content", "Contenido", "textarea", true]
  ] }
};

const labels = { name: "Empresa", legal_name: "Razón social", tax_id: "CUIT", industry: "Industria", website: "Sitio web", email: "Email", phone: "Teléfono", address: "Dirección", city: "Ciudad", province: "Provincia", country: "País", status: "Estado", notes: "Notas", first_name: "Nombre", last_name: "Apellido", company_id: "Empresa", contact_id: "Contacto", title: "Nombre", source: "Origen", priority: "Prioridad", estimated_value: "Valor", position: "Cargo", lead_id: "Lead", stage: "Etapa", probability: "Probabilidad", expected_close_date: "Cierre estimado", description: "Descripción", due_date: "Fecha límite", completed_at: "Completada", opportunity_id: "Oportunidad", subject: "Asunto", type: "Tipo", activity_date: "Fecha", content: "Contenido", created_at: "Creada" };
const opportunityStages = ["qualification", "discovery", "proposal", "negotiation", "closed_won", "closed_lost"];
const stageLabels = { qualification: "Calificación", discovery: "Descubrimiento", proposal: "Propuesta", negotiation: "Negociación", closed_won: "Cerrada ganada", closed_lost: "Cerrada perdida" };
const valueLabels = { active: "Activa", inactive: "Inactiva", prospect: "Prospecto", new: "Nuevo", open: "Abierto", qualified: "Calificado", converted: "Convertido", lost: "Perdido", low: "Baja", medium: "Media", high: "Alta", won: "Ganada", on_hold: "En pausa", pending: "Pendiente", in_progress: "En curso", completed: "Completada", cancelled: "Cancelada", call: "Llamada", meeting: "Reunión", email: "Correo", other: "Otro" , ...stageLabels };
const app = document.querySelector("#app");
const sectionLabel = document.querySelector("#current-section");
let activeRoute = "dashboard";
let searchTimer;
let searchSequence = 0;
let pendingRecord;
let navigationInitialized = false;
const cache = new Map();

function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function human(value) { const key = String(value ?? "—"); return valueLabels[key] || key.replaceAll("_", " "); }
function toast(message, error = false) {
  const region = document.querySelector("#toast-region");
  const node = document.createElement("div"); node.className = `toast${error ? " error" : ""}`; node.textContent = message; region.append(node);
  setTimeout(() => node.remove(), 3400);
}
async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, { ...options, headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers } });
  const result = await response.json().catch(() => ({ success: false, error: "Respuesta inválida del servidor." }));
  if (!response.ok || !result.success) throw new Error(result.error || `Error ${response.status}`);
  return result.data;
}
function setNav(route) {
  activeRoute = route;
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === route));
  sectionLabel.textContent = route === "dashboard" ? "Inicio" : (modules[route]?.title || "Búsqueda");
  document.querySelector("#sidebar").classList.remove("open"); document.querySelector("#mobile-scrim").classList.remove("active");
}
function heading(title, description, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">AKURA CORE · ${esc(title)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action}</div>`;
}
function badge(value) {
  const normalized = String(value || "—").toLowerCase();
  const color = /won|active|completed|qualified/.test(normalized) ? "green" : /high|overdue|lost|cancelled/.test(normalized) ? "red" : /pending|open|medium|progress|new/.test(normalized) ? "orange" : "";
  return `<span class="badge ${color}">${esc(human(value))}</span>`;
}
function relationshipName(key, id) {
  const route = { company_id: "companies", contact_id: "contacts", lead_id: "leads", opportunity_id: "opportunities" }[key];
  const related = (cache.get(route) || []).find((item) => item.id === id);
  return related?.name || [related?.first_name, related?.last_name].filter(Boolean).join(" ") || related?.title || "";
}
function formatCell(key, value) {
  if (key === "status" || key === "priority" || key === "stage" || key === "type") return badge(value);
  if (key === "estimated_value" && value != null) return esc(new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value));
  if (["created_at", "expected_close_date", "due_date", "activity_date", "completed_at"].includes(key) && value) return esc(new Date(value).toLocaleDateString("es-AR"));
  if (["company_id", "contact_id", "lead_id", "opportunity_id"].includes(key)) {
    const name = relationshipName(key, value);
    return value ? `<span title="${esc(value)}">${esc(name || `${String(value).slice(0, 8)}…`)}</span>` : `<span class="muted">—</span>`;
  }
  return esc(value || "—");
}
function renderTable(moduleKey, rows, searchable = true, actions = true) {
  const module = modules[moduleKey];
  if (!rows.length) return `<div class="empty-state"><div class="empty-icon">${module.icon}</div><b>Aún no hay ${module.title.toLowerCase()}</b><span>Los registros que agregues aparecerán aquí.</span></div>`;
  const columns = module.columns;
  const rowActions = actions ? (module.rowActions || ["view", "edit", "delete"]) : [];
  const actionLabels = { view: "Ver", edit: "Editar", delete: "×" };
  return `<div class="table-card">${searchable ? `<div class="table-tools"><input type="search" data-local-search placeholder="Filtrar ${module.title.toLowerCase()}…"><span class="result-count">${rows.length} registros</span></div>` : ""}<table><thead><tr>${columns.map((key) => `<th>${esc(labels[key] || key)}</th>`).join("")}${rowActions.length ? "<th>Acciones</th>" : ""}</tr></thead><tbody>${rows.map((row) => `<tr data-row data-search="${esc(columns.map((key) => row[key] ?? "").join(" ").toLowerCase())}">${columns.map((key, index) => `<td class="${index === 0 ? "primary-cell" : ""}">${formatCell(key, row[key])}</td>`).join("")}${rowActions.length ? `<td><div class="row-actions">${rowActions.map((action) => `<button class="icon-button" data-action="${action}" data-id="${esc(row.id)}" title="${actionLabels[action]}">${actionLabels[action]}</button>`).join("")}</div></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}
function currency(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);
}
function renderPipeline(stages) {
  const byStage = new Map(stages.map((stage) => [stage.stage, stage]));
  return `<section class="pipeline-section"><div class="panel-heading"><div><h2>Pipeline comercial</h2><p>Oportunidades agrupadas por etapa</p></div></div><div class="pipeline-grid">${opportunityStages.map((key) => {
    const stage = byStage.get(key) || { count: 0, total_value: 0, average_probability: 0 };
    return `<article class="pipeline-card"><div class="pipeline-stage">${esc(stageLabels[key])}</div><strong>${stage.count}</strong><span>${currency(stage.total_value)}</span><small>Probabilidad media ${Math.round(stage.average_probability || 0)}%</small></article>`;
  }).join("")}</div></section>`;
}
async function loadModule(route) {
  const module = modules[route]; setNav(route);
  app.innerHTML = `${heading(module.title, module.description, `<button class="button" data-action="create">＋ Nueva ${esc(module.singular)}</button>`)}<div class="loading">Cargando ${esc(module.title.toLowerCase())}…</div>`;
  try {
    const rows = await api(route); cache.set(route, rows);
    const relationRoutes = [...new Set(module.fields.filter((field) => field[2] === "relation").map((field) => field[4]))];
    await Promise.all(relationRoutes.map(async (key) => { if (!cache.has(key)) { try { cache.set(key, await api(key)); } catch {} } }));
    const pipeline = route === "opportunities" ? (await api("dashboard")).pipeline : null;
    app.innerHTML = `${heading(module.title, module.description, `<button class="button" data-action="create">＋ Nueva ${esc(module.singular)}</button>`)}${pipeline ? renderPipeline(pipeline) : ""}${renderTable(route, rows)}`;
    if (pendingRecord?.route === route) {
      const selected = rows.find((row) => row.id === pendingRecord.id);
      pendingRecord = undefined;
      if (selected) openDetails(route, selected);
    }
  } catch (error) { app.innerHTML = `${heading(module.title, module.description)}<div class="error-state">${esc(error.message)}<br><br><button class="button secondary" data-action="retry">Reintentar</button></div>`; toast(error.message, true); }
}
async function dashboard() {
  setNav("dashboard"); app.innerHTML = `<div class="loading">Cargando el dashboard…</div>`;
  try {
    const data = await api("dashboard");
    const counts = data.counts;
    const cards = [["Empresas", counts.companies, "▦", "companies"], ["Contactos", counts.contacts, "♙", "contacts"], ["Leads abiertos", counts.open_leads, "◉", "leads"], ["Oportunidades abiertas", counts.open_opportunities, "◇", "opportunities"], ["Tareas pendientes", counts.pending_tasks, "✓", "tasks"]];
    const recentRows = data.recent_records || [];
    app.innerHTML = `${heading("Inicio", "Una vista general de la actividad comercial y operativa.")}<div class="kpi-grid">${cards.map(([title, value, icon, route]) => `<a href="#${route}" class="kpi-card" style="text-decoration:none;color:inherit"><div class="kpi-top"><span>${title}</span><span class="kpi-icon">${icon}</span></div><div class="kpi-value">${Number(value || 0).toLocaleString("es-AR")}</div><div class="kpi-caption">Ver ${title.toLowerCase()} →</div></a>`).join("")}<div class="kpi-card"><div class="kpi-top"><span>Valor oportunidades abiertas</span><span class="kpi-icon">＄</span></div><div class="kpi-value kpi-currency">${esc(currency(counts.open_opportunity_value))}</div><div class="kpi-caption">Suma de valores estimados</div></div></div>${renderPipeline(data.pipeline || [])}<div class="dashboard-grid dashboard-lower"><section class="panel"><div class="panel-heading"><div><h2>Tareas próximas a vencer</h2><p>Vencidas y con vencimiento en los próximos siete días</p></div><a href="#tasks">Ver todas →</a></div>${data.upcoming_tasks?.length ? `<div class="dashboard-list">${data.upcoming_tasks.map((task) => `<a href="#tasks" class="dashboard-row"><span><strong>${esc(task.title)}</strong><small>${esc(task.company_name || "Sin empresa")}</small></span><span>${badge(task.status)}<small>${esc(task.due_date || "")}</small></span></a>`).join("")}</div>` : `<div class="empty-state compact"><b>No hay tareas próximas</b><span>Las tareas pendientes aparecerán aquí.</span></div>`}</section><section class="panel"><div class="panel-heading"><div><h2>Actividad reciente</h2><p>Últimas interacciones registradas</p></div><a href="#activities">Ver todas →</a></div>${data.recent_activities?.length ? `<div class="dashboard-list">${data.recent_activities.map((item) => `<a href="#activities" class="dashboard-row"><span><strong>${esc(item.subject)}</strong><small>${esc([item.company_name, item.contact_name].filter(Boolean).join(" · ") || human(item.type))}</small></span><span class="muted">${esc(item.activity_date || "")}</span></a>`).join("")}</div>` : `<div class="empty-state compact"><b>Aún no hay actividad</b><span>Las actividades registradas aparecerán aquí.</span></div>`}</section><section class="panel"><div class="panel-heading"><div><h2>Registros recientes</h2><p>Últimas altas en el CRM</p></div></div>${recentRows.length ? `<div class="dashboard-list">${recentRows.map((item) => `<a href="#${esc(item.resource)}" class="dashboard-row"><span><strong>${esc(item.title)}</strong><small>${esc(modules[item.resource]?.title || item.resource)}</small></span><span class="muted">${esc(new Date(item.created_at).toLocaleDateString("es-AR"))}</span></a>`).join("")}</div>` : `<div class="empty-state compact"><b>Sin registros</b><span>Los nuevos registros aparecerán aquí.</span></div>`}</section><section class="panel"><div class="panel-heading"><h2>Accesos rápidos</h2></div><div class="quick-links">${[["companies","Empresas","Organizaciones y clientes"],["contacts","Contactos","Personas y relaciones"],["leads","Leads","Nuevos prospectos"]].map(([route,title,desc]) => `<a href="#${route}" class="quick-link"><span class="quick-link-icon">${modules[route].icon}</span><span><strong>${title}</strong><small>${desc}</small></span></a>`).join("")}</div></section></div>`;
  } catch (error) { app.innerHTML = `${heading("Inicio", "Una vista general de la actividad comercial y operativa.")}<div class="error-state">${esc(error.message)}<br><br><button class="button secondary" data-action="retry">Reintentar</button><p>Verifica que D1 tenga aplicada la migración local.</p></div>`; }
}
function fieldMarkup(field, value, idPrefix) {
  const [key, label, kind, required, options] = field; const id = `${idPrefix}-${key}`; const req = required ? "required" : "";
  if (kind === "textarea") return `<div class="field full"><label for="${id}">${esc(label)}${required ? " *" : ""}</label><textarea id="${id}" name="${key}" maxlength="10000" ${req}>${esc(value ?? "")}</textarea></div>`;
  if (kind === "select") return `<div class="field"><label for="${id}">${esc(label)}${required ? " *" : ""}</label><select id="${id}" name="${key}" ${req}>${options.map((option) => `<option value="${esc(option)}" ${value === option ? "selected" : ""}>${esc(human(option))}</option>`).join("")}</select></div>`;
  if (kind === "relation") {
    const related = cache.get(options) || [];
    const title = (row) => row.name || [row.first_name, row.last_name].filter(Boolean).join(" ") || row.title || row.subject || row.id;
    return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}" name="${key}"><option value="">Sin asignar</option>${related.map((row) => `<option value="${esc(row.id)}" ${value === row.id ? "selected" : ""}>${esc(title(row))}</option>`).join("")}</select>${related.length ? "" : `<small class="muted">No hay ${esc(modules[options].title.toLowerCase())} disponibles.</small>`}</div>`;
  }
  const type = kind === "number" ? "number" : kind;
  const min = kind === "number" ? `min="0" ${key === "probability" ? "max=\"100\"" : ""} step="any"` : "";
  const inputValue = kind === "datetime-local" && value ? toLocalDateTime(value) : (value ?? "");
  return `<div class="field"><label for="${id}">${esc(label)}${required ? " *" : ""}</label><input id="${id}" name="${key}" type="${type}" value="${esc(inputValue)}" ${min} ${req} ${key === "name" || key === "title" ? "maxlength=240" : ""}></div>`;
}
function toLocalDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
async function openForm(route, row = null) {
  const module = modules[route];
  const relations = [...new Set(module.fields.filter((field) => field[2] === "relation").map((field) => field[4]))];
  await Promise.all(relations.map(async (key) => { if (!cache.has(key)) { try { cache.set(key, await api(key)); } catch {} } }));
  const dialog = document.createElement("dialog"); dialog.className = "modal"; dialog.id = "record-modal";
  dialog.innerHTML = `<form class="modal-inner" id="record-form"><div class="modal-header"><div><h2>${row ? `Editar ${esc(module.singular)}` : `Nueva ${esc(module.singular)}`}</h2><p>Completa la información del registro.</p></div><button type="button" class="close-button" data-action="close-modal">×</button></div><div class="form-grid">${module.fields.map((field) => fieldMarkup(field, row?.[field[0]], route)).join("")}</div><div class="modal-actions"><button type="button" class="button secondary" data-action="close-modal">Cancelar</button><button class="button" type="submit">${row ? "Guardar cambios" : "Crear"}</button></div></form>`;
  document.body.append(dialog); dialog.showModal();
  if (route === "opportunities") {
    const stage = dialog.querySelector('[name="stage"]'); const status = dialog.querySelector('[name="status"]');
    stage.addEventListener("change", () => {
      if (stage.value === "closed_won") status.value = "won";
      else if (stage.value === "closed_lost") status.value = "lost";
      else if (["won", "lost"].includes(status.value)) status.value = "open";
    });
    status.addEventListener("change", () => {
      if (status.value === "won") stage.value = "closed_won";
      else if (status.value === "lost") stage.value = "closed_lost";
      else if (["closed_won", "closed_lost"].includes(stage.value)) stage.value = "negotiation";
    });
  }
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.querySelector("#record-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const form = event.currentTarget; const button = form.querySelector("button[type=submit]"); button.disabled = true; button.textContent = "Guardando…";
    const body = {};
    for (const field of module.fields) {
      const [key, , kind] = field; const input = form.elements.namedItem(key); if (!input) continue;
      let value = input.value.trim();
      if (kind === "number") value = value === "" ? null : Number(value);
      else if (kind === "relation") value = value || null;
      else if (kind === "datetime-local") value = value ? new Date(value).toISOString() : null;
      else if (!value && !field[3]) value = null;
      body[key] = value;
    }
    try {
      await api(row ? `${route}/${encodeURIComponent(row.id)}` : route, { method: row ? "PUT" : "POST", body: JSON.stringify(body) });
      dialog.close(); toast(`${module.singular[0].toUpperCase()}${module.singular.slice(1)} ${row ? "actualizado" : "creado"} correctamente.`); await loadModule(route);
    } catch (error) { toast(error.message, true); button.disabled = false; button.textContent = row ? "Guardar cambios" : "Crear"; }
  });
}
function openDetails(route, row) {
  const module = modules[route]; const dialog = document.createElement("dialog"); dialog.className = "modal";
  dialog.innerHTML = `<div class="modal-inner"><div class="modal-header"><div><h2>${esc(module.singular[0].toUpperCase() + module.singular.slice(1))}</h2><p>Detalle del registro</p></div><button class="close-button" data-action="close-modal">×</button></div><dl class="detail-list">${Object.entries(row).map(([key,value]) => {
    const display = ["company_id", "contact_id", "lead_id", "opportunity_id"].includes(key) ? relationshipName(key, value) || value : ["created_at", "updated_at", "activity_date", "due_date", "expected_close_date", "completed_at"].includes(key) && value ? new Date(value).toLocaleString("es-AR") : value;
    return `<dt>${esc(labels[key] || key)}</dt><dd>${esc(display ?? "—")}</dd>`;
  }).join("")}</dl><div class="modal-actions"><button class="button secondary" data-action="close-modal">Cerrar</button></div></div>`;
  document.body.append(dialog); dialog.showModal(); dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }); dialog.addEventListener("close", () => dialog.remove(), { once: true });
}
async function deleteRow(route, id) {
  const module = modules[route]; const row = (cache.get(route) || []).find((entry) => entry.id === id);
  const label = row?.name || row?.title || [row?.first_name, row?.last_name].filter(Boolean).join(" ") || module.singular;
  if (!confirm(`¿Eliminar “${label}”? Esta acción no se puede deshacer.`)) return;
  try { await api(`${route}/${encodeURIComponent(id)}`, { method: "DELETE" }); toast(`${module.singular} eliminado.`); await loadModule(route); }
  catch (error) { toast(error.message, true); }
}
async function searchAll(query) {
  const sequence = ++searchSequence;
  setNav("search"); app.innerHTML = `${heading("Búsqueda", `Resultados para “${esc(query)}”.`)}<div class="loading">Buscando…</div>`;
  try {
    const results = await Promise.all(Object.keys(modules).map(async (key) => [key, await api(`${key}?search=${encodeURIComponent(query)}`)]));
    if (sequence !== searchSequence || activeRoute !== "search") return;
    const groups = results.filter(([, rows]) => rows.length);
    app.innerHTML = `${heading("Búsqueda", `Resultados para “${esc(query)}”.`)}${groups.length ? `<div class="search-results">${groups.map(([key, rows]) => `<section class="search-group"><h2>${modules[key].title} <span class="muted">(${rows.length})</span></h2>${rows.map((row) => `<div class="search-item" data-search-route="${key}" data-id="${esc(row.id)}"><span>${esc(row.name || row.title || row.subject || [row.first_name,row.last_name].filter(Boolean).join(" "))}</span><span class="muted">${esc(row.email || row.status || row.type || "Abrir →")}</span></div>`).join("")}</section>`).join("")}</div>` : `<div class="empty-state"><b>No encontramos coincidencias</b><span>Prueba con otro nombre, email o estado.</span></div>`}`;
  } catch (error) { if (sequence === searchSequence && activeRoute === "search") app.innerHTML = `${heading("Búsqueda", `Resultados para “${esc(query)}”.`)}<div class="error-state">${esc(error.message)}</div>`; }
}
function routeFromHash() { const route = location.hash.replace(/^#\/?/, "") || "dashboard"; if (route === "dashboard") return dashboard(); if (modules[route]) return loadModule(route); return dashboard(); }

function renderStartupError(error) {
  const detail = error instanceof Error ? error.message : String(error);
  if (app) app.innerHTML = `<div class="error-state"><h1>No se pudo cargar AKURA CORE</h1><p>La aplicación encontró un error durante el arranque.</p><details><summary>Información de diagnóstico</summary><pre>${esc(detail)}</pre></details><button class="button secondary" data-action="retry">Reintentar</button></div>`;
}

async function initApp() {
  try {
    if (!app || !sectionLabel) throw new Error("Faltan los elementos principales de la interfaz (#app o #current-section).");
    if (!navigationInitialized) {
      const menuToggle = document.querySelector("#menu-toggle");
      const sidebar = document.querySelector("#sidebar");
      const mobileScrim = document.querySelector("#mobile-scrim");
      if (!menuToggle || !sidebar || !mobileScrim) throw new Error("Faltan elementos requeridos para inicializar la navegación móvil.");
      menuToggle.addEventListener("click", () => { sidebar.classList.toggle("open"); mobileScrim.classList.toggle("active"); });
      mobileScrim.addEventListener("click", () => { sidebar.classList.remove("open"); mobileScrim.classList.remove("active"); });
      navigationInitialized = true;
    }
    await routeFromHash();
  } catch (error) {
    console.error("[AKURA CORE] Error durante el arranque", error);
    renderStartupError(error);
  }
}

document.addEventListener("click", async (event) => {
  const nav = event.target.closest("a[data-route]"); if (nav) { event.preventDefault(); location.hash = nav.dataset.route; return; }
  const quick = event.target.closest("a[href^='#']"); if (quick && !quick.dataset.route) { event.preventDefault(); location.hash = quick.getAttribute("href").slice(1); return; }
  const searchItem = event.target.closest("[data-search-route]"); if (searchItem) {
    const route = searchItem.dataset.searchRoute; const id = searchItem.dataset.id;
    pendingRecord = { route, id };
    if (location.hash === `#${route}`) loadModule(route);
    else location.hash = route;
    return;
  }
  const button = event.target.closest("[data-action]"); if (!button) return;
  const action = button.dataset.action;
  if (action === "create") openForm(activeRoute);
  else if (action === "retry") routeFromHash();
  else if (action === "close-modal") button.closest("dialog")?.close();
  else if (["view", "edit", "delete"].includes(action)) {
    const route = activeRoute; const id = button.dataset.id; let row = (cache.get(route) || []).find((entry) => entry.id === id);
    try { row = await api(`${route}/${encodeURIComponent(id)}`); } catch (error) { toast(error.message, true); return; }
    if (action === "view") openDetails(route, row); else if (action === "edit") openForm(route, row); else deleteRow(route, id);
  }
});
document.addEventListener("input", (event) => {
  if (event.target.matches("[data-local-search]")) { const query = event.target.value.toLowerCase(); document.querySelectorAll("[data-row]").forEach((row) => row.hidden = !row.dataset.search.includes(query)); }
  if (event.target.id === "global-search") {
    clearTimeout(searchTimer); const query = event.target.value.trim();
    if (!query) { searchSequence += 1; if (activeRoute === "search") location.hash = "dashboard"; return; }
    searchTimer = setTimeout(() => searchAll(query), 350);
  }
});
document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector("#global-search").focus(); } });
window.addEventListener("hashchange", () => { void initApp(); });
void initApp();
