import { getStore } from "@netlify/blobs";

const PAGES = new Set(["board", "audit", "proposal", "capacity", "library", "questions", "vendorq", "process", "scenarios", "wtf", "preferred", "rant", "planb", "directory", "v666"]);
const PEOPLE = new Set(["martin", "leonel", "mike"]);
const KEY = "XPFmcH2RSsza";
const ID_RE = /^[A-Za-z0-9_.:@+~-]{1,80}$/;

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const normPerson = (v) => (PEOPLE.has(v) ? v : null);
// "team" = assigned to all three; valid only as an assignee, never as an author.
const normAssignee = (v) => (PEOPLE.has(v) || v === "team" ? v : null);

// One blob per entity: <page>/task/<id>, <page>/mark/<key>, <page>/comment/<ts>-<uuid>.
// Concurrent writes hit different keys, so nothing can be clobbered. The only
// read-modify-write is a task patch merging into that single task's blob.
async function readAll(store, page) {
  const prefix = page + "/";
  const { blobs } = await store.list({ prefix });
  const entries = await Promise.all(
    (blobs || []).map((b) =>
      store.get(b.key, { type: "json" }).then(
        (val) => ({ key: b.key, val }),
        () => ({ key: b.key, val: null }),
      ),
    ),
  );
  const data = { tasks: {}, marks: {}, comments: [], links: {}, votes: {}, docs: {}, revs: [], seen: {}, rev: "" };
  for (const { key, val } of entries) {
    if (!val || typeof val !== "object") continue;
    const kind = key.slice(prefix.length).split("/")[0];
    if (kind === "seen" && val.person) {
      data.seen[val.person] = Array.isArray(val.ids) ? val.ids : [];
    } else if (kind === "task" && val.id) {
      data.tasks[val.id] = val;
      if (val.updatedAt > data.rev) data.rev = val.updatedAt;
    } else if (kind === "mark" && val.key) {
      data.marks[val.key] = val;
      if (val.at > data.rev) data.rev = val.at;
    } else if (kind === "comment" && val.key) {
      data.comments.push(val);
      if (val.at > data.rev) data.rev = val.at;
    } else if (kind === "link" && val.id && val.url) {
      data.links[val.id] = val;
      if (val.at > data.rev) data.rev = val.at;
    } else if (kind === "vote" && val.key && val.person) {
      (data.votes[val.key] = data.votes[val.key] || {})[val.person] = val.v || "";
      if (val.at > data.rev) data.rev = val.at;
    } else if (kind === "doc" && val.key) {
      // Editable document sections: current text lives in <page>/doc/<key>.
      data.docs[val.key] = val;
      if (val.at > data.rev) data.rev = val.at;
    } else if (kind === "rev" && val.key && val.id) {
      // Every save appends <page>/rev/<key>/<ts>-<uuid>; this is the edit log.
      data.revs.push(val);
      if (val.at > data.rev) data.rev = val.at;
    }
  }
  data.comments.sort((a, b) => (a.at < b.at ? -1 : 1));
  data.revs.sort((a, b) => (a.at < b.at ? -1 : 1));
  return data;
}

