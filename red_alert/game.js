const canvas = document.querySelector('#battlefield');
const context = canvas.getContext('2d');
const $ = (selector) => document.querySelector(selector);

const GRID = { cols: 26, rows: 20, tileW: 52, tileH: 26, zHeight: 18 };
const FACTIONS = [
  { name: '赤焰', color: '#e8554e', dark: '#7f2e35' }, { name: '黄沙', color: '#e2b45d', dark: '#8f6934' },
  { name: '紫电', color: '#b77bd4', dark: '#633c82' }, { name: '苍狼', color: '#6aaed1', dark: '#345d85' },
  { name: '墨影', color: '#9aa6af', dark: '#4e5a63' }, { name: '毒沼', color: '#72bc83', dark: '#3d7758' },
  { name: '白刃', color: '#d9e2e2', dark: '#78888d' },
];
const BUILDING_NAMES = { turret: '山巅哨戒炮', barracks: '增援兵营', power: '电力核心' };
const BUILD_COSTS = { turret: 720, barracks: 560, power: 480 };

const state = {
  started: false, paused: false, elapsed: 0, status: 'active', credits: 4800, ore: 1680, power: 82, maxPower: 100,
  selected: [], wave: 0, spawnTimer: 4, defeated: 0, enemyTotal: 0, camera: { x: 0, y: 34, zoom: 1 },
  units: [], buildings: [], enemies: [], effects: [], events: [], lastHud: '', soundOff: false,
};

const levelAt = (x, y) => {
  const distance = Math.max(Math.abs(x - 12.5), Math.abs(y - 9.5));
  if (distance <= 3.25) return 4;
  if (distance <= 4.5) return 3;
  if (distance <= 5.7) return 2;
  if (distance <= 7.2) return 1;
  return 0;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const formatCredits = (value) => Math.max(0, Math.floor(value)).toLocaleString('en-US');
const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function addEvent(text, kind = 'normal') {
  state.events.unshift({ text, kind, time: clock(state.elapsed) });
  state.events = state.events.slice(0, 6);
}
function toast(message) {
  const node = $('#toast'); node.textContent = message; node.classList.add('visible'); clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 2400);
}
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect(); const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * ratio)); canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function screenSize() { const rect = canvas.getBoundingClientRect(); return { width: rect.width, height: rect.height }; }
function iso(x, y, z = 0) {
  const { width, height } = screenSize(); const scale = state.camera.zoom;
  return { x: width / 2 + (x - y) * GRID.tileW / 2 * scale + state.camera.x, y: height / 2 + (x + y) * GRID.tileH / 2 * scale - z * GRID.zHeight * scale + state.camera.y };
}
function tilePoint(point) {
  const { width, height } = screenSize(); const scale = state.camera.zoom; const sx = (point.x - width / 2 - state.camera.x) / scale; const sy = (point.y - height / 2 - state.camera.y) / scale;
  return { x: clamp(Math.round(sx / GRID.tileW + sy / GRID.tileH), 0, GRID.cols - 1), y: clamp(Math.round(sy / GRID.tileH - sx / GRID.tileW), 0, GRID.rows - 1) };
}
function poly(points, fill, stroke) { context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.closePath(); if (fill) { context.fillStyle = fill; context.fill(); } if (stroke) { context.strokeStyle = stroke; context.stroke(); } }
function topTile(x, y, z) { return [iso(x, y, z), iso(x + 1, y, z), iso(x + 1, y + 1, z), iso(x, y + 1, z)]; }
function seeded(x, y) { return Math.abs(Math.sin(x * 91.17 + y * 31.51) * 43758.5) % 1; }

