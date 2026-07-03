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

export function buildShareUrls({ view, edit }) {
  if (typeof window === 'undefined') return { viewUrl: '', editUrl: '' };
  const base = window.location.origin + window.location.pathname;
  const viewUrl = view ? `${base}?${PARAM_VIEW}=${view}` : '';
  const editUrl = view && edit ? `${base}?${PARAM_VIEW}=${view}&${PARAM_EDIT}=${edit}` : '';
  return { viewUrl, editUrl };
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
