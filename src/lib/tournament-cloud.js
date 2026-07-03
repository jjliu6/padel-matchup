import { supabase } from '@/integrations/supabase/client';

const PARAM_VIEW = 'v';
const PARAM_EDIT = 'e';

export function getUrlTokens() {
  if (typeof window === 'undefined') return { view: null, edit: null };
  const u = new URL(window.location.href);
  return {
    view: u.searchParams.get(PARAM_VIEW),
    edit: u.searchParams.get(PARAM_EDIT),
  };
}

export function updateUrlTokens({ view, edit }) {
  if (typeof window === 'undefined') return;
  const u = new URL(window.location.href);
  if (view) u.searchParams.set(PARAM_VIEW, view); else u.searchParams.delete(PARAM_VIEW);
  if (edit) u.searchParams.set(PARAM_EDIT, edit); else u.searchParams.delete(PARAM_EDIT);
  window.history.replaceState({}, '', u.toString());
}

// Public share base — never use preview/lovable.app origins because those
// are gated behind a Lovable login and confuse viewers. Fall back to the
// current origin only when running on a non-lovable host.
const PUBLIC_SHARE_BASE = 'https://padel-matchup.philosophie.ai';

function shareBase() {
  if (typeof window === 'undefined') return PUBLIC_SHARE_BASE;
  const host = window.location.hostname;
  const isLovable = host.endsWith('.lovable.app') || host.endsWith('.lovable.dev') || host === 'localhost' || host.startsWith('127.');
  return isLovable ? PUBLIC_SHARE_BASE : window.location.origin;
}

export function buildShareUrls({ view, edit }) {
  const base = shareBase() + '/';
  const viewUrl = view ? `${base}?${PARAM_VIEW}=${view}` : '';
  const editUrl = view && edit ? `${base}?${PARAM_VIEW}=${view}&${PARAM_EDIT}=${edit}` : '';
  return { viewUrl, editUrl };
}

export function subscribeTournament(viewToken, onChange) {
  const channel = supabase
    .channel(`tournament:${viewToken}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tournaments', filter: `view_token=eq.${viewToken}` },
      (payload) => {
        if (payload?.new?.state) onChange(payload.new.state);
      })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function createTournament(state) {
  const { data, error } = await supabase.rpc('create_tournament', { initial_state: state });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row; // { id, view_token, edit_token }
}

export async function loadTournament(viewToken) {
  const { data, error } = await supabase.rpc('load_tournament', { _view_token: viewToken });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row || null; // { state, updated_at }
}

export async function saveTournament(editToken, state) {
  const { data, error } = await supabase.rpc('save_tournament', {
    _edit_token: editToken,
    _state: state,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row; // { view_token, updated_at }
}