function drawMap() {
  const { width, height } = screenSize(); const gradient = context.createLinearGradient(0, 0, width, height); gradient.addColorStop(0, '#152a2a'); gradient.addColorStop(1, '#07141d'); context.fillStyle = gradient; context.fillRect(0, 0, width, height);
  const tiles = []; for (let y = 0; y < GRID.rows; y += 1) for (let x = 0; x < GRID.cols; x += 1) tiles.push({ x, y, z: levelAt(x, y) });
  tiles.sort((a, b) => a.x + a.y - b.x - b.y);
  tiles.forEach((tile) => {
    const z = tile.z; const points = topTile(tile.x, tile.y, z); const seed = seeded(tile.x, tile.y); const isPeak = z >= 3;
    poly(points, isPeak ? (seed > .5 ? '#6d5a45' : '#785e44') : (seed > .5 ? '#28523c' : '#224833'), '#19362f');
    if (z > levelAt(tile.x - 1, tile.y)) poly([points[0], points[3], iso(tile.x, tile.y + 1, levelAt(tile.x - 1, tile.y)), iso(tile.x, tile.y, levelAt(tile.x - 1, tile.y))], '#3d3f39', '#584b3d');
    if (z > levelAt(tile.x, tile.y - 1)) poly([points[0], points[1], iso(tile.x + 1, tile.y, levelAt(tile.x, tile.y - 1)), iso(tile.x, tile.y, levelAt(tile.x, tile.y - 1))], '#49483f', '#5f4f3d');
    if (z === 0 && seed > .82) { const p = iso(tile.x + .48, tile.y + .48, .1); context.fillStyle = '#6d9363'; context.fillRect(p.x - 2, p.y - 6, 3, 8); context.fillRect(p.x + 2, p.y - 4, 3, 6); }
    if (z >= 3 && seed > .62) { const p = iso(tile.x + .5, tile.y + .5, z + .02); context.fillStyle = '#b59765'; context.fillRect(p.x - 5, p.y - 2, 9, 3); }
  });
  context.strokeStyle = '#d3aa6170'; context.lineWidth = 2; context.setLineDash([6, 6]); poly([iso(8.6, 5.1, 4.08), iso(16.7, 5.1, 4.08), iso(16.7, 13.9, 4.08), iso(8.6, 13.9, 4.08)], null, '#d3aa6170'); context.setLineDash([]);
  const summit = iso(10.2, 5.6, 4.2); context.fillStyle = '#d6bf86'; context.font = '600 11px Barlow Condensed'; context.fillText('SUMMIT COMMAND', summit.x - 41, summit.y - 9);
}
function drawBuilding(building) {
  const p = iso(building.x, building.y, building.z); const scale = state.camera.zoom; const w = (building.kind === 'command' ? 2.1 : 1.5) * GRID.tileW * scale; const h = (building.kind === 'command' ? 1.25 : 1.05) * GRID.tileH * scale;
  context.save(); context.translate(p.x, p.y); context.shadowColor = '#000b'; context.shadowBlur = 13; context.shadowOffsetY = 9; poly([{ x: -w / 2, y: 0 }, { x: 0, y: -h / 2 }, { x: w / 2, y: 0 }, { x: 0, y: h / 2 }], building.kind === 'command' ? '#63333a' : '#274653', building.kind === 'command' ? '#ef8266' : '#6daeb0'); context.shadowBlur = 0;
  context.fillStyle = building.kind === 'command' ? '#dd594b' : building.kind === 'turret' ? '#d2a35c' : '#6daeb0'; context.fillRect(-w * .22, -h * .58, w * .44, h * .22); context.fillStyle = '#162b33'; context.fillRect(-w * .28, -h * .26, w * .56, h * .28); context.fillStyle = '#f1cf79'; context.fillRect(-3 * scale, -h * .3, 6 * scale, 3 * scale); context.restore(); drawHealth(building, p, w * .65);
}
function drawUnit(unit) {
  const p = iso(unit.x, unit.y, unit.z + .1); const scale = state.camera.zoom * (unit.kind === 'tank' ? 1.15 : 1); const faction = unit.faction ? FACTIONS[unit.faction] : { color: '#60b6d1', dark: '#2e6377' }; const selected = state.selected.includes(unit.id);
  context.save(); context.translate(p.x, p.y); if (selected) { context.strokeStyle = '#f4c269'; context.lineWidth = 2; context.beginPath(); context.ellipse(0, 0, 16 * scale, 8 * scale, 0, 0, Math.PI * 2); context.stroke(); }
  poly([{ x: -12 * scale, y: 2 * scale }, { x: 0, y: -8 * scale }, { x: 13 * scale, y: 2 * scale }, { x: 0, y: 8 * scale }], faction.color, '#e0ebd7'); context.fillStyle = faction.dark; context.fillRect(-6 * scale, -1 * scale, 12 * scale, 4 * scale); context.fillStyle = '#f7d37d'; context.fillRect(-2 * scale, -5 * scale, 4 * scale, 3 * scale); context.restore(); drawHealth(unit, p, 26 * scale);
}
function drawEnemy(enemy) {
  const p = iso(enemy.x, enemy.y, enemy.z + .1); const faction = FACTIONS[enemy.faction]; const scale = state.camera.zoom * (enemy.kind === 'brute' ? 1.25 : 1); context.save(); context.translate(p.x, p.y); context.rotate(Math.PI / 4); context.fillStyle = faction.color; context.strokeStyle = '#ffb17e'; context.lineWidth = 1; context.fillRect(-8 * scale, -8 * scale, 16 * scale, 16 * scale); context.strokeRect(-8 * scale, -8 * scale, 16 * scale, 16 * scale); context.restore(); drawHealth(enemy, p, 22 * scale); }
