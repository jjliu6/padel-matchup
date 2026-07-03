import React, { createContext, useContext } from 'react';

/* ============================================================
 * Language configuration
 *
 * 'bilingual' — Chinese-first with English captions. Default & preferred.
 * 'en'        — English only.
 * 'es'        — Spanish only.
 * ============================================================ */
export const LANGS = [
  { code: 'bilingual', path: '/', label: '中文 / EN', short: '中/EN' },
  { code: 'en', path: '/en', label: 'English', short: 'EN' },
  { code: 'es', path: '/es', label: 'Español', short: 'ES' },
];

export const DEFAULT_LANG = 'bilingual';

const LangContext = createContext(DEFAULT_LANG);
export function LangProvider({ lang, children }) {
  return <LangContext.Provider value={lang || DEFAULT_LANG}>{children}</LangContext.Provider>;
}
export function useLang() {
  return useContext(LangContext);
}

/* ============================================================
 * Dictionary
 *
 * Each entry has zh / en / es. `bi` optionally overrides the combined
 * bilingual-mode string when a plain "zh + space + en" join would not
 * match the app's existing bilingual copy (e.g. custom separators).
 * `{token}` placeholders are replaced via vars.
 * ============================================================ */
const DICT = {
  /* ---------- defaults (data, not chrome) ---------- */
  'default.title': { zh: 'Padel 循环赛', en: 'Padel Round Robin', es: 'Torneo de Pádel' },
  'default.team': { zh: '队伍', en: 'Team', es: 'Equipo' },
  'default.player': { zh: '选手', en: 'Player', es: 'Jugador' },

  /* ---------- header / nav ---------- */
  'nav.bigScreen': { zh: '大屏', en: 'Screen', es: 'Pantalla' },
  'nav.bigScreenTooltip': { zh: '大屏', en: 'Big screen', es: 'Pantalla completa', bi: '大屏 / Big screen' },
  'nav.share': { zh: '分享', en: 'Share', es: 'Compartir' },
  'nav.shareTooltip': { zh: '分享', en: 'Share', es: 'Compartir', bi: '分享 / Share' },
  'nav.publishTooltip': { zh: '发布并生成分享链接', en: 'Publish & share', es: 'Publicar y compartir', bi: '发布并生成分享链接 / Publish & share' },
  'nav.export': { zh: '导出结果', en: 'Results', es: 'Resultados' },
  'nav.exportTooltip': { zh: '导出结果', en: 'Export results', es: 'Exportar resultados', bi: '导出结果 / Export results' },
  'nav.home': { zh: '首页', en: 'Home', es: 'Inicio' },
  'nav.homeTooltip': { zh: '返回设置页（保留数据）', en: 'Back to setup (keeps data)', es: 'Volver a la configuración (conserva los datos)', bi: '返回设置页（保留数据）/ Back to setup (keeps data)' },
  'nav.new': { zh: '新建', en: 'New', es: 'Nuevo' },
  'nav.newTooltip': { zh: '开始一场全新赛事（清空所有数据）', en: 'Start new tournament (clears all)', es: 'Iniciar un torneo nuevo (borra todo)', bi: '开始一场全新赛事（清空所有数据）/ Start new tournament (clears all)' },

  'readonly.banner': { zh: '只读观看模式 · 即时同步', en: 'Read-only view · live', es: 'Modo de solo lectura · en vivo', bi: '只读观看模式 · 即时同步 · Read-only view · live' },

  /* ---------- confirm dialogs ---------- */
  'confirm.regenTitle': { zh: '重新生成赛程？', en: 'Regenerate schedule?', es: '¿Regenerar el calendario?' },
  'confirm.regenBody': {
    zh: '已有比分记录，重新生成会清空现有比分。若只是想返回查看，请点"取消"后用"继续比赛"。',
    en: 'This will clear existing scores. To just look around, cancel and use "Resume".',
    es: 'Esto borrará los marcadores actuales. Si solo quieres echar un vistazo, cancela y usa "Reanudar".',
  },
  'confirm.newTitle': { zh: '开始一场全新赛事？', en: 'Start a new tournament?', es: '¿Iniciar un torneo nuevo?' },
  'confirm.newBody1': {
    zh: '会清空所有队伍、赛程和比分，并断开当前的分享链接。',
    en: 'Clears all teams, schedule and scores, and disconnects the current share link.',
    es: 'Borra todos los equipos, el calendario y los marcadores, y desconecta el enlace de compartir actual.',
  },
  'confirm.newBody2': {
    zh: '如果只是想临时看别的页面，请点「首页」而不是「新建」。',
    en: 'To just navigate around while keeping data, use "Home" instead.',
    es: 'Si solo quieres navegar sin perder los datos, usa "Inicio" en lugar de "Nuevo".',
  },
  'confirm.cancel': { zh: '取消', en: 'Cancel', es: 'Cancelar' },
  'confirm.confirm': { zh: '确定', en: 'Confirm', es: 'Confirmar' },
  'confirm.rosterChange': {
    zh: '⚠️ 修改队伍名单会清空当前赛程、比分和淘汰赛数据，需要重新点"开始 Start"生成新赛程。\n\n确定继续？',
    en: 'Changing the roster will clear the current schedule, scores and knockout data. You will need to click "Start" again to regenerate.\n\nContinue?',
    es: 'Modificar la lista de equipos borrará el calendario, los marcadores y los datos de la eliminatoria actuales. Deberás pulsar "Comenzar" de nuevo para generar un nuevo calendario.\n\n¿Deseas continuar?',
  },
  'alert.publishFailed': { zh: '发布失败', en: 'Publish failed', es: 'Error al publicar', bi: '发布失败 / Publish failed' },

  /* ---------- share modal ---------- */
  'share.title': { zh: '分享比赛', en: 'Share Tournament', es: 'Compartir torneo' },
  'share.subtitle': { zh: '实时同步 Live', en: 'Live sync', es: 'Sincronización en vivo', bi: 'Share this tournament · 实时同步 Live' },
  'share.qrCaption': { zh: '现场扫码看大屏', en: 'Scan to watch live', es: 'Escanea para ver en vivo', bi: '现场扫码看大屏 · Scan to watch live' },
  'share.qrDownload': { zh: '下载二维码', en: 'Download QR', es: 'Descargar código QR', bi: '下载二维码 Download QR' },
  'share.viewLinkLabel': { zh: '只读观看', en: 'View-only link', es: 'Enlace de solo lectura', bi: '只读观看 · View-only link' },
  'share.viewLinkDesc': {
    zh: '分享给观众/球员看积分和大屏。他们无法修改比分。',
    en: 'Share with spectators/players to view standings and the big screen. They cannot edit scores.',
    es: 'Compártelo con espectadores o jugadores para ver la clasificación y la pantalla grande. No podrán editar los marcadores.',
  },
  'share.editLinkLabel': { zh: '管理链接', en: 'Editor link', es: 'Enlace de editor', bi: '管理链接 · Editor link' },
  'share.editLinkWarning': {
    zh: '⚠ 谨慎分享：拿到此链接的人可以修改所有比分。',
    en: '⚠ Share carefully: anyone with this link can edit all scores.',
    es: '⚠ Comparte con cuidado: cualquiera con este enlace puede editar todos los marcadores.',
  },
  'share.copy': { zh: '复制', en: 'Copy', es: 'Copiar' },
  'share.copied': { zh: '已复制', en: 'Copied', es: 'Copiado' },
  'share.close': { zh: '关闭', en: 'Close', es: 'Cerrar', bi: '关闭 Close' },

  /* ---------- hero / setup ---------- */
  'hero.heading': { zh: '循环赛 · 淘汰赛 · 非固定搭档', en: 'Round Robin · Knockout · Americano', es: 'Liga · Eliminatoria · Americano' },
  'hero.sub': { zh: 'Round Robin · Knockout · Americano', en: 'Round Robin · Knockout · Americano', es: 'Round Robin · Eliminatoria · Americano', bi: 'Round Robin · Knockout · Americano' },
  'hero.body': {
    zh: '一站式生成赛程、记录比分、大屏直播、扫码分享。',
    en: 'Schedule · Score · Big screen · Share.',
    es: 'Genera el calendario, registra marcadores, muestra la pantalla grande y comparte con un código QR.',
  },
  'setup.resumeBanner': {
    zh: '比赛进行中 · 修改名单需重新生成（会清空比分）。',
    en: 'Tournament in progress — editing the roster requires regenerating.',
    es: 'Torneo en curso: editar la lista de equipos requiere regenerar el calendario.',
  },
  'setup.resume': { zh: '继续', en: 'Resume', es: 'Reanudar', bi: '继续 Resume' },
  'setup.tournamentName': { zh: '比赛名称', en: 'Tournament Name', es: 'Nombre del torneo' },
  'setup.format': { zh: '赛制模式', en: 'Format', es: 'Formato' },
  'setup.modeSingle': { zh: '单循环', en: 'Round Robin', es: 'Liga (Round Robin)' },
  'setup.modeSingleDesc': {
    zh: '固定搭档，一个大循环',
    en: 'Fixed pairs, one league',
    es: 'Parejas fijas, una sola liga',
    bi: '固定搭档，一个大循环 · Fixed pairs, one league',
  },
  'setup.modeDouble': { zh: '双小组', en: 'Two-Group Round Robin', es: 'Round Robin en dos grupos' },
  'setup.modeDoubleDesc': {
    zh: '分两组循环，交叉出线',
    en: 'Two groups, crossover',
    es: 'Dos grupos, cruce de semifinales',
    bi: '分两组循环，交叉出线 · Two groups, crossover',
  },
  'setup.modeAmericano': { zh: '非固定搭档 Americano', en: 'Americano', es: 'Americano' },
  'setup.modeAmericanoDesc': {
    zh: '每轮随机换搭档，累计个人得分',
    en: 'Rotating partners, individual points',
    es: 'Parejas rotativas, puntuación individual',
    bi: '每轮随机换搭档，累计个人得分 · Rotating partners',
  },
  'setup.advance': { zh: '每组出线数', en: 'Advance', es: 'Clasifican por grupo', bi: '每组出线数 Advance' },
  'setup.advanceN': { zh: '前 {n} 名', en: 'Top {n}', es: 'Top {n}' },
  'setup.advanceCrossover': { zh: '→ 交叉半决赛', en: '→ Crossover semis', es: '→ Semifinales cruzadas', bi: '→ 交叉半决赛 / Crossover semis' },
  'setup.advanceFinal': { zh: '→ 两冠军决赛', en: '→ Winners final', es: '→ Final entre ganadores', bi: '→ 两冠军决赛 / Winners final' },
  'setup.setsPerMatch': { zh: '默认盘数', en: 'Sets / Match', es: 'Sets por partido', bi: '默认盘数 Sets / Match' },
  'setup.setsOne': { zh: '一盘定胜负', en: '1 Set', es: '1 set' },
  'setup.setsThree': { zh: '三盘两胜', en: 'Best of 3', es: 'Al mejor de 3' },
  'setup.setsHint': {
    zh: '记分时仍可临时加减',
    en: 'adjustable per match',
    es: 'ajustable en cada partido',
    bi: '记分时仍可临时加减 · adjustable per match',
  },
  'setup.participantsTeams': { zh: '参赛队伍', en: 'Teams', es: 'Equipos', bi: '参赛队伍 / Teams' },
  'setup.participantsPlayers': { zh: '参赛选手', en: 'Players', es: 'Jugadores', bi: '参赛选手 / Players' },
  'setup.add': { zh: '添加', en: 'Add', es: 'Añadir', bi: '添加 Add' },
  'setup.groupAMin': { zh: '每组至少 2 队', en: 'Min 2 per group', es: 'Mínimo 2 por grupo', bi: '每组至少 2 队 / Min 2' },
  'setup.needFourPlayers': { zh: '至少 4 名选手', en: 'Need ≥ 4 players', es: 'Se necesitan al menos 4 jugadores', bi: '至少 4 名选手 / Need ≥ 4 players' },
  'setup.roundsPlayers': { zh: '比赛轮数', en: 'Rounds', es: 'Rondas' },
  'setup.roundsTeams': { zh: '循环轮次', en: 'Rounds', es: 'Rondas' },
  'setup.roundsHintAm': {
    zh: '建议 {min}–{max} 轮，超过后搭档会重复。',
    en: 'Recommended {min}–{max} rounds; beyond that, partners repeat.',
    es: 'Se recomiendan {min}–{max} rondas; más allá de eso, las parejas se repiten.',
  },
  'setup.roundsHintAmCaption': { zh: '', en: 'Beyond {max} rounds partners repeat.', es: '' },
  'setup.roundsHintDouble': {
    zh: '两组各自打满 {max} 轮为完整循环。',
    en: 'Full round robin = {max} rounds.',
    es: 'La liga completa son {max} rondas por grupo.',
  },
  'setup.roundsHintSingle': {
    zh: '打满 {max} 轮为完整循环。',
    en: 'Full round robin = {max} rounds.',
    es: 'La liga completa son {max} rondas.',
  },
  'setup.roundsOf': { zh: '轮 / of {max}', en: 'of {max}', es: 'de {max}' },
  'setup.roundsFull': { zh: '完整循环', en: 'Full', es: 'Completo', bi: '完整循环 / Full' },
  'setup.summaryAmericano': {
    zh: '非固定搭档 · {rounds} 轮 → 个人累计得分排名',
    en: 'Americano · {rounds} rounds → individual points ranking',
    es: 'Americano · {rounds} rondas → clasificación por puntos individuales',
  },
  'setup.summaryAmericanoCaption': { zh: '', en: 'Americano, ranked by points', es: '' },
  'setup.summaryDouble': {
    zh: 'A/B 两组 × {rounds} 轮 → 每组前 {adv} 名 → {next}',
    en: 'Groups A/B × {rounds} rounds → top {adv} per group → {next}',
    es: 'Grupos A/B × {rounds} rondas → top {adv} por grupo → {next}',
  },
  'setup.summaryDoubleCaption': { zh: '', en: 'Two groups → knockout', es: '' },
  'setup.summarySingle': {
    zh: '{rounds} 轮单循环 → 前 {n} 名 → {next}',
    en: '{rounds}-round round robin → top {n} → {next}',
    es: '{rounds} rondas de liga → top {n} → {next}',
  },
  'setup.summarySingleCaption': { zh: '', en: 'Round robin → knockout', es: '' },
  'setup.summaryCrossover': { zh: '交叉半决赛 → 决赛', en: 'Crossover semis → final', es: 'Semifinales cruzadas → final' },
  'setup.summaryTwoChampFinal': { zh: '两冠军决赛', en: 'Winners final', es: 'Final entre campeones de grupo' },
  'setup.summarySemiFinal': { zh: '半决赛 → 决赛', en: 'Semifinals → final', es: 'Semifinales → final' },
  'setup.summaryFinalOnly': { zh: '决赛', en: 'Final', es: 'Final' },
  'setup.start': { zh: '生成赛程，开始比赛', en: 'Generate & Start', es: 'Generar calendario y comenzar' },

  /* ---------- group / americano views ---------- */
  'group.progress': { zh: '循环赛进度', en: 'Progress', es: 'Progreso' },
  'americano.progress': { zh: '比赛进度', en: 'Progress', es: 'Progreso' },
  'group.groupButton': { zh: '{g} 组', en: 'Group {g}', es: 'Grupo {g}' },
  'group.roundTab': { zh: '第 {n} 轮', en: 'Round {n}', es: 'Ronda {n}' },
  'group.roundTabShort': { zh: 'R{n}', en: 'R{n}', es: 'R{n}', bi: 'R{n}' },
  'group.goKnockout': { zh: '进入淘汰赛', en: 'Go to Knockout', es: 'Ir a la eliminatoria' },
  'group.finishHint': {
    zh: '录完全部场次后进入淘汰赛',
    en: 'Finish all matches to continue',
    es: 'Completa todos los partidos para continuar',
    bi: '录完全部场次后进入淘汰赛 · Finish all matches to continue',
  },
  'group.standingsA': { zh: 'A 组积分榜', en: 'Group A', es: 'Grupo A' },
  'group.standingsB': { zh: 'B 组积分榜', en: 'Group B', es: 'Grupo B' },
  'group.standings': { zh: '积分榜', en: 'Standings', es: 'Clasificación' },
  'americano.court': { zh: '球场 {n}', en: 'Court {n}', es: 'Pista {n}' },
  'americano.byeLine': { zh: '本轮轮空 / Bye：', en: 'Bye:', es: 'Descanso:', bi: '本轮轮空 / Bye：' },
  'americano.leaderboard': { zh: '个人排名', en: 'Leaderboard', es: 'Clasificación individual' },
  'americano.champion': { zh: '总冠军', en: 'Champion', es: 'Campeón', bi: '🏆 总冠军 · Champion' },
  'americano.pts': { zh: '分', en: 'pts', es: 'pts', bi: '分 / pts' },

  /* ---------- score cards ---------- */
  'score.saved': { zh: '已记录', en: 'Saved', es: 'Guardado', bi: '已记录 Saved' },
  'score.edit': { zh: '修改', en: 'Edit', es: 'Editar', bi: '修改 Edit' },
  'score.save': { zh: '记录比分', en: 'Save', es: 'Guardar', bi: '记录比分 · Save', sep: ' · ' },
  'score.setN': { zh: '第 {n} 盘', en: 'Set {n}', es: 'Set {n}', bi: '第 {n} 盘 · Set {n}', sep: ' · ' },
  'score.addSet': { zh: '加一盘', en: 'Add set', es: 'Añadir set', bi: '加一盘 Add set' },
  'score.removeSetTooltip': { zh: '删除此盘', en: 'Remove this set', es: 'Quitar este set', bi: '删除此盘 / Remove set' },

  /* ---------- knockout ---------- */
  'knockout.notEnough': {
    zh: '出线队伍不足，无法组织淘汰赛。',
    en: 'Not enough qualifiers for knockout.',
    es: 'No hay suficientes clasificados para la eliminatoria.',
  },
  'knockout.back': { zh: '← 返回', en: '← Back', es: '← Volver', bi: '← 返回 Back' },
  'knockout.backToGroup': { zh: '← 返回循环赛', en: '← Back', es: '← Volver a la liga', bi: '← 返回循环赛 · Back' },
  'knockout.semis': { zh: '半决赛', en: 'Semifinals', es: 'Semifinales' },
  'knockout.semisSub': {
    zh: '胜者进决赛，负者争季军',
    en: 'Winners → final, losers → 3rd',
    es: 'Los ganadores van a la final; los perdedores juegan el 3er puesto',
    bi: '胜者进决赛，负者争季军 · Winners → final, losers → 3rd',
  },
  'knockout.finalAndThird': { zh: '决赛 & 季军赛', en: 'Final & 3rd Place', es: 'Final y 3er puesto' },
  'knockout.finalAndThirdSub': {
    zh: '由半决赛结果自动填入',
    en: 'Auto-filled from semis',
    es: 'Se completa automáticamente con el resultado de las semifinales',
    bi: '由半决赛结果自动填入 · Auto-filled from semis',
  },
  'knockout.semiA': { zh: '半决赛 A', en: 'Semifinal A', es: 'Semifinal A', bi: '半决赛 A · Semifinal A', sep: ' · ' },
  'knockout.semiB': { zh: '半决赛 B', en: 'Semifinal B', es: 'Semifinal B', bi: '半决赛 B · Semifinal B', sep: ' · ' },
  'knockout.final': { zh: '决赛', en: 'Final', es: 'Final', bi: '🏆 决赛 · Final' },
  'knockout.thirdPlace': { zh: '季军赛', en: '3rd Place', es: '3er puesto', bi: '🥉 季军赛 · 3rd Place' },
  'knockout.awaitingSemis': {
    zh: '等待半决赛结束',
    en: 'Awaiting semifinals',
    es: 'Esperando el resultado de las semifinales',
    bi: '等待半决赛结束 · Awaiting semifinals',
  },
  'knockout.grandFinal': { zh: '总决赛', en: 'Grand Final', es: 'Gran final' },
  'knockout.champion': { zh: '冠军', en: 'Champion', es: 'Campeón', bi: '🏆 冠军 · Champion' },
  'knockout.finalScore': { zh: '决赛盘分', en: 'Score', es: 'Marcador', bi: '决赛盘分 / Score' },
  'knockout.runnerUp': { zh: '亚军', en: 'Runner-up', es: 'Subcampeón' },
  'knockout.thirdPlaceShort': { zh: '季军', en: '3rd Place', es: '3er puesto' },
  'knockout.pending': { zh: '待定', en: 'TBD', es: 'Por definir' },

  /* ---------- common widgets ---------- */
  'common.bye': { zh: '本轮轮空', en: 'Bye', es: 'Descanso', bi: '本轮轮空 · Bye' },
  'common.byesTitle': { zh: '轮空统计', en: 'Byes', es: 'Descansos' },
  'common.byesNote': {
    zh: '每队轮空次数相差不超过 1',
    en: 'Byes differ by ≤ 1.',
    es: 'La diferencia de descansos entre equipos es ≤ 1.',
    bi: '每队轮空次数相差不超过 1 · Byes differ by ≤ 1.',
  },
  'common.qualifyNote': {
    zh: '前 {n} 名（金色）出线',
    en: 'Top {n} advance',
    es: 'Los primeros {n} (en dorado) clasifican',
    bi: '前 {n} 名（金色）出线 · Top {n} advance',
  },
  'th.rank': { zh: '#', en: '#', es: '#' },
  'th.team': { zh: '队伍', en: 'Team', es: 'Equipo' },
  'th.player': { zh: '选手', en: 'Player', es: 'Jugador' },
  'th.win': { zh: '胜', en: 'W', es: 'G' },
  'th.loss': { zh: '负', en: 'L', es: 'P' },
  'th.diff': { zh: '局差', en: 'Diff', es: 'Dif' },
  'th.pts': { zh: '积分', en: 'Pts', es: 'Pts' },
  'th.gp': { zh: '场', en: 'GP', es: 'PJ' },
  'th.ptsTotal': { zh: '总分', en: 'Pts', es: 'Pts' },

  /* ---------- big screen ---------- */
  'big.liveScoreboard': { zh: 'Live Scoreboard', en: 'Live Scoreboard', es: 'Marcador en Vivo', bi: 'Live Scoreboard' },
  'big.close': { zh: '关闭', en: 'Close', es: 'Cerrar' },
  'big.tabFixtures': { zh: '对战赛程', en: 'Fixtures', es: 'Partidos' },
  'big.tabLeaderboard': { zh: '个人排名', en: 'Leaderboard', es: 'Clasificación individual' },
  'big.tabStandings': { zh: '积分榜', en: 'Standings', es: 'Clasificación' },
  'big.tabBracket': { zh: '淘汰赛', en: 'Bracket', es: 'Eliminatoria' },
  'big.viewAll': { zh: '全部轮次', en: 'All', es: 'Todas', bi: '全部轮次 · All' },
  'big.viewByRound': { zh: '逐轮显示', en: 'By Round', es: 'Por ronda', bi: '逐轮显示 · By Round' },
  'big.roundOf': { zh: '第 {n} / {total} 轮', en: 'Round {n} / {total}', es: 'Ronda {n} / {total}' },
  'big.byeLine': { zh: '轮空 Bye：{names}', en: 'Bye: {names}', es: 'Descanso: {names}', bi: '轮空 Bye：{names}' },
  'big.roundHeader': { zh: '第 {n} 轮', en: 'Round {n}', es: 'Ronda {n}', bi: '第 {n} 轮 · Round {n}' },
  'big.standingsSingle': { zh: '积分榜', en: 'Standings', es: 'Clasificación', bi: '积分榜 · Standings' },
  'big.court': { zh: '球场 {n}', en: 'Court {n}', es: 'Pista {n}', bi: '球场 {n} · Court {n}' },
  'big.byeShort': { zh: '轮空', en: 'Bye', es: 'Descansa', bi: '轮空 Bye' },
  'big.noBracket': {
    zh: '循环赛结束后生成淘汰赛对阵',
    en: 'Bracket appears after round robin.',
    es: 'El cuadro de eliminatoria aparece al terminar la liga.',
    bi: '循环赛结束后生成淘汰赛对阵 · Bracket appears after round robin.',
  },
  'big.tbd': { zh: '待定', en: 'TBD', es: 'Por definir', bi: '待定 TBD' },
  'big.champion': { zh: '冠军', en: 'Champion', es: 'Campeón', bi: '冠军 · Champion' },
  'big.fixturesAm': { zh: '对战', en: 'Fixtures', es: 'Partidos', bi: '对战 · Fixtures' },

  /* ---------- bracket seed labels ---------- */
  'seed.groupRank': { zh: '{group}组 #{rank}', en: 'Group {group} #{rank}', es: 'Grupo {group} #{rank}' },
  'seed.rank': { zh: '#{rank}', en: '#{rank}', es: '#{rank}', bi: '#{rank}' },
  'label.groupA': { zh: 'A组', en: 'Group A', es: 'Grupo A' },
  'label.groupB': { zh: 'B组', en: 'Group B', es: 'Grupo B' },
  'label.roundRobin': { zh: '循环赛', en: 'Round Robin', es: 'Liga' },

  /* ---------- export ---------- */
  'export.rank': { zh: '排名', en: 'Rank', es: 'Puesto' },
  'export.player': { zh: '选手', en: 'Player', es: 'Jugador' },
  'export.gp': { zh: '场次', en: 'GP', es: 'PJ' },
  'export.win': { zh: '胜', en: 'W', es: 'G' },
  'export.pts': { zh: '总分', en: 'Pts', es: 'Pts' },
  'export.sheetLeaderboard': { zh: '个人排名', en: 'Leaderboard', es: 'Clasificación' },
  'export.round': { zh: '轮次', en: 'Round', es: 'Ronda' },
  'export.court': { zh: '场地', en: 'Court', es: 'Pista' },
  'export.pairA': { zh: '组合A', en: 'Pair A', es: 'Pareja A' },
  'export.pairB': { zh: '组合B', en: 'Pair B', es: 'Pareja B' },
  'export.score': { zh: '比分', en: 'Score', es: 'Marcador' },
  'export.sheetRounds': { zh: '各轮对阵', en: 'Rounds', es: 'Rondas' },
  'export.byeLabel': { zh: '（轮空）', en: '(Bye)', es: '(Descanso)' },
  'export.team': { zh: '队伍', en: 'Team', es: 'Equipo' },
  'export.loss': { zh: '负', en: 'L', es: 'P' },
  'export.diff': { zh: '局差', en: 'Diff', es: 'Dif' },
  'export.group': { zh: '组', en: 'Group', es: 'Grupo' },
  'export.teamA': { zh: '队伍A', en: 'Team A', es: 'Equipo A' },
  'export.teamB': { zh: '队伍B', en: 'Team B', es: 'Equipo B' },
  'export.setScore': { zh: '盘分', en: 'Score', es: 'Marcador' },
  'export.sheetMatches': { zh: '循环赛比分', en: 'Matches', es: 'Partidos' },
  'export.stage': { zh: '阶段', en: 'Stage', es: 'Fase' },
  'export.sideA': { zh: '对阵A', en: 'Side A', es: 'Lado A' },
  'export.sideB': { zh: '对阵B', en: 'Side B', es: 'Lado B' },
  'export.winner': { zh: '胜者', en: 'Winner', es: 'Ganador' },
  'export.semiA': { zh: '半决赛A', en: 'SF-A', es: 'SF-A' },
  'export.semiB': { zh: '半决赛B', en: 'SF-B', es: 'SF-B' },
  'export.final': { zh: '决赛', en: 'Final', es: 'Final' },
  'export.third': { zh: '季军赛', en: '3rd', es: '3er puesto' },
  'export.tbd': { zh: '待定', en: 'TBD', es: 'Por definir' },
  'export.champion': { zh: '冠军', en: 'Champion', es: 'Campeón' },
  'export.undecided': { zh: '未决出', en: 'Undecided', es: 'Sin decidir' },
  'export.runnerUp': { zh: '亚军', en: 'Runner-up', es: 'Subcampeón' },
  'export.thirdShort': { zh: '季军', en: '3rd', es: '3er puesto' },
  'export.sheetKnockout': { zh: '淘汰赛', en: 'Knockout', es: 'Eliminatoria' },
};

