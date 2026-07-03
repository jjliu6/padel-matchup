import { createClient } from "@supabase/supabase-js";

// Public Lovable Cloud client for anonymous tournament sharing. These values are
// publishable frontend config, not private credentials. Keeping a local fallback
// prevents published builds from losing share/sync when managed VITE env injection
// is stale or unavailable.
const CLOUD_URL = import.meta.env.VITE_SUPABASE_URL || "https://eevtrshfhhcjnhrdfecs.supabase.co";
const CLOUD_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldnRyc2hmaGhjam5ocmRmZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNDcwMjEsImV4cCI6MjA5ODYyMzAyMX0.xFUvHGXrphXWAOH2_J1K4FK2wam5yqBcYJHEkI0VYyM";

const supabase = createClient(CLOUD_URL, CLOUD_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const PARAM_VIEW = "v";
const PARAM_EDIT = "e";

export function getUrlTokens() {
  if (typeof window === "undefined") return { view: null, edit: null };
  const u = new URL(window.location.href);
  return {
    view: u.searchParams.get(PARAM_VIEW),
    edit: u.searchParams.get(PARAM_EDIT),
  };
}

export function updateUrlTokens({ view, edit }) {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  if (view) u.searchParams.set(PARAM_VIEW, view);
  else u.searchParams.delete(PARAM_VIEW);
  if (edit) u.searchParams.set(PARAM_EDIT, edit);
  else u.searchParams.delete(PARAM_EDIT);
  window.history.replaceState({}, "", u.toString());
}

// Public share base — never use preview/lovable.app origins because those
// are gated behind a Lovable login and confuse viewers. Fall back to the
// current origin only when running on a non-lovable host.
const PUBLIC_SHARE_BASE = "https://padel-matchup.philosophie.ai";

function shareBase() {
  if (typeof window === "undefined") return PUBLIC_SHARE_BASE;
  const host = window.location.hostname;
  const isLovable =
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovable.dev") ||
    host === "localhost" ||
    host.startsWith("127.");
  return isLovable ? PUBLIC_SHARE_BASE : window.location.origin;
}

export function buildShareUrls({ view, edit }) {
  const base = shareBase() + "/";
  const viewUrl = view ? `${base}?${PARAM_VIEW}=${view}` : "";
  const editUrl = view && edit ? `${base}?${PARAM_VIEW}=${view}&${PARAM_EDIT}=${edit}` : "";
  return { viewUrl, editUrl };
}

export function subscribeTournament(viewToken, onChange) {
  const channel = supabase.channel(`tournament:${viewToken}`, {
    config: { broadcast: { self: false } },
  });
  channel
    .on("broadcast", { event: "update" }, (msg) => {
      const state = msg?.payload?.state;
      if (state) onChange(state);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// Fire-and-forget broadcast after a successful save so viewers refresh instantly.
export async function broadcastTournament(viewToken, state) {
  try {
    const channel = supabase.channel(`tournament:${viewToken}`);
    await new Promise((resolve) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
      });
      setTimeout(resolve, 1500);
    });
    await channel.send({ type: "broadcast", event: "update", payload: { state } });
    setTimeout(() => supabase.removeChannel(channel), 500);
  } catch (e) {
    // best effort
  }
}

export async function createTournament(state) {
  const { data, error } = await supabase.rpc("create_tournament", { initial_state: state });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row; // { id, view_token, edit_token }
}

export async function loadTournament(viewToken) {
  const { data, error } = await supabase.rpc("load_tournament", { _view_token: viewToken });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row || null; // { state, updated_at }
}

export async function saveTournament(editToken, state) {
  const { data, error } = await supabase.rpc("save_tournament", {
    _edit_token: editToken,
    _state: state,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row; // { view_token, updated_at }
}