function drawHealth(entity, point, width) { const ratio = clamp(entity.hp / entity.maxHp, 0, 1); context.fillStyle = '#071016c9'; context.fillRect(point.x - width / 2, point.y - 20 * state.camera.zoom, width, 3); context.fillStyle = ratio > .55 ? '#67c296' : ratio > .25 ? '#f0b65c' : '#e64b43'; context.fillRect(point.x - width / 2, point.y - 20 * state.camera.zoom, width * ratio, 3); }
function drawEffects() { state.effects.forEach((effect) => { const p = iso(effect.x, effect.y, effect.z); const life = effect.life / effect.maxLife; context.strokeStyle = `${effect.color}${Math.floor(life * 220).toString(16).padStart(2, '0')}`; context.lineWidth = 3; context.beginPath(); context.arc(p.x, p.y, (1 - life) * 25 + 3, 0, Math.PI * 2); context.stroke(); }); }
function draw() { const { width, height } = screenSize(); context.clearRect(0, 0, width, height); drawMap(); [...state.buildings, ...state.units, ...state.enemies].sort((a, b) => a.x + a.y - b.x - b.y).forEach((entity) => entity.kind === 'command' || entity.kind === 'turret' || entity.kind === 'barracks' || entity.kind === 'power' ? drawBuilding(entity) : entity.faction !== undefined ? drawEnemy(entity) : drawUnit(entity)); drawEffects(); }

