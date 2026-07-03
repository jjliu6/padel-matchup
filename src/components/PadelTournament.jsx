import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createTournament, loadTournament, saveTournament, getUrlTokens, updateUrlTokens, buildShareUrls, subscribeTournament, broadcastTournament } from '@/lib/tournament-cloud';
import QRCode from 'qrcode';

const LS_KEY = 'padel-tournament-state-v1';
const loadPersisted = () => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; }
  catch { return {}; }
};
const _persisted = loadPersisted();
const pget = (k, fallback) => (k in _persisted ? _persisted[k] : fallback);
import * as XLSX from 'xlsx';
import {
  Trophy, Users, Home, Crown, Plus, Minus, Coffee, Swords, Flag, Check, Medal,
  ArrowRight, ListOrdered, FileSpreadsheet, LayoutGrid, Monitor, X,
  ChevronLeft, ChevronRight, Shuffle, Share2, Copy, Eye, Loader2, CloudOff, Cloud,
} from 'lucide-react';

const BYE = '__BYE__';
const fullRounds = (c) => (c % 2 === 0 ? c - 1 : c);
const key = (g, ri, mi) => `${g}-${ri}-${mi}`;

/* ---------- 固定搭档：圆桌轮转排赛 ---------- */
function generateSchedule(teams) {
  const arr = [...teams];
  if (arr.length % 2 === 1) arr.push(BYE);
  const n = arr.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a === BYE) matches.push({ bye: b });
      else if (b === BYE) matches.push({ bye: a });
      else matches.push({ a, b });
    }
    rounds.push(matches);
    arr.splice(1, 0, arr.splice(n - 1, 1)[0]);
  }
  return rounds;
}

/* ---------- 非固定搭档（Americano）排赛 ---------- */
function generateAmericano(players, roundsWanted) {
  const n = players.length;
  const pkey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const partner = {}, opp = {};
  const pc = (a, b) => partner[pkey(a, b)] || 0;
  const oc = (a, b) => opp[pkey(a, b)] || 0;
  const addP = (a, b) => { partner[pkey(a, b)] = pc(a, b) + 1; };
  const addO = (a, b) => { opp[pkey(a, b)] = oc(a, b) + 1; };
  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sitCount = players.map(() => 0);
  const rounds = [];
  for (let r = 0; r < roundsWanted; r++) {
    const sitN = n % 4;
    const sits = [...Array(n).keys()].sort((a, b) => sitCount[a] - sitCount[b] || Math.random() - 0.5).slice(0, sitN);
    sits.forEach((i) => sitCount[i]++);
    let active = shuffle([...Array(n).keys()].filter((i) => !sits.includes(i)));
    const pairs = []; const used = new Set();
    for (const p of active) {
      if (used.has(p)) continue;
      let best = null, bestScore = Infinity;
      for (const q of active) {
        if (q === p || used.has(q)) continue;
        const s = pc(p, q) * 100 + Math.random();
        if (s < bestScore) { bestScore = s; best = q; }
      }
      used.add(p); used.add(best); pairs.push([p, best]); addP(p, best);
    }
    const courts = []; const usedPair = new Set();
    for (let i = 0; i < pairs.length; i++) {
      if (usedPair.has(i)) continue;
      let best = null, bestScore = Infinity;
      for (let j = i + 1; j < pairs.length; j++) {
        if (usedPair.has(j)) continue;
        const [a, b] = pairs[i], [c, d] = pairs[j];
        const s = (oc(a, c) + oc(a, d) + oc(b, c) + oc(b, d)) * 100 + Math.random();
        if (s < bestScore) { bestScore = s; best = j; }
      }
      usedPair.add(i); usedPair.add(best);
      const [a, b] = pairs[i], [c, d] = pairs[best];
      addO(a, c); addO(a, d); addO(b, c); addO(b, d);
      courts.push({ t1: [a, b], t2: [c, d] });
    }
    rounds.push({
      courts: courts.map((c) => ({ t1: c.t1.map((i) => players[i]), t2: c.t2.map((i) => players[i]) })),
      byes: sits.map((i) => players[i]),
    });
  }
  return rounds;
}

function computeAmLeaderboard(players, schedule, results) {
  const stats = {};
  players.forEach((p) => { stats[p] = { name: p, points: 0, played: 0, win: 0 }; });
  schedule.forEach((rd, ri) => rd.courts.forEach((c, ci) => {
    const res = results[`${ri}-${ci}`];
    if (!res?.done) return;
    const { s1, s2 } = res;
    c.t1.forEach((p) => { if (stats[p]) { stats[p].points += s1; stats[p].played++; if (s1 > s2) stats[p].win++; } });
    c.t2.forEach((p) => { if (stats[p]) { stats[p].points += s2; stats[p].played++; if (s2 > s1) stats[p].win++; } });
  }));
  return Object.values(stats).sort((x, y) => y.points - x.points || y.win - x.win || x.name.localeCompare(y.name));
}

/* ---------- 固定搭档：比分/积分/淘汰赛 ---------- */
function outcome(res) {
  if (!res?.done || !res.sets?.length) return null;
  let sA = 0, sB = 0, gA = 0, gB = 0;
  res.sets.forEach((s) => { const a = s.a || 0, b = s.b || 0; gA += a; gB += b; if (a > b) sA++; else if (b > a) sB++; });
  return { setsA: sA, setsB: sB, gamesA: gA, gamesB: gB, winner: sA > sB ? 'a' : sB > sA ? 'b' : null };
}
const setsStr = (res) => (res?.done && res.sets?.length ? res.sets.map((s) => `${s.a}-${s.b}`).join(' ') : '—');

function computeStandings(teams, schedule, results, g) {
  const stats = {};
  teams.forEach((t) => { stats[t] = { team: t, played: 0, win: 0, draw: 0, loss: 0, sf: 0, sa: 0, gf: 0, ga: 0, byes: 0, pts: 0 }; });
  (schedule || []).forEach((matches, ri) => matches.forEach((m, mi) => {
    if (m.bye) { if (stats[m.bye]) stats[m.bye].byes += 1; return; }
    const o = outcome(results[key(g, ri, mi)]); if (!o) return;
    const A = stats[m.a], B = stats[m.b];
    A.played++; B.played++;
    A.sf += o.setsA; A.sa += o.setsB; A.gf += o.gamesA; A.ga += o.gamesB;
    B.sf += o.setsB; B.sa += o.setsA; B.gf += o.gamesB; B.ga += o.gamesA;
    if (o.winner === 'a') { A.win++; B.loss++; A.pts += 3; }
    else if (o.winner === 'b') { B.win++; A.loss++; B.pts += 3; }
    else { A.draw++; B.draw++; A.pts++; B.pts++; }
  }));
  return Object.values(stats).sort((x, y) => y.pts - x.pts || (y.sf - y.sa) - (x.sf - x.sa) || (y.gf - y.ga) - (x.gf - x.ga) || x.team.localeCompare(y.team));
}
const koWinner = (res, a, b) => { const o = outcome(res); return !o ? null : (o.winner === 'b' ? b : a); };
const koLoser = (res, a, b) => { const o = outcome(res); return !o ? null : (o.winner === 'b' ? a : b); };

function computeBracket({ mode, single, A, B, advancePerGroup, ko }) {
  const out = { kind: 'none', sf1: null, sf2: null, final: null, third: null, champion: null, runnerUp: null, thirdPlace: null };
  if (mode === 'double' && advancePerGroup >= 2 && A.length >= 2 && B.length >= 2) {
    out.kind = 'semis';
    out.sf1 = { a: A[0].team, aLabel: 'A组 #1', b: B[1].team, bLabel: 'B组 #2' };
    out.sf2 = { a: B[0].team, aLabel: 'B组 #1', b: A[1].team, bLabel: 'A组 #2' };
  } else if (mode === 'double' && A.length >= 1 && B.length >= 1) {
    out.kind = 'final';
    out.final = { a: A[0].team, aLabel: 'A组 #1', b: B[0].team, bLabel: 'B组 #1', res: ko.final };
  } else if (mode === 'single' && single.length >= 4) {
    out.kind = 'semis';
    out.sf1 = { a: single[0].team, aLabel: '#1', b: single[3].team, bLabel: '#4' };
    out.sf2 = { a: single[1].team, aLabel: '#2', b: single[2].team, bLabel: '#3' };
  } else if (mode === 'single' && single.length >= 2) {
    out.kind = 'final';
    out.final = { a: single[0].team, aLabel: '#1', b: single[1].team, bLabel: '#2', res: ko.final };
  } else { return out; }

  if (out.kind === 'semis') {
    out.sf1.res = ko.sf1; out.sf2.res = ko.sf2;
    const w1 = koWinner(ko.sf1, out.sf1.a, out.sf1.b), l1 = koLoser(ko.sf1, out.sf1.a, out.sf1.b);
    const w2 = koWinner(ko.sf2, out.sf2.a, out.sf2.b), l2 = koLoser(ko.sf2, out.sf2.a, out.sf2.b);
    const ready = !!(w1 && w2);
    out.final = { a: w1, b: w2, res: ko.final, pending: !ready };
    out.third = { a: l1, b: l2, res: ko.third, pending: !ready };
    if (ready && ko.final?.done) { out.champion = koWinner(ko.final, w1, w2); out.runnerUp = koLoser(ko.final, w1, w2); }
    if (l1 && l2 && ko.third?.done) out.thirdPlace = koWinner(ko.third, l1, l2);
  } else {
    const { a, b } = out.final;
    if (ko.final?.done) { out.champion = koWinner(ko.final, a, b); out.runnerUp = koLoser(ko.final, a, b); }
    if (mode === 'single' && single[2]) out.thirdPlace = single[2].team;
  }
  return out;
}
const gLabel = (g) => (g === 'A' ? 'A组' : g === 'B' ? 'B组' : '循环赛');