export default async (req) => {
  if (req.headers.get("x-warroom-key") !== KEY) return json({ error: "unauthorized" }, 401);
  const url = new URL(req.url);
  const page = url.searchParams.get("page");
  if (!PAGES.has(page)) return json({ error: "bad page" }, 400);

  const store = getStore({ name: "warroom-v2", consistency: "strong" });

  if (req.method === "GET") return json(await readAll(store, page));
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let op;
  try { op = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const now = new Date().toISOString();

  if (op.t === "task" && typeof op.id === "string" && ID_RE.test(op.id) && op.patch && typeof op.patch === "object") {
    const blobKey = page + "/task/" + op.id;
    const p = op.patch;
    // Per-task read-merge-write; races only if two people edit the SAME task
    // in the same instant, and then last-writer-wins on that task alone.
    const cur = (await store.get(blobKey, { type: "json" })) || {};
    const next = {
      id: op.id,
      done: !!("done" in p ? p.done : cur.done),
      assignee: normAssignee("assignee" in p ? p.assignee : cur.assignee),
      doneBy: normPerson("doneBy" in p ? p.doneBy : cur.doneBy),
      doneAt: ("doneAt" in p ? p.doneAt : cur.doneAt) || null,
      updatedAt: now,
    };
    // Blocked state: why, on which other tasks (board ids), who raised it, when.
    // Ticking a task done clears its block.
    const blocked = !next.done && !!("blocked" in p ? p.blocked : cur.blocked);
    if (blocked) {
      next.blocked = true;
      const why = "blockedWhy" in p ? p.blockedWhy : cur.blockedWhy;
      next.blockedWhy = typeof why === "string" ? why.trim().slice(0, 500) : "";
      const on = "blockedOn" in p ? p.blockedOn : cur.blockedOn;
      next.blockedOn = Array.isArray(on)
        ? on.filter((x) => typeof x === "string" && ID_RE.test(x) && x !== op.id).slice(0, 10)
        : [];
      next.blockedBy = normPerson("blockedBy" in p ? p.blockedBy : cur.blockedBy);
      next.blockedAt = ("blockedAt" in p ? p.blockedAt : cur.blockedAt) || now;
    }
    // Custom (user-added) tasks carry their own content.
    const title = "title" in p ? p.title : cur.title;
    if (typeof title === "string" && title.trim()) {
      next.custom = true;
      next.title = String(title).trim().slice(0, 200);
      const desc = "desc" in p ? p.desc : cur.desc;
      if (typeof desc === "string" && desc.trim()) next.desc = String(desc).trim().slice(0, 500);
      const group = "group" in p ? p.group : cur.group;
      if (typeof group === "string" && /^[A-Z]$/.test(group)) next.group = group;
      const createdBy = normPerson("createdBy" in p ? p.createdBy : cur.createdBy);
      if (createdBy) next.createdBy = createdBy;
    }
    await store.setJSON(blobKey, next);
    return json({ ok: true });
  }

  if (op.t === "task-del" && typeof op.id === "string" && ID_RE.test(op.id)) {
    const blobKey = page + "/task/" + op.id;
    const cur = await store.get(blobKey, { type: "json" });
    // Only user-added tasks can be deleted; the fixed board is immutable.
    if (cur && cur.custom) await store.delete(blobKey);
    return json({ ok: true });
  }

  if (op.t === "tasks-bulk" && op.tasks && typeof op.tasks === "object") {
    const { blobs } = await store.list({ prefix: page + "/task/" });
    if ((blobs || []).length === 0) {
      await Promise.all(
        Object.entries(op.tasks).slice(0, 120).map(([id, v]) => {
          if (typeof id !== "string" || !ID_RE.test(id) || !v || !v.done) return null;
          return store.setJSON(page + "/task/" + id, {
            id, done: true, assignee: null, doneBy: null, doneAt: null, updatedAt: now,
          });
        }),
      );
    }
    return json({ ok: true });
  }

  // Per-person dismissed notification ids; only that person writes their own blob.
  if (op.t === "seen" && PEOPLE.has(op.person) && Array.isArray(op.add)) {
    const blobKey = page + "/seen/" + op.person;
    const cur = (await store.get(blobKey, { type: "json" })) || {};
    const ids = Array.isArray(cur.ids) ? cur.ids : [];
    const add = op.add.filter((x) => typeof x === "string" && x.length <= 200).slice(0, 200);
    const merged = ids.concat(add.filter((x) => !ids.includes(x))).slice(-800);
    await store.setJSON(blobKey, { person: op.person, ids: merged, at: now });
    return json({ ok: true });
  }

  // Per-person vote on a key (send / drop / cleared); one blob per person per key.
  if (
    op.t === "vote" && typeof op.key === "string" && ID_RE.test(op.key) &&
    PEOPLE.has(op.by) && ["send", "drop", ""].includes(op.v)
  ) {
    await store.setJSON(page + "/vote/" + op.key + "/" + op.by, {
      key: op.key, person: op.by, v: op.v, at: now,
    });
    return json({ ok: true });
  }

  if (op.t === "mark" && typeof op.key === "string" && ID_RE.test(op.key)) {
    await store.setJSON(page + "/mark/" + op.key, {
      key: op.key, flagged: !!op.flagged, by: normPerson(op.by), at: now,
    });
    return json({ ok: true });
  }

  // Emoji reactions: toggle the reactor's name in the comment's per-emoji list.
  if (
    op.t === "react" && typeof op.id === "string" && /^[0-9A-Za-z:.TZ-]{10,100}$/.test(op.id) &&
    ["👍", "👎", "✅", "❌"].includes(op.emoji) && PEOPLE.has(op.by)
  ) {
    const blobKey = page + "/comment/" + op.id;
    const cur = await store.get(blobKey, { type: "json" });
    if (cur) {
      const r = cur.reactions && typeof cur.reactions === "object" ? cur.reactions : {};
      const list = Array.isArray(r[op.emoji]) ? r[op.emoji] : [];
      const i = list.indexOf(op.by);
      if (i >= 0) list.splice(i, 1); else list.push(op.by);
      r[op.emoji] = list;
      await store.setJSON(blobKey, { ...cur, reactions: r });
    }
    return json({ ok: true });
  }

  // Authors can edit their own comments.
  if (
    op.t === "comment-edit" && typeof op.id === "string" && /^[0-9A-Za-z:.TZ-]{10,100}$/.test(op.id) &&
    typeof op.text === "string" && op.text.trim()
  ) {
    const blobKey = page + "/comment/" + op.id;
    const cur = await store.get(blobKey, { type: "json" });
    if (cur && cur.author && cur.author === normPerson(op.by)) {
      await store.setJSON(blobKey, { ...cur, text: String(op.text).trim().slice(0, 10000), edited: now });
    }
    return json({ ok: true });
  }

  // Authors can delete their own comments.
  if (op.t === "comment-del" && typeof op.id === "string" && /^[0-9A-Za-z:.TZ-]{10,100}$/.test(op.id)) {
    const blobKey = page + "/comment/" + op.id;
    const cur = await store.get(blobKey, { type: "json" });
    if (cur && cur.author && cur.author === normPerson(op.by)) await store.delete(blobKey);
    return json({ ok: true });
  }

  if (
    op.t === "comment" && typeof op.key === "string" && ID_RE.test(op.key) &&
    PEOPLE.has(op.author) && typeof op.text === "string" && op.text.trim()
  ) {
    const id = now + "-" + crypto.randomUUID();
    // One-level threads: a comment may carry the id of the root comment it replies to.
    const parent = (typeof op.parent === "string" && /^[0-9A-Za-z:.TZ-]{10,100}$/.test(op.parent)) ? op.parent : null;
    await store.setJSON(page + "/comment/" + id, {
      id, key: op.key, author: op.author,
      text: String(op.text).trim().slice(0, 10000), at: now,
      ...(parent ? { parent } : {}),
    });
    return json({ ok: true });
  }


  // Editable document sections (process page). Anyone on the team can edit any
  // section; every save writes the new current text AND an immutable revision
  // blob carrying the previous text, so the edit log can show who changed what.
  if (
    op.t === "doc" && typeof op.key === "string" && ID_RE.test(op.key) &&
    PEOPLE.has(op.by) && typeof op.text === "string" && op.text.trim()
  ) {
    const blobKey = page + "/doc/" + op.key;
    const cur = (await store.get(blobKey, { type: "json" })) || null;
    const text = String(op.text).trim().slice(0, 12000);
    const next = { key: op.key, text, by: op.by, at: now, n: ((cur && cur.n) || 0) + 1 };
    // Custom sections (added in-site) carry their own title/group/creator.
    const title = "title" in op ? op.title : cur && cur.title;
    if (typeof title === "string" && title.trim()) {
      next.custom = true;
      next.title = String(title).trim().slice(0, 140);
      const group = "group" in op ? op.group : cur && cur.group;
      if (typeof group === "string" && /^[a-z0-9-]{1,30}$/.test(group)) next.group = group;
      next.createdBy = (cur && cur.createdBy) || op.by;
      next.createdAt = (cur && cur.createdAt) || now;
    }
    const id = now + "-" + crypto.randomUUID();
    await Promise.all([
      store.setJSON(blobKey, next),
      store.setJSON(page + "/rev/" + op.key + "/" + id, {
        id, key: op.key, by: op.by, at: now, n: next.n, text,
        prev: cur ? cur.text : (typeof op.prev === "string" ? String(op.prev).slice(0, 12000) : null),
        ...(next.custom ? { title: next.title } : {}),
      }),
    ]);
    return json({ ok: true });
  }

  // Only custom sections can be removed, and only by whoever created them.
  if (op.t === "doc-del" && typeof op.key === "string" && ID_RE.test(op.key)) {
    const blobKey = page + "/doc/" + op.key;
    const cur = await store.get(blobKey, { type: "json" });
    if (cur && cur.custom && cur.createdBy && cur.createdBy === normPerson(op.by)) {
      await store.delete(blobKey);
      const id = now + "-" + crypto.randomUUID();
      await store.setJSON(page + "/rev/" + op.key + "/" + id, {
        id, key: op.key, by: op.by, at: now, n: (cur.n || 0) + 1, text: "", prev: cur.text, title: cur.title, deleted: true,
      });
    }
    return json({ ok: true });
  }

  // Library links: one blob per link; only the person who added it can remove it.
  if (
    op.t === "link" && typeof op.id === "string" && ID_RE.test(op.id) &&
    PEOPLE.has(op.by) && typeof op.title === "string" && op.title.trim() &&
    typeof op.url === "string" && /^(https?:\/\/|\/)[^\s]{1,500}$/.test(op.url.trim())
  ) {
    const group = typeof op.group === "string" && /^[a-z]{1,20}$/.test(op.group) ? op.group : "team";
    await store.setJSON(page + "/link/" + op.id, {
      id: op.id, title: String(op.title).trim().slice(0, 120), url: op.url.trim(),
      desc: typeof op.desc === "string" ? op.desc.trim().slice(0, 300) : "",
      group, by: op.by, at: now,
    });
    return json({ ok: true });
  }

  if (op.t === "link-del" && typeof op.id === "string" && ID_RE.test(op.id)) {
    const blobKey = page + "/link/" + op.id;
    const cur = await store.get(blobKey, { type: "json" });
    if (cur && cur.by && cur.by === normPerson(op.by)) await store.delete(blobKey);
    return json({ ok: true });
  }

  return json({ error: "bad op" }, 400);
};

export const config = { path: "/api/state" };