function spawnFriendly(kind = 'ranger', x = 11.5, y = 9.4) { const spec = kind === 'tank' ? { hp: 220, damage: 44, range: 5.2, speed: 2.8 } : { hp: 100, damage: 22, range: 4.5, speed: 5.2 }; state.units.push({ id: `friendly-${Date.now()}-${Math.random()}`, kind, label: kind === 'tank' ? '山巅重装坦克' : `山巅守卫 · ${String(state.units.length + 1).padStart(2, '0')}`, x, y, z: levelAt(x, y), hp: spec.hp, maxHp: spec.hp, damage: spec.damage, range: spec.range, speed: spec.speed, cooldown: 0, order: null, target: null }); }
function spawnWave() { state.wave += 1; const count = 7 + state.wave * 2; state.enemyTotal += count; for (let faction = 0; faction < 7; faction += 1) { for (let i = 0; i < Math.ceil(count / 7); i += 1) { const edge = faction % 4; const x = edge === 0 ? 0 : edge === 1 ? 25 : 3 + (faction * 3) % 19; const y = edge === 2 ? 0 : edge === 3 ? 19 : 2 + (faction * 5) % 16; state.enemies.push({ id: `enemy-${Date.now()}-${faction}-${i}`, kind: (i + faction) % 5 === 0 ? 'brute' : 'raider', faction, x, y, z: levelAt(x, y), hp: (i + faction) % 5 === 0 ? 280 + state.wave * 22 : 96 + state.wave * 12, maxHp: (i + faction) % 5 === 0 ? 280 + state.wave * 22 : 96 + state.wave * 12, damage: (i + faction) % 5 === 0 ? 38 : 16, speed: (i + faction) % 5 === 0 ? 1.15 : 1.8, cooldown: Math.random() }); } } state.spawnTimer = 15; addEvent(`第 ${state.wave} 波 · 七方军团同时压山`, 'danger'); toast(`七方军团来袭 · WAVE ${state.wave}`); }
function nearestEnemy(entity, range = 999) { return state.enemies.filter((enemy) => enemy.hp > 0 && distance(entity, enemy) <= range).sort((a, b) => distance(entity, a) - distance(entity, b))[0]; }
function attack(attacker, target, delta, color) { if (attacker.cooldown > 0 || distance(attacker, target) > attacker.range) return; target.hp -= attacker.damage * delta; attacker.cooldown = .6; state.effects.push({ x: target.x, y: target.y, z: target.z, color, life: .25, maxLife: .25 }); }
function move(entity, destination, delta) { if (!destination) return; const d = distance(entity, destination); if (d < .15) { entity.order = null; return; } const step = entity.speed * delta; entity.x += (destination.x - entity.x) / d * Math.min(step, d); entity.y += (destination.y - entity.y) / d * Math.min(step, d); entity.x = clamp(entity.x, 0, GRID.cols - .1); entity.y = clamp(entity.y, 0, GRID.rows - .1); entity.z = levelAt(entity.x, entity.y); }
function update(delta) {
  if (!state.started || state.paused || state.status !== 'active') return; state.elapsed += delta; state.spawnTimer -= delta;
  const miners = state.buildings.filter((building) => building.kind === 'harvester').length; state.credits += (18 + miners * 10) / 60 * delta; state.ore += (5 + miners * 4) / 60 * delta;
  if (state.spawnTimer <= 0 && state.wave < 7) spawnWave();
  state.units.forEach((unit) => { if (unit.hp <= 0) return; unit.cooldown = Math.max(0, unit.cooldown - delta); const target = nearestEnemy(unit, unit.range + 1); if (target) attack(unit, target, delta, '#61b4d0'); else move(unit, unit.order, delta); });
  state.buildings.filter((building) => building.kind === 'turret').forEach((turret) => { turret.cooldown = Math.max(0, turret.cooldown - delta); const target = nearestEnemy(turret, 8); if (target) attack({ ...turret, range: 8, damage: 34, cooldown: turret.cooldown }, target, delta, '#f0b65c'); if (target && turret.cooldown <= 0) turret.cooldown = .72; });
  const command = state.buildings.find((building) => building.kind === 'command'); state.enemies.forEach((enemy) => { if (enemy.hp <= 0) return; enemy.cooldown = Math.max(0, enemy.cooldown - delta); const target = state.units.filter((unit) => unit.hp > 0).sort((a, b) => distance(enemy, a) - distance(enemy, b))[0] || command; if (target && distance(enemy, target) <= 1.5) { if (enemy.cooldown <= 0) { target.hp -= enemy.damage; enemy.cooldown = 1.1; state.effects.push({ x: target.x, y: target.y, z: target.z, color: '#e64b43', life: .3, maxLife: .3 }); } } else if (target) move(enemy, target, delta); });
  const defeated = state.enemies.filter((enemy) => enemy.hp <= 0); if (defeated.length) { state.defeated += defeated.length; state.credits += defeated.length * 32; } state.enemies = state.enemies.filter((enemy) => enemy.hp > 0); state.effects.forEach((effect) => { effect.life -= delta; }); state.effects = state.effects.filter((effect) => effect.life > 0);
  if (!command || command.hp <= 0) { state.status = 'lost'; addEvent('山巅指挥中心被摧毁，防线失守。', 'danger'); toast('最高处失守'); } if (state.wave >= 7 && state.enemies.length === 0 && state.elapsed > 75) { state.status = 'won'; addEvent('七方军团全部击退，山巅仍在我方手中。'); toast('任务完成 · 守住最高处'); }
  updateHud();
}