/* ============ 双语小标题助手 ============ */
function Bi({ zh, en, className = '', enCls = 'text-slate-400' }) {
  return (
    <div className={`leading-tight ${className}`}>
      <div>{zh}</div>
      <div className={`text-[10px] font-normal tracking-wider uppercase ${enCls}`}>{en}</div>
    </div>
  );
}

export default function PadelTournament() {
  const [urlTokens] = useState(() => getUrlTokens());
  const [stage, setStage] = useState(() => pget('stage', 'setup'));
  const [resumeStage, setResumeStage] = useState(null);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [title, setTitle] = useState(() => pget('title', 'Padel 循环赛'));
  const [teams, setTeams] = useState(() => pget('teams', ['队伍 1', '队伍 2', '队伍 3', '队伍 4', '队伍 5', '队伍 6', '队伍 7', '队伍 8']));
  const [groupOf, setGroupOf] = useState(() => pget('groupOf', ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B']));
  const [mode, setMode] = useState(() => pget('mode', 'single'));
  const [advancePerGroup, setAdvancePerGroup] = useState(() => pget('advancePerGroup', 2));
  const [numRounds, setNumRounds] = useState(() => pget('numRounds', fullRounds(8)));
  const [defaultSets, setDefaultSets] = useState(() => pget('defaultSets', 1));
  const [schedules, setSchedules] = useState(() => pget('schedules', {}));
  const [results, setResults] = useState(() => pget('results', {}));
  const [ko, setKo] = useState(() => pget('ko', {}));
  const [activeGroup, setActiveGroup] = useState(() => pget('activeGroup', 'single'));
  const [activeRound, setActiveRound] = useState(() => pget('activeRound', 0));
  const [amSchedule, setAmSchedule] = useState(() => pget('amSchedule', []));
  const [amResults, setAmResults] = useState(() => pget('amResults', {}));
  const [amRound, setAmRound] = useState(() => pget('amRound', 0));
  const [showBig, setShowBig] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);


  // ----- Cloud share/sync -----
  const [cloudTokens, setCloudTokens] = useState(() => (urlTokens.view ? { view_token: urlTokens.view, edit_token: urlTokens.edit || null } : null)); // { view_token, edit_token } | null
  const [readOnly, setReadOnly] = useState(() => !!urlTokens.view && !urlTokens.edit);
  const [remoteLoading, setRemoteLoading] = useState(() => !!urlTokens.view);
  const [showShare, setShowShare] = useState(false);
  const [syncStatus, setSyncStatus] = useState(() => (urlTokens.view ? 'loading' : 'idle')); // idle|saving|saved|error|loading
  const [publishing, setPublishing] = useState(false);
  const initialLoadRef = useRef(false);
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef('');
  const canEdit = !readOnly && !remoteLoading && (!cloudTokens?.view_token || !!cloudTokens?.edit_token);

  // Bundle current state to serialize to cloud
  const buildState = () => ({
    stage, title, teams, groupOf, mode, advancePerGroup, numRounds, defaultSets,
    schedules, results, ko, activeGroup, activeRound, amSchedule, amResults, amRound,
  });

  const applyRemoteState = (s) => {
    if (!s || typeof s !== 'object') return;
    if ('stage' in s) setStage(s.stage);
    if ('title' in s) setTitle(s.title);
    if ('teams' in s) setTeams(s.teams);
    if ('groupOf' in s) setGroupOf(s.groupOf);
    if ('mode' in s) setMode(s.mode);
    if ('advancePerGroup' in s) setAdvancePerGroup(s.advancePerGroup);
    if ('numRounds' in s) setNumRounds(s.numRounds);
    if ('defaultSets' in s) setDefaultSets(s.defaultSets);
    if ('schedules' in s) setSchedules(s.schedules);
    if ('results' in s) setResults(s.results);
    if ('ko' in s) setKo(s.ko);
    if ('activeGroup' in s) setActiveGroup(s.activeGroup);
    if ('activeRound' in s) setActiveRound(s.activeRound);
    if ('amSchedule' in s) setAmSchedule(s.amSchedule);
    if ('amResults' in s) setAmResults(s.amResults);
    if ('amRound' in s) setAmRound(s.amRound);
  };

  // Initial load: check URL for share tokens
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    const { view, edit } = urlTokens;
    if (!view) return;
    setSyncStatus('loading');
    setRemoteLoading(true);
    setReadOnly(!edit);
    loadTournament(view).then((row) => {
      if (!row) { setSyncStatus('error'); return; }
      applyRemoteState(row.state);
      lastSavedRef.current = JSON.stringify(row.state);
      if (edit) {
        setCloudTokens({ view_token: view, edit_token: edit });
        setReadOnly(false);
      } else {
        setCloudTokens({ view_token: view, edit_token: null });
        setReadOnly(true);
      }
      setSyncStatus('saved');
    }).catch(() => setSyncStatus('error'))
      .finally(() => setRemoteLoading(false));
  }, [urlTokens]);

  // Local persistence (skip in read-only mode so a viewer's changes don't overwrite their own restore)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (readOnly) return;
    if (remoteLoading) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(buildState()));
    } catch { /* quota / private mode */ }
  }, [readOnly, remoteLoading, stage, title, teams, groupOf, mode, advancePerGroup, numRounds, defaultSets,
      schedules, results, ko, activeGroup, activeRound, amSchedule, amResults, amRound]);

  // Debounced cloud auto-save when we hold the edit token
  useEffect(() => {
    if (!cloudTokens?.edit_token) return;
    if (!canEdit) return;
    const payload = buildState();
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveTournament(cloudTokens.edit_token, payload);
        lastSavedRef.current = serialized;
        setSyncStatus('saved');
        broadcastTournament(cloudTokens.view_token, payload);
      } catch {
        setSyncStatus('error');
      }
    }, 800);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [cloudTokens, canEdit, stage, title, teams, groupOf, mode, advancePerGroup, numRounds, defaultSets,
      schedules, results, ko, activeGroup, activeRound, amSchedule, amResults, amRound]);

  // Realtime broadcast subscription — instant push to viewers and other editors
  useEffect(() => {
    if (!cloudTokens?.view_token) return;
    const unsub = subscribeTournament(cloudTokens.view_token, (remoteState) => {
      const serialized = JSON.stringify(remoteState);
      if (serialized !== lastSavedRef.current) {
        applyRemoteState(remoteState);
        lastSavedRef.current = serialized;
      }
    });
    return unsub;
  }, [cloudTokens?.view_token]);



  const handlePublish = async () => {
    if (!canEdit) return;
    setPublishing(true);
    try {
      const row = await createTournament(buildState());
      const tokens = { view_token: row.view_token, edit_token: row.edit_token };
      setCloudTokens(tokens);
      lastSavedRef.current = JSON.stringify(buildState());
      updateUrlTokens({ view: tokens.view_token, edit: tokens.edit_token });
      setSyncStatus('saved');
      setShowShare(true);
    } catch (e) {
      setSyncStatus('error');
      alert('发布失败 / Publish failed: ' + (e?.message || e));
    } finally {
      setPublishing(false);
    }
  };

  const isAm = mode === 'americano';
  const sizeA = groupOf.filter((g) => g === 'A').length;
  const sizeB = groupOf.filter((g) => g === 'B').length;
  const maxRounds = isAm ? Math.max(1, teams.length - 1)
    : mode === 'double' ? Math.max(1, Math.min(fullRounds(sizeA), fullRounds(sizeB)))
      : fullRounds(teams.length);

  const teamsA = useMemo(() => teams.filter((_, i) => groupOf[i] === 'A'), [teams, groupOf]);
  const teamsB = useMemo(() => teams.filter((_, i) => groupOf[i] === 'B'), [teams, groupOf]);
  const standingsSingle = useMemo(() => computeStandings(teams, schedules.single, results, 'single'), [teams, schedules, results]);
  const standingsA = useMemo(() => computeStandings(teamsA, schedules.A, results, 'A'), [teamsA, schedules, results]);
  const standingsB = useMemo(() => computeStandings(teamsB, schedules.B, results, 'B'), [teamsB, schedules, results]);
  const amLeaderboard = useMemo(() => computeAmLeaderboard(teams, amSchedule, amResults), [teams, amSchedule, amResults]);

  const progress = useMemo(() => {
    let total = 0, done = 0;
    Object.entries(schedules).forEach(([g, rounds]) => (rounds || []).forEach((ms, ri) => ms.forEach((m, mi) => { if (m.bye) return; total++; if (results[key(g, ri, mi)]?.done) done++; })));
    return { total, done };
  }, [schedules, results]);
  const amProgress = useMemo(() => {
    let total = 0, done = 0;
    amSchedule.forEach((rd, ri) => rd.courts.forEach((c, ci) => { total++; if (amResults[`${ri}-${ci}`]?.done) done++; }));
    return { total, done };
  }, [amSchedule, amResults]);
  const groupDone = progress.total > 0 && progress.done === progress.total;

  const bracket = useMemo(() => computeBracket({ mode, single: standingsSingle, A: standingsA, B: standingsB, advancePerGroup, ko }),
    [mode, standingsSingle, standingsA, standingsB, advancePerGroup, ko]);

  const hasProgress = isAm ? Object.keys(amResults).length > 0 : (Object.keys(results).length > 0 || Object.keys(ko).length > 0);

  const setTeamName = (i, name) => { if (!canEdit) return; setTeams((p) => p.map((t, idx) => (idx === i ? name : t))); };
  const setGroup = (i, g) => { if (!canEdit) return; setGroupOf((p) => p.map((x, idx) => (idx === i ? g : x))); };
  const addTeam = () => { if (!canEdit) return; setTeams((p) => [...p, `${isAm ? '选手' : '队伍'} ${p.length + 1}`]); setGroupOf((p) => { const a = p.filter((g) => g === 'A').length, b = p.filter((g) => g === 'B').length; return [...p, a <= b ? 'A' : 'B']; }); };
  const removeTeam = (i) => { if (!canEdit) return; if (teams.length <= 2) return; setTeams((p) => p.filter((_, idx) => idx !== i)); setGroupOf((p) => p.filter((_, idx) => idx !== i)); };
  const enableDouble = () => { if (!canEdit) return; setMode('double'); setGroupOf((p) => { if (p.length === teams.length) return p; const half = Math.ceil(teams.length / 2); return teams.map((_, i) => (i < half ? 'A' : 'B')); }); };

  const relabelDefault = (names, from, to) => names.map((n) => { const m = n.trim().match(/^(队伍|选手)\s*(.+)$/); return m && m[1] === from ? `${to} ${m[2]}` : n; });
  const chooseMode = (m) => {
    if (!canEdit) return;
    if (m === 'americano') { setTeams((p) => relabelDefault(p, '队伍', '选手')); setMode('americano'); }
    else if (m === 'double') { setTeams((p) => relabelDefault(p, '选手', '队伍')); enableDouble(); }
    else { setTeams((p) => relabelDefault(p, '选手', '队伍')); setMode('single'); }
  };

  const canStart = mode === 'single' ? teams.length >= 2 : mode === 'double' ? (sizeA >= 2 && sizeB >= 2) : teams.length >= 4;

  const doGenerate = () => {
    if (!canEdit) return;
    setConfirmRegen(false);
    const clean = teams.map((t, i) => t.trim() || `${isAm ? '选手' : '队伍'} ${i + 1}`);
    const seen = new Set();
    const unique = clean.map((t) => { let name = t, k = 2; while (seen.has(name)) name = `${t} (${k++})`; seen.add(name); return name; });
    setTeams(unique);
    if (isAm) {
      setAmSchedule(generateAmericano(unique, Math.min(numRounds, Math.max(1, unique.length - 1))));
      setAmResults({}); setAmRound(0); setStage('americano');
    } else if (mode === 'single') {
      setSchedules({ single: generateSchedule(unique).slice(0, Math.min(numRounds, fullRounds(unique.length))) });
      setResults({}); setKo({}); setActiveGroup('single'); setActiveRound(0); setStage('group');
    } else {
      const listA = unique.filter((_, i) => groupOf[i] === 'A');
      const listB = unique.filter((_, i) => groupOf[i] === 'B');
      const r = Math.min(numRounds, fullRounds(listA.length), fullRounds(listB.length));
      setSchedules({ A: generateSchedule(listA).slice(0, r), B: generateSchedule(listB).slice(0, r) });
      setResults({}); setKo({}); setActiveGroup('A'); setActiveRound(0); setStage('group');
    }
    setResumeStage(null);
  };
  const start = () => { if (!canEdit) return; return hasProgress ? setConfirmRegen(true) : doGenerate(); };
  const goHome = () => { setResumeStage(stage); setStage('setup'); };
  const resume = () => { setStage(resumeStage); setResumeStage(null); };

  const [confirmNew, setConfirmNew] = useState(false);
  const startNewSession = () => {
    if (!canEdit && readOnly) return;
    try { localStorage.removeItem(LS_KEY); } catch {}
    updateUrlTokens({ view: null, edit: null });
    setCloudTokens(null);
    setReadOnly(false);
    setSyncStatus('idle');
    lastSavedRef.current = '';
    setResumeStage(null);
    setStage('setup');
    setTitle('Padel 循环赛');
    setTeams(['队伍 1', '队伍 2', '队伍 3', '队伍 4', '队伍 5', '队伍 6', '队伍 7', '队伍 8']);
    setGroupOf(['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B']);
    setMode('single');
    setAdvancePerGroup(2);
    setNumRounds(fullRounds(8));
    setDefaultSets(1);
    setSchedules({});
    setResults({});
    setKo({});
    setActiveGroup('single');
    setActiveRound(0);
    setAmSchedule([]);
    setAmResults({});
    setAmRound(0);
    setConfirmNew(false);
  };


  const saveScore = (g, ri, mi, sets) => { if (!canEdit) return; setResults((p) => ({ ...p, [key(g, ri, mi)]: { sets, done: true } })); };
  const clearScore = (g, ri, mi) => { if (!canEdit) return; setResults((p) => { const n = { ...p }; delete n[key(g, ri, mi)]; return n; }); };
  const saveAm = (ri, ci, s1, s2) => { if (!canEdit) return; setAmResults((p) => ({ ...p, [`${ri}-${ci}`]: { s1, s2, done: true } })); };
  const clearAm = (ri, ci) => { if (!canEdit) return; setAmResults((p) => { const n = { ...p }; delete n[`${ri}-${ci}`]; return n; }); };

  const exportModel = useMemo(() => {
    if (isAm) {
      const amRows = [];
      amSchedule.forEach((rd, ri) => {
        rd.courts.forEach((c, ci) => { const r = amResults[`${ri}-${ci}`]; amRows.push({ round: ri + 1, court: ci + 1, t1: c.t1.join(' & '), t2: c.t2.join(' & '), score: r?.done ? `${r.s1} : ${r.s2}` : '—' }); });
        rd.byes.forEach((b) => amRows.push({ round: ri + 1, court: '-', t1: b, t2: '（轮空）', score: '' }));
      });
      return { title, mode, leaderboard: amLeaderboard, amRows };
    }
    const groups = mode === 'single'
      ? [{ g: 'single', name: '积分榜', rows: standingsSingle, qc: standingsSingle.length >= 4 ? 4 : 2 }]
      : [{ g: 'A', name: 'A组', rows: standingsA, qc: advancePerGroup }, { g: 'B', name: 'B组', rows: standingsB, qc: advancePerGroup }];
    const matches = [];
    Object.entries(schedules).forEach(([g, rounds]) => (rounds || []).forEach((ms, ri) => ms.forEach((m, mi) => {
      if (m.bye) { matches.push({ group: gLabel(g), round: ri + 1, a: m.bye, b: '（轮空）', score: '' }); return; }
      matches.push({ group: gLabel(g), round: ri + 1, a: m.a, b: m.b, score: setsStr(results[key(g, ri, mi)]) });
    })));
    return { title, mode, groups, matches, bracket };
  }, [isAm, title, mode, schedules, results, standingsSingle, standingsA, standingsB, advancePerGroup, bracket, amSchedule, amResults, amLeaderboard]);

  const bigGroups = mode === 'single'
    ? [{ g: 'single', name: '赛程 · Fixtures', rounds: schedules.single || [], standings: standingsSingle, qc: standingsSingle.length >= 4 ? 4 : 2 }]
    : mode === 'double'
      ? [{ g: 'A', name: 'A 组 · Group A', rounds: schedules.A || [], standings: standingsA, qc: advancePerGroup }, { g: 'B', name: 'B 组 · Group B', rounds: schedules.B || [], standings: standingsB, qc: advancePerGroup }]
      : [];

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100" aria-hidden />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 font-sans">

      <div>
        <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white shadow-lg shadow-blue-900/20 border-b-2 border-amber-400/80">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="bg-amber-400 text-blue-900 rounded-xl p-2 shrink-0 shadow-md shadow-amber-400/30"><Trophy size={20} /></div>
              <div className="min-w-0">
                <h1 className="text-lg font-black tracking-tight truncate leading-none">{title}</h1>
                <div className="text-[10px] text-amber-300/80 tracking-[0.25em] uppercase mt-0.5">Padel Tournament</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {stage !== 'setup' && <button onClick={() => setShowBig(true)} className="flex items-center gap-1 text-sm bg-amber-400 text-blue-900 hover:bg-amber-300 px-3 py-1.5 rounded-lg font-semibold shadow-sm shadow-amber-400/30 transition-colors"><Monitor size={15} /> 大屏<span className="hidden sm:inline text-[10px] font-normal opacity-70 ml-0.5">Screen</span></button>}
              {stage !== 'setup' && !readOnly && (
                cloudTokens?.edit_token
                  ? <button onClick={() => setShowShare(true)} title="分享 / Share" className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"><Share2 size={15} /> <SyncBadge status={syncStatus} /></button>
                  : <button onClick={handlePublish} disabled={publishing} title="发布并生成分享链接 / Publish & share" className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">{publishing ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />} 分享<span className="hidden sm:inline text-[10px] font-normal opacity-70 ml-0.5">Share</span></button>
              )}
              {stage !== 'setup' && <button onClick={() => exportToExcel(exportModel)} className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"><FileSpreadsheet size={15} /> Excel</button>}
              {stage !== 'setup' && <button onClick={goHome} title="返回设置页（保留数据）/ Back to setup (keeps data)" className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"><Home size={15} /> 首页</button>}
              {!readOnly && <button onClick={() => setConfirmNew(true)} title="开始一场全新赛事（清空所有数据）/ Start new tournament (clears all)" className="flex items-center gap-1 text-sm bg-rose-500/90 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-lg transition-colors"><Plus size={15} /> 新建<span className="hidden sm:inline text-[10px] font-normal opacity-80 ml-0.5">New</span></button>}
            </div>
          </div>
        </header>

        {readOnly && (
          <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs sm:text-sm">
            <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2">
              <Eye size={14} className="shrink-0" />
              <span className="flex-1">只读观看模式 · 即时同步 <span className="opacity-70">Read-only view · live</span></span>
            </div>
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 py-6">
          {stage === 'setup' && (
            <SetupView {...{ title, setTitle, teams, setTeamName, addTeam, removeTeam, numRounds, setNumRounds, maxRounds,
              mode, chooseMode, groupOf, setGroup, sizeA, sizeB, advancePerGroup, setAdvancePerGroup, canStart, onStart: start,
              isAm, resumeStage, onResume: resume, defaultSets, setDefaultSets, canEdit }} />
          )}
          {stage === 'group' && (
            <GroupView {...{ mode, schedules, results, activeGroup, setActiveGroup, activeRound, setActiveRound, saveScore, clearScore,
              standingsSingle, standingsA, standingsB, advancePerGroup, progress, groupDone, defaultSets, canEdit, onGoKnockout: () => setStage('knockout') }} />
          )}
          {stage === 'knockout' && <KnockoutView bracket={bracket} ko={ko} setKo={setKo} defaultSets={defaultSets} canEdit={canEdit} onBack={() => setStage('group')} />}
          {stage === 'americano' && (
            <AmericanoView {...{ amSchedule, amResults, amRound, setAmRound, saveAm, clearAm, leaderboard: amLeaderboard, progress: amProgress, canEdit }} />
          )}
        </main>


        <footer className="max-w-5xl mx-auto px-4 pb-8 pt-2 text-center">
          <div className="text-xs text-slate-400">
            Created by <a href="https://philosophie.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 underline-offset-2">Eric Liu (Philosophie AI)</a>
          </div>
        </footer>
      </div>

      {confirmRegen && (
        <Modal onClose={() => setConfirmRegen(false)}>
          <div className="text-center">
            <div className="font-semibold text-lg mb-0.5">重新生成赛程？</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Regenerate schedule?</div>
            <p className="text-sm text-slate-500 mb-5">已有比分记录，重新生成会<b className="text-rose-500">清空现有比分</b>。若只是想返回查看，请点“取消”后用“继续比赛”。<br /><span className="text-xs text-slate-400">This will clear existing scores. To just look around, cancel and use “Resume”.</span></p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmRegen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-medium">取消 Cancel</button>
              <button onClick={doGenerate} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-medium">确定 Confirm</button>
            </div>
          </div>
        </Modal>
      )}

      {confirmNew && (
        <Modal onClose={() => setConfirmNew(false)}>
          <div className="text-center">
            <div className="font-semibold text-lg mb-0.5">开始一场全新赛事？</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Start a new tournament?</div>
            <p className="text-sm text-slate-500 mb-5">
              会<b className="text-rose-500">清空所有队伍、赛程和比分</b>，并断开当前的分享链接。<br />
              <span className="text-xs text-slate-400">Clears all teams, schedule and scores, and disconnects the current share link.</span><br />
              <span className="text-xs text-slate-500 mt-2 inline-block">如果只是想临时看别的页面，请点「首页」而不是「新建」。<br /><span className="text-slate-400">To just navigate around while keeping data, use “首页 Home” instead.</span></span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmNew(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-medium">取消 Cancel</button>
              <button onClick={startNewSession} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-medium">确定 Confirm</button>
            </div>
          </div>
        </Modal>
      )}


      {showBig && <BigScreen title={title} mode={mode} groups={bigGroups} bracket={bracket} results={results} amSchedule={amSchedule} amResults={amResults} amLeaderboard={amLeaderboard} onClose={() => setShowBig(false)} />}

      {showShare && cloudTokens && (
        <ShareModal tokens={cloudTokens} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

function SyncBadge({ status }) {
  if (status === 'saving') return <Loader2 size={12} className="animate-spin ml-1 opacity-80" />;
  if (status === 'error') return <CloudOff size={12} className="ml-1 text-rose-300" />;
  if (status === 'saved') return <Cloud size={12} className="ml-1 opacity-80" />;
  return null;
}

function ShareModal({ tokens, onClose }) {
  const { viewUrl, editUrl } = buildShareUrls({ view: tokens.view_token, edit: tokens.edit_token });
  const [copied, setCopied] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    if (!viewUrl) return;
    QRCode.toDataURL(viewUrl, { width: 512, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQrDataUrl).catch(() => setQrDataUrl(''));
  }, [viewUrl]);
  const copy = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    } catch { /* ignore */ }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="font-semibold text-lg mb-0.5 flex items-center gap-2"><Share2 size={18} className="text-blue-600" /> 分享比赛</div>
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Share this tournament · 实时同步 Live</div>

        {qrDataUrl && (
          <div className="mb-4 flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
            <img src={qrDataUrl} alt="QR code" className="w-48 h-48" />
            <div className="text-xs text-slate-500 mt-2 text-center">现场扫码看大屏 · Scan to watch live</div>
            {qrDataUrl && (
              <a href={qrDataUrl} download="padel-tournament-qr.png" className="text-[11px] text-blue-600 hover:text-blue-800 mt-1">下载二维码 Download QR</a>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Eye size={12} /> 只读观看 · View-only link</div>
          <div className="flex gap-1.5">
            <input readOnly value={viewUrl} className="flex-1 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono truncate" onFocus={(e) => e.target.select()} />
            <button onClick={() => copy('view', viewUrl)} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1"><Copy size={12} />{copied === 'view' ? '已复制' : '复制'}</button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">分享给观众/球员看积分和大屏。他们无法修改比分。</p>
        </div>

        {editUrl && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5"><Share2 size={12} /> 管理链接 · Editor link</div>
            <div className="flex gap-1.5">
              <input readOnly value={editUrl} className="flex-1 px-2.5 py-2 rounded-lg border border-amber-200 bg-amber-50 text-xs font-mono truncate" onFocus={(e) => e.target.select()} />
              <button onClick={() => copy('edit', editUrl)} className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium flex items-center gap-1"><Copy size={12} />{copied === 'edit' ? '已复制' : '复制'}</button>
            </div>
            <p className="text-[11px] text-rose-500 mt-1">⚠ 谨慎分享：拿到此链接的人可以修改所有比分。</p>
          </div>
        )}

        <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-300 font-medium text-sm">关闭 Close</button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ============ 设置页 ============ */
function SetupView(p) {
  const { title, setTitle, teams, setTeamName, addTeam, removeTeam, numRounds, setNumRounds, maxRounds,
    mode, chooseMode, groupOf, setGroup, sizeA, sizeB, advancePerGroup, setAdvancePerGroup, canStart, onStart,
    isAm, resumeStage, onResume, defaultSets, setDefaultSets, canEdit = true } = p;
  const rounds = Math.min(Math.max(1, numRounds), maxRounds);
  const stepRounds = (d) => { if (canEdit) setNumRounds(Math.min(maxRounds, Math.max(1, rounds + d))); };
  const isDouble = mode === 'double';
  const unit = isAm ? '选手 / Players' : '队伍 / Teams';
  const card = 'bg-white rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-300/40 p-5';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-300/40 aspect-[3/1] sm:aspect-[16/5] bg-slate-900">
        <img src="/hero-court.jpg" alt="Padel court at dusk" width={1920} height={640} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 max-w-[70%]">
          <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-amber-300/90 font-semibold">Padel Tournament</div>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow">循环赛 · 淘汰赛 · 非固定搭档</h2>
          <div className="mt-1 text-xs sm:text-sm tracking-[0.2em] uppercase text-amber-200/80 font-medium">Round Robin · Knockout · Americano</div>
          <p className="mt-3 text-xs sm:text-sm text-slate-200/85 max-w-md">一站式生成赛程、记录比分、大屏直播、扫码分享。<br /><span className="opacity-70">Schedule · Score · Big screen · Share.</span></p>

        </div>
      </div>

      {resumeStage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm text-amber-800">比赛进行中 · 修改名单需重新生成（会清空比分）。<br /><span className="text-xs text-amber-600">Tournament in progress — editing the roster requires regenerating.</span></span>
          <button onClick={onResume} className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg">继续<span className="text-[10px] ml-0.5 opacity-80">Resume</span></button>
        </div>
      )}

      <div className={card}>
        <label className="block mb-1.5"><Bi zh="比赛名称" en="Tournament Name" className="text-sm font-medium text-slate-600" /></label>
        <input value={title} onChange={(e) => canEdit && setTitle(e.target.value)} disabled={!canEdit} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500" />
      </div>

      <div className={card}>
        <div className="flex items-center gap-2 mb-3"><LayoutGrid size={18} className="text-blue-700" /><Bi zh="赛制模式" en="Format" className="font-semibold" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ModeCard active={mode === 'single'} onClick={() => chooseMode('single')} zh="单循环" en="Round Robin" desc="固定搭档，一个大循环 · Fixed pairs, one league" />
          <ModeCard active={mode === 'double'} onClick={() => chooseMode('double')} zh="双小组" en="Two-Group Round Robin" desc="分两组循环，交叉出线 · Two groups, crossover" />
          <ModeCard active={isAm} onClick={() => chooseMode('americano')} zh="非固定搭档 Americano" en="Americano" desc="每轮随机换搭档，累计个人得分 · Rotating partners" />
        </div>
        {isDouble && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">每组出线数 <span className="text-xs text-slate-400">Advance</span></span>
            {[1, 2].map((n) => <button key={n} onClick={() => canEdit && setAdvancePerGroup(n)} disabled={!canEdit} className={`px-3 py-1 rounded-lg border disabled:opacity-50 ${advancePerGroup === n ? 'bg-blue-700 text-white border-blue-700' : 'border-slate-300 text-slate-600'}`}>前 {n} 名</button>)}
            <span className="text-xs text-slate-400">{advancePerGroup === 2 ? '→ 交叉半决赛 / Crossover semis' : '→ 两冠军决赛 / Winners final'}</span>
          </div>
        )}
        {!isAm && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-500">默认盘数 <span className="text-xs text-slate-400">Sets / Match</span></span>
            {[[1, '一盘定胜负', '1 Set'], [3, '三盘两胜', 'Best of 3']].map(([n, zh, en]) => (
                <button key={n} onClick={() => canEdit && setDefaultSets(n)} disabled={!canEdit} className={`px-3 py-1 rounded-lg border disabled:opacity-50 ${defaultSets === n ? 'bg-blue-700 text-white border-blue-700' : 'border-slate-300 text-slate-600'}`}>{zh} <span className="text-[10px] opacity-70">{en}</span></button>
            ))}
            <span className="text-xs text-slate-400">记分时仍可临时加减 · adjustable per match</span>
          </div>
        )}
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Users size={18} className="text-blue-700" /><span className="font-semibold">参赛{unit}</span><span className="text-sm font-normal text-slate-500">· {teams.length}</span></div>
          <button onClick={addTeam} disabled={!canEdit} className="flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900 font-medium disabled:opacity-40 disabled:hover:text-blue-700"><Plus size={16} /> 添加 Add</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {teams.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-right text-sm text-slate-400">{i + 1}</span>
              <input value={t} onChange={(e) => setTeamName(i, e.target.value)} disabled={!canEdit} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500" />
              {isDouble && (
                <div className="flex rounded-lg overflow-hidden border border-slate-300 text-sm">
                  {['A', 'B'].map((g) => <button key={g} onClick={() => setGroup(i, g)} disabled={!canEdit} className={`px-2.5 py-1.5 disabled:opacity-60 ${groupOf[i] === g ? (g === 'A' ? 'bg-sky-600 text-white' : 'bg-orange-500 text-white') : 'bg-white text-slate-500'}`}>{g}</button>)}
                </div>
              )}
              <button onClick={() => removeTeam(i)} disabled={!canEdit || teams.length <= 2} className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1"><Minus size={16} /></button>
            </div>
          ))}
        </div>
        {isDouble && <div className="mt-3 text-sm text-slate-500 flex gap-4"><span>A组 <b className="text-sky-700">{sizeA}</b></span><span>B组 <b className="text-orange-600">{sizeB}</b></span>{!(sizeA >= 2 && sizeB >= 2) && <span className="text-rose-500">每组至少 2 队 / Min 2</span>}</div>}
        {isAm && teams.length < 4 && <div className="mt-3 text-sm text-rose-500">至少 4 名选手 / Need ≥ 4 players</div>}
      </div>

      <div className={card}>
        <div className="flex items-center gap-2 mb-1"><ListOrdered size={18} className="text-blue-700" /><Bi zh={isAm ? '比赛轮数' : '循环轮次'} en="Rounds" className="font-semibold" /></div>
        <p className="text-sm text-slate-500 mb-3">
          {isAm ? <>建议 {Math.min(6, maxRounds)}–{maxRounds} 轮，超过后搭档会重复。<span className="text-xs text-slate-400"> Beyond {maxRounds} rounds partners repeat.</span></> : <>{isDouble ? '两组各自' : ''}打满 <b>{maxRounds}</b> 轮为完整循环。<span className="text-xs text-slate-400"> Full round robin = {maxRounds} rounds.</span></>}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => stepRounds(-1)} disabled={!canEdit} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40"><Minus size={16} /></button>
          <div className="text-center"><div className="text-2xl font-bold text-blue-800 tabular-nums">{rounds}</div><div className="text-xs text-slate-400">轮 / of {maxRounds}</div></div>
          <button onClick={() => stepRounds(1)} disabled={!canEdit} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40"><Plus size={16} /></button>
          {rounds === maxRounds && !isAm && <span className="text-xs text-emerald-600 ml-1">完整循环 / Full</span>}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
        <Flag size={16} className="shrink-0" />
        {isAm ? <>非固定搭档 · {rounds} 轮 → 个人累计得分排名 <span className="text-xs text-blue-500">/ Americano, ranked by points</span></>
          : isDouble ? <>A/B 两组 × {rounds} 轮 → 每组前 {advancePerGroup} 名 → {advancePerGroup === 2 ? '交叉半决赛 → 决赛' : '两冠军决赛'} <span className="text-xs text-blue-500">/ Two groups → knockout</span></>
            : <>{rounds} 轮单循环 → 前 {teams.length >= 4 ? 4 : 2} 名 → {teams.length >= 4 ? '半决赛 → 决赛' : '决赛'} <span className="text-xs text-blue-500">/ Round robin → knockout</span></>}
      </div>

      <button onClick={onStart} disabled={!canEdit || !canStart} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all">
        生成赛程，开始比赛 <span className="text-xs font-normal opacity-80">Generate &amp; Start</span> <ArrowRight size={18} />
      </button>
    </div>
  );
}

function ModeCard({ active, onClick, zh, en, desc }) {
  return (
    <button onClick={onClick} className={`text-left rounded-xl border p-4 transition-all ${active ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white ring-1 ring-blue-500/20 shadow-sm shadow-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
      <div className={`font-bold ${active ? 'text-blue-800' : 'text-slate-800'}`}>{zh}</div>
      <div className={`text-xs font-semibold tracking-wide ${active ? 'text-blue-500' : 'text-slate-400'}`}>{en}</div>
      <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{desc}</div>
    </button>
  );
}

/* ============ 固定搭档：循环赛页 ============ */
function GroupView(p) {
  const { mode, schedules, results, activeGroup, setActiveGroup, activeRound, setActiveRound, saveScore, clearScore,
    standingsSingle, standingsA, standingsB, advancePerGroup, progress, groupDone, defaultSets, onGoKnockout } = p;
  const rounds = schedules[activeGroup] || [];
  const isDouble = mode === 'double';
  const switchGroup = (g) => { setActiveGroup(g); setActiveRound(0); };
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <ProgressBar done={progress.done} total={progress.total} zh="循环赛进度" en="Progress" />
        {isDouble && (
          <div className="flex gap-2">
            {['A', 'B'].map((g) => <button key={g} onClick={() => switchGroup(g)} className={`flex-1 py-2 rounded-lg font-semibold text-sm ${activeGroup === g ? (g === 'A' ? 'bg-sky-600 text-white' : 'bg-orange-500 text-white') : 'bg-white border border-slate-200 text-slate-500'}`}>{g} 组 · Group {g}</button>)}
          </div>
        )}
        <RoundTabs count={rounds.length} active={activeRound} onPick={setActiveRound} isDone={(ri) => rounds[ri].every((m, mi) => m.bye || results[key(activeGroup, ri, mi)]?.done)} />
        <div className="space-y-3">
          {rounds[activeRound]?.map((m, mi) => m.bye
            ? <ByeRow key={mi} name={m.bye} />
            : <ScoreCard key={mi} aName={m.a} bName={m.b} res={results[key(activeGroup, activeRound, mi)]} defaultSets={defaultSets} onSave={(sets) => saveScore(activeGroup, activeRound, mi, sets)} onClear={() => clearScore(activeGroup, activeRound, mi)} />)}
        </div>
        {groupDone
          ? <button onClick={onGoKnockout} className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-900 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all"><Flag size={18} /> 进入淘汰赛 <span className="text-xs font-medium opacity-80">Go to Knockout</span></button>
          : <p className="text-center text-sm text-slate-400">录完全部场次后进入淘汰赛 · Finish all matches to continue</p>}
      </div>
      <div className="lg:col-span-2 space-y-4">
        {isDouble
          ? <><StandingsTable zh="A 组积分榜" en="Group A" standings={standingsA} qualifyCount={advancePerGroup} accent="sky" /><StandingsTable zh="B 组积分榜" en="Group B" standings={standingsB} qualifyCount={advancePerGroup} accent="orange" /></>
          : <StandingsTable zh="积分榜" en="Standings" standings={standingsSingle} qualifyCount={standingsSingle.length >= 4 ? 4 : 2} accent="blue" />}
        <ByePanel standings={isDouble ? [...standingsA, ...standingsB] : standingsSingle} />
      </div>
    </div>
  );
}

/* ============ 非固定搭档（Americano）页 ============ */
function AmericanoView({ amSchedule, amResults, amRound, setAmRound, saveAm, clearAm, leaderboard, progress }) {
  const rd = amSchedule[amRound];
  const done = progress.total > 0 && progress.done === progress.total;
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <ProgressBar done={progress.done} total={progress.total} zh="比赛进度" en="Progress" />
        <RoundTabs count={amSchedule.length} active={amRound} onPick={setAmRound} isDone={(ri) => amSchedule[ri].courts.every((_, ci) => amResults[`${ri}-${ci}`]?.done)} />
        <div className="space-y-3">
          {rd?.courts.map((c, ci) => (
            <CourtCard key={ci} label={`球场 ${ci + 1} · Court ${ci + 1}`} court={c} res={amResults[`${amRound}-${ci}`]} onSave={(s1, s2) => saveAm(amRound, ci, s1, s2)} onClear={() => clearAm(amRound, ci)} />
          ))}
          {rd?.byes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 flex-wrap">
              <Coffee size={18} className="text-amber-600" /><span className="text-sm text-amber-700">本轮轮空 / Bye：</span>
              {rd.byes.map((b) => <span key={b} className="text-sm font-medium text-amber-800">{b}</span>)}
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-300/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><Medal size={17} className="text-blue-700" /><Bi zh="个人排名" en="Leaderboard" className="font-semibold" /></div>
          <table className="w-full text-sm">
            <thead><tr className="text-slate-400 text-xs"><Th zh="#" en="" /><Th zh="选手" en="Player" left /><Th zh="场" en="GP" /><Th zh="胜" en="W" /><Th zh="总分" en="Pts" pr /></tr></thead>
            <tbody>
              {leaderboard.map((s, i) => (
                <tr key={s.name} className={`border-t border-slate-50 ${i === 0 ? 'bg-amber-50' : i < 3 ? 'bg-amber-50/40' : ''}`}>
                  <td className="pl-4 py-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 font-medium text-slate-700 truncate max-w-[110px]">{i === 0 && <Crown size={12} className="inline mr-1 text-amber-400 -mt-0.5" />}{s.name}</td>
                  <td className="text-center py-2 text-slate-500">{s.played}</td>
                  <td className="text-center py-2 text-emerald-600">{s.win}</td>
                  <td className="text-center pr-4 py-2 font-bold text-blue-800">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {done && leaderboard[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-2xl shadow-lg shadow-amber-300/30 ring-1 ring-amber-100 p-6 text-center">
            <Crown size={34} className="mx-auto text-amber-400 mb-1" />
            <div className="text-sm text-amber-600 font-medium">🏆 总冠军 · Champion</div>
            <div className="text-xl font-bold text-blue-900">{leaderboard[0].name}</div>
            <div className="text-slate-400 text-sm mt-1">{leaderboard[0].points} 分 / pts</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourtCard({ label, court, res, onSave, onClear }) {
  const [s1, setS1] = useState(res ? String(res.s1) : '');
  const [s2, setS2] = useState(res ? String(res.s2) : '');
  const done = res?.done;
  const win1 = done && res.s1 > res.s2, win2 = done && res.s2 > res.s1;
  const commit = () => { if (s1 !== '' || s2 !== '') onSave(parseInt(s1 || '0', 10) || 0, parseInt(s2 || '0', 10) || 0); };
  const team = (arr, win) => <span className={`font-medium ${win ? 'text-blue-800' : 'text-slate-700'}`}>{win && <Crown size={13} className="inline mr-1 text-amber-400 -mt-0.5" />}{arr.join(' & ')}</span>;
  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm shadow-slate-200/50 ${done ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className="text-xs font-medium text-slate-400 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 truncate">{team(court.t1, win1)}</div>
        {done ? (
          <div className="text-xl font-bold tabular-nums shrink-0"><span className={win1 ? 'text-emerald-600' : 'text-slate-400'}>{res.s1}</span><span className="text-slate-300 mx-1">:</span><span className={win2 ? 'text-emerald-600' : 'text-slate-400'}>{res.s2}</span></div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <input value={s1} onChange={(e) => setS1(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" className="w-12 text-center border border-slate-300 rounded-lg py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-300">:</span>
            <input value={s2} onChange={(e) => setS2(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" className="w-12 text-center border border-slate-300 rounded-lg py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        <div className="flex-1 min-w-0 truncate text-right">{team(court.t2, win2)}</div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-sm">
        {done ? <><span className="flex items-center gap-1 text-emerald-600"><Check size={14} /> 已记录 Saved</span><button onClick={onClear} className="text-slate-400 hover:text-blue-700">修改 Edit</button></>
          : <button onClick={commit} className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-1.5 rounded-lg">记录比分 · Save</button>}
      </div>
    </div>
  );
}

/* ============ 淘汰赛页 ============ */
function KnockoutView({ bracket, ko, setKo, defaultSets, onBack }) {
  const save = (k, sets) => setKo((p) => ({ ...p, [k]: { sets, done: true } }));
  const clear = (k) => setKo((p) => { const n = { ...p }; delete n[k]; return n; });
  if (bracket.kind === 'none') return <div className="text-center text-slate-500"><button onClick={onBack} className="text-sm hover:text-blue-700">← 返回 Back</button><p className="mt-6">出线队伍不足，无法组织淘汰赛。<br /><span className="text-xs text-slate-400">Not enough qualifiers for knockout.</span></p></div>;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-blue-700">← 返回循环赛 · Back</button>
      {bracket.kind === 'semis' && (
        <>
          <SectionTitle icon={<Swords size={20} />} zh="半决赛" en="Semifinals" sub="胜者进决赛，负者争季军 · Winners → final, losers → 3rd" />
          <div className="grid sm:grid-cols-2 gap-3">
            <KOMatch label={`半决赛 A · ${bracket.sf1.aLabel} vs ${bracket.sf1.bLabel}`} aName={bracket.sf1.a} bName={bracket.sf1.b} res={ko.sf1} defaultSets={defaultSets} onSave={(s) => save('sf1', s)} onClear={() => clear('sf1')} />
            <KOMatch label={`半决赛 B · ${bracket.sf2.aLabel} vs ${bracket.sf2.bLabel}`} aName={bracket.sf2.a} bName={bracket.sf2.b} res={ko.sf2} defaultSets={defaultSets} onSave={(s) => save('sf2', s)} onClear={() => clear('sf2')} />
          </div>
          <SectionTitle icon={<Flag size={20} />} zh="决赛 & 季军赛" en="Final & 3rd Place" sub="由半决赛结果自动填入 · Auto-filled from semis" />
          <div className="grid sm:grid-cols-2 gap-3">
            <KOMatch label="🏆 决赛 · Final" aName={bracket.final.a} bName={bracket.final.b} res={ko.final} defaultSets={defaultSets} onSave={(s) => save('final', s)} onClear={() => clear('final')} pending={bracket.final.pending} pendingText="等待半决赛结束 · Awaiting semifinals" big />
            <KOMatch label="🥉 季军赛 · 3rd Place" aName={bracket.third.a} bName={bracket.third.b} res={ko.third} defaultSets={defaultSets} onSave={(s) => save('third', s)} onClear={() => clear('third')} pending={bracket.third.pending} pendingText="等待半决赛结束 · Awaiting semifinals" />
          </div>
        </>
      )}
      {bracket.kind === 'final' && (
        <>
          <SectionTitle icon={<Flag size={20} />} zh="总决赛" en="Grand Final" sub={`${bracket.final.aLabel} vs ${bracket.final.bLabel}`} />
          <KOMatch label="🏆 决赛 · Final" aName={bracket.final.a} bName={bracket.final.b} res={ko.final} defaultSets={defaultSets} onSave={(s) => save('final', s)} onClear={() => clear('final')} big />
        </>
      )}
      {bracket.champion && <ChampionBlock champ={bracket.champion} res={ko.final} runnerUp={bracket.runnerUp} third={bracket.thirdPlace} />}
    </div>
  );
}

function SectionTitle({ icon, zh, en, sub }) {
  return <div className="flex items-center gap-2 text-blue-800">{icon}<div><div className="font-bold leading-tight">{zh} <span className="text-xs font-normal text-slate-400 tracking-wide">{en}</span></div><div className="text-xs text-slate-400 font-normal">{sub}</div></div></div>;
}

function ChampionBlock({ champ, res, runnerUp, third }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-2xl shadow-lg shadow-amber-300/30 ring-1 ring-amber-100 p-8 text-center">
        <Crown size={40} className="mx-auto text-amber-400 mb-2" /><div className="text-sm text-amber-600 font-medium mb-1">🏆 冠军 · Champion</div>
        <div className="text-2xl font-bold text-blue-900">{champ}</div>
        {res?.done && <div className="text-slate-400 text-sm mt-2 tabular-nums">决赛盘分 / Score {setsStr(res)}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Podium zh="亚军" en="Runner-up" team={runnerUp} icon={<Medal className="text-slate-400" />} color="text-slate-500" />
        {third && <Podium zh="季军" en="3rd Place" team={third} icon={<Medal className="text-amber-600" />} color="text-amber-700" />}
      </div>
    </div>
  );
}

/* ============ 共用小组件 ============ */
function ProgressBar({ done, total, zh, en }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-300/40 p-4">
      <div className="flex items-center justify-between text-sm mb-2"><span className="font-medium text-slate-600">{zh} <span className="text-xs text-slate-400">{en}</span></span><span className="text-slate-500">{done} / {total}</span></div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
    </div>
  );
}
function RoundTabs({ count, active, onPick, isDone }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {Array.from({ length: count }).map((_, ri) => (
        <button key={ri} onClick={() => onPick(ri)} className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${active === ri ? 'bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'}`}>
          <span>第 {ri + 1} 轮<span className="text-[10px] opacity-60 ml-1">R{ri + 1}</span></span>{isDone(ri) && <Check size={13} className={active === ri ? 'text-amber-300' : 'text-emerald-500'} />}
        </button>
      ))}
    </div>
  );
}
function ByeRow({ name }) { return <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"><Coffee size={18} className="text-amber-600" /><span className="font-medium text-amber-800">{name}</span><span className="text-sm text-amber-600">本轮轮空 · Bye</span></div>; }

function KOMatch({ label, aName, bName, res, onSave, onClear, pending, pendingText, big, defaultSets }) {
  return (
    <div className="space-y-1.5">
      {label && <div className="text-xs font-medium text-slate-500">{label}</div>}
      {pending ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-400">{pendingText || '待定'}</div>
        : <ScoreCard key={`${aName}-${bName}`} aName={aName} bName={bName} res={res} defaultSets={defaultSets} onSave={onSave} onClear={onClear} big />}
    </div>
  );
}

function ScoreCard({ aName, bName, res, onSave, onClear, big, defaultSets = 1 }) {
  const init = res?.sets?.length ? res.sets.map((s) => ({ a: String(s.a), b: String(s.b) })) : Array.from({ length: defaultSets }, () => ({ a: '', b: '' }));
  const [sets, setSets] = useState(init);
  const done = res?.done;
  const o = done ? outcome(res) : null;
  const setVal = (i, side, v) => setSets((p) => p.map((s, idx) => (idx === i ? { ...s, [side]: v.replace(/[^0-9]/g, '') } : s)));
  const addSet = () => setSets((p) => (p.length < 3 ? [...p, { a: '', b: '' }] : p));
  const removeSet = (i) => setSets((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));
  const commit = () => { const parsed = sets.filter((s) => s.a !== '' || s.b !== '').map((s) => ({ a: parseInt(s.a || '0', 10) || 0, b: parseInt(s.b || '0', 10) || 0 })); if (parsed.length) onSave(parsed); };
  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm shadow-slate-200/50 ${done ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <TeamSide name={aName} win={o?.winner === 'a'} align="left" />
        <div className="px-1 text-center">
          {done ? (<><div className={`font-bold tabular-nums ${big ? 'text-2xl' : 'text-xl'}`}><span className={o.winner === 'a' ? 'text-emerald-600' : 'text-slate-400'}>{o.setsA}</span><span className="text-slate-300 mx-1">:</span><span className={o.winner === 'b' ? 'text-emerald-600' : 'text-slate-400'}>{o.setsB}</span></div><div className="text-[11px] text-slate-400 tracking-wide">{setsStr(res)}</div></>) : <Swords size={16} className="text-slate-300" />}
        </div>
        <TeamSide name={bName} win={o?.winner === 'b'} align="right" />
      </div>
      {done ? (
        <div className="flex items-center justify-center gap-3 text-sm"><span className="flex items-center gap-1 text-emerald-600"><Check size={14} /> 已记录 Saved</span><button onClick={onClear} className="text-slate-400 hover:text-blue-700">修改 Edit</button></div>
      ) : (
        <div className="space-y-1.5">
          {sets.map((s, i) => (
            <div key={i} className="flex items-center justify-center gap-2">
              <span className="w-16 text-right text-xs text-slate-400">第 {i + 1} 盘 · Set {i + 1}</span>
              <input value={s.a} onChange={(e) => setVal(i, 'a', e.target.value)} inputMode="numeric" placeholder="0" className="w-12 text-center border border-slate-300 rounded-lg py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-slate-300">:</span>
              <input value={s.b} onChange={(e) => setVal(i, 'b', e.target.value)} inputMode="numeric" placeholder="0" className="w-12 text-center border border-slate-300 rounded-lg py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {sets.length > 1 ? <button onClick={() => removeSet(i)} title="删除此盘" className="text-slate-300 hover:text-rose-500"><X size={14} /></button> : <span className="w-3.5" />}
            </div>
          ))}
          <div className="flex items-center justify-center gap-3 pt-1">
            {sets.length < 3 && <button onClick={addSet} className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-0.5"><Plus size={13} /> 加一盘 Add set</button>}
            <button onClick={commit} className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg">记录比分 · Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
function TeamSide({ name, win, align }) {
  return <div className={`flex-1 min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}><span className={`inline-block truncate max-w-full font-medium ${win ? 'text-blue-800' : 'text-slate-700'}`}>{win && <Crown size={13} className="inline mr-1 text-amber-400 -mt-0.5" />}{name}</span></div>;
}

function Th({ zh, en, left, pr }) {
  return <th className={`font-medium py-2 ${left ? 'text-left' : 'text-center'} ${pr ? 'pr-4' : ''} ${zh === '#' ? 'pl-4 text-left' : ''}`}><div>{zh}</div>{en && <div className="text-[9px] opacity-70 font-normal">{en}</div>}</th>;
}
function StandingsTable({ zh, en, standings, qualifyCount, accent }) {
  const bar = accent === 'orange' ? 'text-orange-600' : accent === 'sky' ? 'text-sky-600' : 'text-blue-700';
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-300/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2"><Medal size={17} className={bar} /><Bi zh={zh} en={en} className="font-semibold" /></div>
      <table className="w-full text-sm">
        <thead><tr className="text-slate-400 text-xs"><Th zh="#" en="" /><Th zh="队伍" en="Team" left /><Th zh="胜" en="W" /><Th zh="负" en="L" /><Th zh="局差" en="Diff" /><Th zh="积分" en="Pts" pr /></tr></thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.team} className={`border-t border-slate-50 ${i < qualifyCount ? 'bg-amber-50' : ''}`}>
              <td className="pl-4 py-2 text-slate-400">{i + 1}</td>
              <td className="py-2 font-medium text-slate-700 truncate max-w-[110px]">{s.team}</td>
              <td className="text-center py-2 text-emerald-600">{s.win}</td>
              <td className="text-center py-2 text-rose-500">{s.loss}</td>
              <td className="text-center py-2 tabular-nums text-slate-500">{s.gf - s.ga > 0 ? '+' : ''}{s.gf - s.ga}</td>
              <td className="text-center pr-4 py-2 font-bold text-blue-800">{s.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">前 {qualifyCount} 名（金色）出线 · Top {qualifyCount} advance</p>
    </div>
  );
}
function ByePanel({ standings }) {
  if (!standings.some((s) => s.byes > 0)) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-300/40 p-4">
      <div className="flex items-center gap-2 mb-2"><Coffee size={16} className="text-amber-600" /><Bi zh="轮空统计" en="Byes" className="font-semibold" /></div>
      <p className="text-xs text-slate-400 mb-3">每队轮空次数相差不超过 1 · Byes differ by ≤ 1.</p>
      <div className="flex flex-wrap gap-2">{standings.map((s) => <span key={s.team} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">{s.team} <b className="text-amber-600">{s.byes}</b></span>)}</div>
    </div>
  );
}
function Podium({ zh, en, team, color, icon }) {
  return <div className="bg-white border border-slate-200/70 shadow-sm shadow-slate-300/40 rounded-xl p-4 text-center"><div className="flex justify-center mb-1">{icon}</div><div className={`text-xs font-medium ${color}`}>{zh} <span className="opacity-60">{en}</span></div><div className="font-semibold text-slate-700 truncate mt-0.5">{team}</div></div>;
}

/* ============ 大屏 ============ */
function BigScreen({ title, mode, groups, bracket, results, amSchedule, amResults, amLeaderboard, onClose }) {
  const isAm = mode === 'americano';
  const [tab, setTab] = useState('fixtures');
  const [view, setView] = useState('all');
  const [gi, setGi] = useState(0);
  const [ri, setRi] = useState(0);
  const tabs = isAm ? [['fixtures', '对战赛程', 'Fixtures'], ['standings', '个人排名', 'Leaderboard']] : [['fixtures', '对战赛程', 'Fixtures'], ['standings', '积分榜', 'Standings'], ['bracket', '淘汰赛', 'Bracket']];
  const roundsCount = isAm ? amSchedule.length : (groups[gi]?.rounds.length || 0);
  const rIdx = Math.min(ri, Math.max(0, roundsCount - 1));

  const renderRound = (ri2, groupG) => {
    if (isAm) {
      const rd = amSchedule[ri2]; if (!rd) return null;
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {rd.courts.map((c, ci) => <BigCourt key={ci} court={c} res={amResults[`${ri2}-${ci}`]} label={`球场 ${ci + 1} · Court ${ci + 1}`} />)}
          {rd.byes.length > 0 && <div className="sm:col-span-2 text-amber-200 text-sm flex items-center gap-2 flex-wrap"><Coffee size={16} /> 轮空 Bye：{rd.byes.join('、')}</div>}
        </div>
      );
    }
    const g = groups.find((x) => x.g === groupG) || groups[0];
    const matches = g.rounds[ri2]; if (!matches) return null;
    return <div className="grid sm:grid-cols-2 gap-3">{matches.map((m, mi) => <BigMatch key={mi} m={m} res={m.bye ? null : results[key(g.g, ri2, mi)]} />)}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <div className="max-w-[1800px] mx-auto px-8 sm:px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-amber-400 text-blue-900 rounded-2xl p-3"><Trophy size={36} /></div>
            <div><div className="text-3xl sm:text-5xl font-black tracking-tight">{title}</div><div className="text-amber-300/80 text-sm tracking-[0.35em] uppercase mt-1">Live Scoreboard</div></div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 rounded-full p-3"><X size={28} /></button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(([k, zh, en]) => <button key={k} onClick={() => setTab(k)} className={`px-5 py-2.5 rounded-full text-base font-semibold ${tab === k ? 'bg-amber-400 text-blue-900' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{zh} <span className="text-xs font-normal opacity-70">{en}</span></button>)}
        </div>

        {tab === 'fixtures' && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div className="flex rounded-full overflow-hidden border border-white/15">
                <BigToggle active={view === 'all'} onClick={() => setView('all')}>全部轮次 · All</BigToggle>
                <BigToggle active={view === 'round'} onClick={() => setView('round')}>逐轮显示 · By Round</BigToggle>
              </div>
              {view === 'round' && !isAm && groups.length > 1 && (
                <div className="flex gap-1">
                  {groups.map((g, idx) => <button key={g.g} onClick={() => { setGi(idx); setRi(0); }} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${gi === idx ? 'bg-amber-400 text-blue-900' : 'bg-white/10 text-white/70'}`}>{g.name}</button>)}
                </div>
              )}
              {view === 'round' && (
                <div className="flex items-center gap-3 ml-auto">
                  <button onClick={() => setRi(Math.max(0, rIdx - 1))} disabled={rIdx === 0} className="bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full p-3"><ChevronLeft size={26} /></button>
                  <span className="text-xl sm:text-2xl font-bold tabular-nums w-56 text-center">第 {rIdx + 1} / {roundsCount} 轮 <span className="text-sm font-normal opacity-70">Round {rIdx + 1} / {roundsCount}</span></span>
                  <button onClick={() => setRi(Math.min(roundsCount - 1, rIdx + 1))} disabled={rIdx >= roundsCount - 1} className="bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full p-3"><ChevronRight size={26} /></button>
                </div>
              )}
            </div>

            {view === 'round' ? (
              <div>
                {!isAm && groups.length > 1 && <div className="text-amber-300 font-bold text-2xl sm:text-3xl mb-4">{groups[gi]?.name}</div>}
                {renderRound(rIdx, groups[gi]?.g)}
              </div>
            ) : (
              (isAm ? [{ g: 'am', name: '对战 · Fixtures', rounds: amSchedule }] : groups).map((grp) => (
                <div key={grp.g} className="mb-8">
                  {(!isAm && groups.length > 1) && <div className="text-amber-300 font-bold text-2xl sm:text-3xl mb-4">{grp.name}</div>}
                  {(isAm ? amSchedule : grp.rounds).map((_, ri2) => (
                    <div key={ri2} className="mb-5">
                      <div className="text-white/60 text-lg font-semibold mb-3 tracking-wide">第 {ri2 + 1} 轮 · Round {ri2 + 1}</div>
                      {renderRound(ri2, grp.g)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </>
        )}

        {tab === 'standings' && isAm && <BigLeaderboard leaderboard={amLeaderboard} />}
        {tab === 'standings' && !isAm && (
          <div className={`grid ${groups.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
            {groups.map((grp) => (
              <div key={grp.g}>
                <div className="text-amber-300 font-bold text-2xl sm:text-3xl mb-4">{groups.length > 1 ? grp.name : '积分榜 · Standings'}</div>
                <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                  <table className="w-full text-lg">
                    <thead><tr className="text-white/40 text-sm"><th className="text-left pl-5 py-4">#</th><th className="text-left py-4">队伍 Team</th><th className="text-center py-4">胜 W</th><th className="text-center py-4">负 L</th><th className="text-center pr-5 py-4">积分 Pts</th></tr></thead>
                    <tbody>{grp.standings.map((s, i) => (
                      <tr key={s.team} className={`border-t border-white/5 ${i < grp.qc ? 'bg-amber-400/10' : ''}`}>
                        <td className="pl-5 py-4 text-white/40">{i + 1}{i < grp.qc && <span className="ml-1 text-amber-300">●</span>}</td>
                        <td className="py-4 font-semibold text-2xl">{s.team}</td><td className="text-center py-4 text-emerald-300">{s.win}</td><td className="text-center py-4 text-rose-300">{s.loss}</td><td className="text-center pr-5 py-4 font-black text-amber-300 text-3xl">{s.pts}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'bracket' && !isAm && <BigBracket bracket={bracket} />}
      </div>
    </div>
  );
}
function BigToggle({ active, onClick, children }) { return <button onClick={onClick} className={`px-4 py-1.5 text-sm font-semibold ${active ? 'bg-amber-400 text-blue-900' : 'text-white/70 hover:bg-white/10'}`}>{children}</button>; }
function BigMatch({ m, res }) {
  if (m.bye) return <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl px-6 py-5 flex items-center gap-2 text-amber-200 text-xl"><Coffee size={22} /> {m.bye} 轮空 Bye</div>;
  const o = outcome(res);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <span className={`flex-1 truncate text-2xl sm:text-3xl ${o?.winner === 'a' ? 'text-amber-300 font-bold' : 'text-white'}`}>{m.a}</span>
        <div className="text-center px-2 shrink-0">{o ? <><div className="text-4xl sm:text-5xl font-black tabular-nums leading-none">{o.setsA}<span className="text-white/30 mx-2">:</span>{o.setsB}</div><div className="text-sm text-amber-300/70 mt-1">{setsStr(res)}</div></> : <div className="text-white/30 text-lg font-bold px-3">VS</div>}</div>
        <span className={`flex-1 truncate text-right text-2xl sm:text-3xl ${o?.winner === 'b' ? 'text-amber-300 font-bold' : 'text-white'}`}>{m.b}</span>
      </div>
    </div>
  );
}
function BigCourt({ court, res, label }) {
  const done = res?.done; const win1 = done && res.s1 > res.s2, win2 = done && res.s2 > res.s1;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
      <div className="text-sm text-white/40 mb-2">{label}</div>
      <div className="flex items-center justify-between gap-4">
        <span className={`flex-1 truncate text-xl sm:text-2xl ${win1 ? 'text-amber-300 font-bold' : 'text-white'}`}>{court.t1.join(' & ')}</span>
        <div className="text-center px-2 shrink-0">{done ? <div className="text-4xl sm:text-5xl font-black tabular-nums leading-none">{res.s1}<span className="text-white/30 mx-2">:</span>{res.s2}</div> : <div className="text-white/30 text-lg font-bold">VS</div>}</div>
        <span className={`flex-1 truncate text-right text-xl sm:text-2xl ${win2 ? 'text-amber-300 font-bold' : 'text-white'}`}>{court.t2.join(' & ')}</span>
      </div>
    </div>
  );
}
function BigLeaderboard({ leaderboard }) {
  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 max-w-4xl">
      <table className="w-full text-lg">
        <thead><tr className="text-white/40 text-sm"><th className="text-left pl-5 py-4">#</th><th className="text-left py-4">选手 Player</th><th className="text-center py-4">场 GP</th><th className="text-center py-4">胜 W</th><th className="text-center pr-5 py-4">总分 Pts</th></tr></thead>
        <tbody>{leaderboard.map((s, i) => (
          <tr key={s.name} className={`border-t border-white/5 ${i === 0 ? 'bg-amber-400/15' : i < 3 ? 'bg-amber-400/5' : ''}`}>
            <td className="pl-5 py-4 text-white/40">{i + 1}</td>
            <td className="py-4 font-semibold text-2xl">{i === 0 && <Crown size={20} className="inline mr-1.5 text-amber-300 -mt-1" />}{s.name}</td>
            <td className="text-center py-4 text-white/60">{s.played}</td><td className="text-center py-4 text-emerald-300">{s.win}</td>
            <td className="text-center pr-5 py-4 font-black text-amber-300 text-3xl">{s.points}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
function BigBracket({ bracket }) {
  if (bracket.kind === 'none') return <div className="text-white/40 text-xl">循环赛结束后生成淘汰赛对阵 · Bracket appears after round robin.</div>;
  const Row = ({ label, a, b, res, gold }) => {
    const o = outcome(res);
    return (
      <div className={`rounded-2xl px-6 py-5 border ${gold ? 'bg-amber-400/10 border-amber-400/30' : 'bg-white/5 border-white/10'}`}>
        <div className="text-sm text-white/50 mb-2">{label}</div>
        <div className="flex items-center justify-between gap-4">
          <span className={`flex-1 truncate text-2xl ${o?.winner === 'a' ? 'text-amber-300 font-bold' : 'text-white'}`}>{a || '待定 TBD'}</span>
          <span className="font-black text-3xl tabular-nums px-2">{o ? `${o.setsA}:${o.setsB}` : 'VS'}</span>
          <span className={`flex-1 truncate text-right text-2xl ${o?.winner === 'b' ? 'text-amber-300 font-bold' : 'text-white'}`}>{b || '待定 TBD'}</span>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-4 max-w-4xl">
      {bracket.kind === 'semis' && <><Row label="半决赛 A · Semifinal A" a={bracket.sf1.a} b={bracket.sf1.b} res={bracket.sf1.res} /><Row label="半决赛 B · Semifinal B" a={bracket.sf2.a} b={bracket.sf2.b} res={bracket.sf2.res} /><Row label="🏆 决赛 · Final" a={bracket.final.a} b={bracket.final.b} res={bracket.final.res} gold /><Row label="🥉 季军赛 · 3rd Place" a={bracket.third.a} b={bracket.third.b} res={bracket.third.res} /></>}
      {bracket.kind === 'final' && <Row label="🏆 决赛 · Final" a={bracket.final.a} b={bracket.final.b} res={bracket.final.res} gold />}
      {bracket.champion && <div className="text-center pt-6"><Crown size={48} className="mx-auto text-amber-400 mb-2" /><div className="text-amber-300 text-lg">冠军 · Champion</div><div className="text-5xl font-black text-amber-300">{bracket.champion}</div></div>}
    </div>
  );
}

/* ============ 导出 Excel ============ */
function exportToExcel(model) {
  const wb = XLSX.utils.book_new();
  if (model.mode === 'americano') {
    const { leaderboard, amRows } = model;
    const lb = [['排名 Rank', '选手 Player', '场次 GP', '胜 W', '总分 Pts']];
    leaderboard.forEach((s, i) => lb.push([i + 1, s.name, s.played, s.win, s.points]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lb), '个人排名 Leaderboard');
    const rr = [['轮次 Round', '场地 Court', '组合A Pair A', '组合B Pair B', '比分 Score']];
    amRows.forEach((r) => rr.push([r.round, r.court, r.t1, r.t2, r.score]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rr), '各轮对阵 Rounds');
    XLSX.writeFile(wb, `${(model.title || 'padel').replace(/[\\/:*?"<>|]/g, '')}.xlsx`);
    return;
  }
  const { title, groups, matches, bracket } = model;
  groups.forEach((grp) => {
    const aoa = [['排名 Rank', '队伍 Team', '胜 W', '负 L', '局差 Diff', '积分 Pts']];
    grp.rows.forEach((s, i) => aoa.push([i + 1, s.team, s.win, s.loss, s.gf - s.ga, s.pts]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), grp.name.slice(0, 31));
  });
  const mAoa = [['组 Group', '轮次 Round', '队伍A Team A', '队伍B Team B', '盘分 Score']];
  matches.forEach((m) => mAoa.push([m.group, m.round, m.a, m.b, m.score]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mAoa), '循环赛比分 Matches');
  const kAoa = [['阶段 Stage', '对阵A Side A', '盘分 Score', '对阵B Side B', '胜者 Winner']];
  const win = (r, a, b) => koWinner(r, a, b) || '';
  if (bracket.kind === 'semis') {
    kAoa.push(['半决赛A SF-A', bracket.sf1.a, setsStr(bracket.sf1.res), bracket.sf1.b, win(bracket.sf1.res, bracket.sf1.a, bracket.sf1.b)], ['半决赛B SF-B', bracket.sf2.a, setsStr(bracket.sf2.res), bracket.sf2.b, win(bracket.sf2.res, bracket.sf2.a, bracket.sf2.b)], ['决赛 Final', bracket.final.a || '待定', setsStr(bracket.final.res), bracket.final.b || '待定', bracket.champion || ''], ['季军赛 3rd', bracket.third.a || '待定', setsStr(bracket.third.res), bracket.third.b || '待定', bracket.thirdPlace || '']);
  } else if (bracket.kind === 'final') kAoa.push(['决赛 Final', bracket.final.a, setsStr(bracket.final.res), bracket.final.b, bracket.champion || '']);
  kAoa.push([], ['冠军 Champion', bracket.champion || '未决出'], ['亚军 Runner-up', bracket.runnerUp || ''], ['季军 3rd', bracket.thirdPlace || '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kAoa), '淘汰赛 Knockout');
  XLSX.writeFile(wb, `${(title || 'padel').replace(/[\\/:*?"<>|]/g, '')}.xlsx`);
}