/* ============================================================
 * Interpolation + accessors
 * ============================================================ */
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), str);
}

export function useT() {
  const lang = useLang();

  const raw = (key) => {
    const entry = DICT[key];
    if (!entry) return { zh: key, en: key, es: key };
    return entry;
  };

  // Combined chrome label — a single string appropriate for the active mode.
  const t = (key, vars) => {
    const entry = raw(key);
    let s;
    if (lang === 'en') s = entry.en;
    else if (lang === 'es') s = entry.es;
    else s = entry.bi ?? `${entry.zh}${entry.sep ?? ' '}${entry.en}`;
    return interpolate(s, vars);
  };

  // Stacked/inline label — { primary, secondary }. secondary is null outside bilingual mode.
  const bi = (key, vars) => {
    const entry = raw(key);
    const primary = interpolate(lang === 'en' ? entry.en : lang === 'es' ? entry.es : entry.zh, vars);
    const secondary = lang === 'bilingual' ? interpolate(entry.en, vars) : null;
    return { primary, secondary };
  };

  // Single active-language plain value (bilingual falls back to zh) — for default data.
  const d = (key, vars) => bi(key, vars).primary;

  return { lang, t, bi, d };
}

// One-off literal variants for paragraph-level JSX blocks that aren't worth
// centralizing in the dictionary (kept verbatim per language, bilingual
// reproduces the app's original mixed-language copy exactly).
export function pick(lang, variants) {
  if (lang === 'en' && variants.en !== undefined) return variants.en;
  if (lang === 'es' && variants.es !== undefined) return variants.es;
  return variants.bilingual;
}