function build(kind) { const cost = BUILD_COSTS[kind]; if (state.credits < cost) return toast('资金不足，无法建造'); state.credits -= cost; const count = state.buildings.filter((building) => building.kind === kind).length; const slots = [{ x: 10, y: 8 }, { x: 16, y: 8 }, { x: 10, y: 12 }, { x: 16, y: 12 }, { x: 12, y: 6 }, { x: 14, y: 13 }]; const slot = slots[count % slots.length]; const z = levelAt(slot.x, slot.y); state.buildings.push({ id: `${kind}-${Date.now()}`, kind, name: BUILDING_NAMES[kind], x: slot.x, y: slot.y, z, hp: kind === 'turret' ? 620 : 420, maxHp: kind === 'turret' ? 620 : 420, cooldown: 0 }); addEvent(`${BUILDING_NAMES[kind]}部署在山巅 ${String.fromCharCode(65 + slot.x)}-${slot.y + 1}`); toast(`${BUILDING_NAMES[kind]}已部署`); }
function deploy() { if (state.credits < 300 || state.ore < 50) return toast('资源不足，无法召集援军'); state.credits -= 300; state.ore -= 50; spawnFriendly('ranger', 12 + Math.random() * 1.5, 9 + Math.random() * 1.5); spawnFriendly('ranger', 12 + Math.random() * 1.5, 9 + Math.random() * 1.5); addEvent('山脚增援抵达，守卫编入防线。'); toast('增援小队已抵达'); }
function repair() { const command = state.buildings.find((building) => building.kind === 'command'); if (!command || command.hp >= command.maxHp) return toast('指挥中心状态良好'); if (state.credits < 180) return toast('资金不足，无法维修'); state.credits -= 180; command.hp = Math.min(command.maxHp, command.hp + 220); toast('工程组完成紧急维修'); addEvent('工程组修复山巅指挥中心。'); }
function updateHud() { const signature = `${state.credits.toFixed(0)}|${state.ore.toFixed(0)}|${state.power}|${state.wave}|${state.defeated}|${state.selected.join(',')}|${state.status}|${state.elapsed.toFixed(0)}|${state.units.length}`; if (signature === state.lastHud) return; state.lastHud = signature; $('#credits').textContent = formatCredits(state.credits); $('#ore').textContent = formatCredits(state.ore); $('#power').textContent = `${state.power} / ${state.maxPower}`; $('#unitCount').textContent = `${state.units.length} UNITS`; $('#buildCount').textContent = `${state.buildings.length} SLOTS`; $('#creditRate').textContent = `+${12 + state.buildings.filter((item) => item.kind === 'harvester').length * 8} / min`; $('#oreRate').textContent = `+${4 + state.buildings.filter((item) => item.kind === 'harvester').length * 3} / min`; $('#waveLabel').textContent = `WAVE ${Math.min(state.wave, 7)} / 7`; $('#waveProgress').style.width = `${clamp(state.wave / 7 * 100, 0, 100)}%`; $('#objectiveState').textContent = state.status === 'won' ? 'SECURED' : state.status === 'lost' ? 'FAILED' : state.enemies.length ? 'ENGAGED' : 'WAITING'; $('#missionStatus').textContent = state.status === 'won' ? '任务完成 · 山巅守住了' : state.status === 'lost' ? '防线失守 · 山巅沦陷' : state.paused ? '行动暂停 · 1V7 山巅防守' : '行动中 · 1V7 山巅防守'; $('#gameClock').textContent = clock(state.elapsed); const morale = clamp(82 - state.enemies.length * 1.2 + state.defeated * .4, 12, 100); $('#moraleMeter').style.width = `${morale}%`; $('#moraleValue').textContent = `${Math.round(morale)}%`; $('#selectionLabel').textContent = state.selected.length ? `${state.selected.length} 支山巅部队已选中 · 右键下达命令` : '未选择单位'; $('#eventLog').innerHTML = state.events.map((entry) => `<div class="log-entry ${entry.kind}"><i></i><div>${entry.text}<time>${entry.time}</time></div></div>`).join(''); $('#unitList').innerHTML = state.units.filter((unit) => unit.hp > 0).slice(-8).map((unit) => `<div class="unit-row ${state.selected.includes(unit.id) ? 'selected' : ''}" data-unit="${unit.id}"><span class="unit-icon">${unit.kind === 'tank' ? '▰' : '△'}</span><div><h3>${unit.label}</h3><p>${unit.order ? '移动中' : '自动防守'}</p></div><span class="health-line"><i style="width:${clamp(unit.hp / unit.maxHp * 100, 0, 100)}%"></i></span></div>`).join(''); document.querySelectorAll('[data-unit]').forEach((node) => node.onclick = () => { state.selected = [node.dataset.unit]; updateHud(); }); }

function selectAt(point) { const candidates = state.units.filter((unit) => unit.hp > 0).sort((a, b) => distance(a, point) - distance(b, point)); const unit = candidates.find((item) => distance(item, point) < 1.5); state.selected = unit ? [unit.id] : []; updateHud(); }
canvas.addEventListener('click', (event) => { if (!state.started || state.paused) return; selectAt(tilePoint({ x: event.offsetX, y: event.offsetY })); });
canvas.addEventListener('contextmenu', (event) => { event.preventDefault(); if (!state.started || state.paused) return; const target = tilePoint({ x: event.offsetX, y: event.offsetY }); state.selected.map((id) => state.units.find((unit) => unit.id === id)).filter(Boolean).forEach((unit, index) => { unit.order = { x: target.x + (index % 2) * .8, y: target.y + Math.floor(index / 2) * .8 }; }); if (state.selected.length) toast('山巅守卫正在转移'); });
canvas.addEventListener('wheel', (event) => { event.preventDefault(); state.camera.zoom = clamp(state.camera.zoom - event.deltaY * .0008, .72, 1.35); }, { passive: false });
document.querySelectorAll('[data-build]').forEach((button) => button.addEventListener('click', () => build(button.dataset.build))); $('#deployButton').addEventListener('click', deploy); $('#repairButton').addEventListener('click', repair);
function togglePause() { if (!state.started || state.status !== 'active') return; state.paused = !state.paused; $('#pauseOverlay').classList.toggle('hidden', !state.paused); updateHud(); }
$('#pauseButton').addEventListener('click', togglePause); $('#soundToggle').addEventListener('click', (event) => { state.soundOff = !state.soundOff; event.currentTarget.textContent = state.soundOff ? '◑' : '◒'; toast(state.soundOff ? '音效已关闭' : '音效已开启'); }); $('#briefButton').addEventListener('click', () => $('#briefModal').classList.remove('hidden'));
function beginMission() { state.started = true; state.paused = false; $('#briefModal').classList.add('hidden'); addEvent('指挥链路接通，等待七方军团进入峡谷。'); toast('行动开始 · 守住最高处'); updateHud(); }
$('#closeBrief').addEventListener('click', () => { if (!state.started) beginMission(); else $('#briefModal').classList.add('hidden'); }); $('#startBrief').addEventListener('click', beginMission); document.addEventListener('keydown', (event) => { if (event.code === 'Space') { event.preventDefault(); togglePause(); } if (event.key === 'Escape') $('#briefModal').classList.add('hidden'); });

state.buildings = [{ id: 'command', kind: 'command', name: '山巅指挥中心', x: 12.5, y: 9.5, z: 4, hp: 1000, maxHp: 1000 }, { id: 'turret-0', kind: 'turret', name: '哨戒炮 A', x: 10, y: 8, z: 4, hp: 620, maxHp: 620, cooldown: 0 }, { id: 'turret-1', kind: 'turret', name: '哨戒炮 B', x: 15, y: 8, z: 4, hp: 620, maxHp: 620, cooldown: 0 }, { id: 'barracks-0', kind: 'barracks', name: '增援兵营', x: 13, y: 12, z: 4, hp: 420, maxHp: 420, cooldown: 0 }, { id: 'power-0', kind: 'power', name: '电力核心', x: 10, y: 11, z: 4, hp: 420, maxHp: 420, cooldown: 0 }];
for (let i = 0; i < 10; i += 1) spawnFriendly(i === 0 ? 'tank' : 'ranger', 10.5 + (i % 4) * 1.4, 8.2 + Math.floor(i / 4) * 1.7);
addEvent('山巅信号塔在线，峡谷入口发现七支敌军。', 'warn'); addEvent('守住最高处，等待空中增援。'); resizeCanvas(); window.addEventListener('resize', resizeCanvas); updateHud();
let previous = performance.now(); function loop(now) { const delta = Math.min(.1, (now - previous) / 1000); previous = now; update(delta); draw(); requestAnimationFrame(loop); } requestAnimationFrame(loop);
