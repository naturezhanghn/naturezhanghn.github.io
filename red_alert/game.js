const canvas = document.querySelector('#battlefield');
const context = canvas.getContext('2d');
const state = {
  started: false,
  paused: false,
  startedAt: performance.now(),
  elapsed: 0,
  credits: 2450,
  ore: 620,
  power: 84,
  maxPower: 100,
  selected: null,
  wave: 1,
  waveTimer: 28,
  defeated: 0,
  status: 'active',
  camera: { x: 0, y: 0 },
  units: [
    { id: 'ranger-1', kind: 'ranger', label: '游骑兵 · 01', x: 39, y: 28, hp: 100, maxHp: 100, order: null, target: null, cooldown: 0 },
    { id: 'ranger-2', kind: 'ranger', label: '游骑兵 · 02', x: 43, y: 33, hp: 100, maxHp: 100, order: null, target: null, cooldown: 0 },
    { id: 'tank-1', kind: 'tank', label: '铁卫坦克', x: 34, y: 35, hp: 180, maxHp: 180, order: null, target: null, cooldown: 0 }
  ],
  buildings: [
    { id: 'command', kind: 'command', x: 28, y: 29, hp: 1000, maxHp: 1000 },
    { id: 'power', kind: 'power', x: 19, y: 42, hp: 400, maxHp: 400 },
    { id: 'harvester', kind: 'harvester', x: 13, y: 17, hp: 500, maxHp: 500 },
    { id: 'barracks', kind: 'barracks', x: 38, y: 44, hp: 440, maxHp: 440 }
  ],
  enemies: [],
  effects: [],
  events: [
    { text: '前线协议已启动。侦测到东侧异常热源。', kind: 'normal', time: '00:00' },
    { text: '矿车已抵达矿脉，自动采集已恢复。', kind: 'normal', time: '00:04' },
    { text: '林澈：把哨站守住，我们就能等到增援。', kind: 'warn', time: '00:12' }
  ]
};
let renderedUnitSignature = '';
let renderedEventSignature = '';

const buildingSpec = {
  harvester: { label: '采矿车', credits: 650, ore: 0, power: 0, income: 8, hp: 500 },
  barracks: { label: '兵营', credits: 520, ore: 120, power: -12, hp: 440 },
  turret: { label: '哨戒炮', credits: 760, ore: 180, power: -18, hp: 620 }
};
const unitSpec = {
  ranger: { label: '游骑兵', credits: 300, ore: 40, hp: 100, speed: 6, range: 4.5, damage: 22 },
  tank: { label: '铁卫坦克', credits: 700, ore: 160, hp: 180, speed: 3.3, range: 5.5, damage: 44 }
};

const $ = (selector) => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const formatCredits = (value) => Math.max(0, Math.floor(value)).toLocaleString('en-US');
const addEvent = (text, kind = 'normal') => {
  const elapsed = Math.floor(state.elapsed);
  state.events.unshift({ text, kind, time: `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}` });
  state.events = state.events.slice(0, 6);
};
const toast = (message) => {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 2400);
};

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function worldPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 64, 0, 64),
    y: clamp(((event.clientY - rect.top) / rect.height) * 52, 0, 52)
  };
}

function drawBackground(width, height) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1d3633');
  gradient.addColorStop(0.48, '#172b2b');
  gradient.addColorStop(1, '#10212a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  const cell = width / 64;
  context.strokeStyle = 'rgba(150, 185, 167, .07)';
  context.lineWidth = 1;
  for (let x = 0; x <= width; x += cell * 4) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
  }
  for (let y = 0; y <= height; y += cell * 4) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
  context.fillStyle = 'rgba(117, 170, 143, .15)';
  context.beginPath(); context.moveTo(0, height * .72); context.quadraticCurveTo(width * .24, height * .59, width * .52, height * .75); context.quadraticCurveTo(width * .8, height * .91, width, height * .68); context.lineTo(width, height); context.lineTo(0, height); context.closePath(); context.fill();
  context.fillStyle = 'rgba(81, 127, 128, .23)';
  context.beginPath(); context.moveTo(width * .77, 0); context.lineTo(width, 0); context.lineTo(width, height * .44); context.quadraticCurveTo(width * .87, height * .37, width * .76, height * .22); context.closePath(); context.fill();
  // resource fields
  for (const point of [{ x: 9, y: 12 }, { x: 15, y: 10 }, { x: 57, y: 11 }, { x: 53, y: 19 }]) {
    context.fillStyle = '#d6a85899';
    context.beginPath(); context.arc(point.x / 64 * width, point.y / 52 * height, cell * 1.1, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#efc96d55'; context.stroke();
  }
  // tactical routes
  context.setLineDash([7, 9]); context.strokeStyle = '#96c2b044'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(width * .31, height * .58); context.lineTo(width * .7, height * .26); context.stroke();
  context.setLineDash([]);
}

function toCanvas(point, width, height) { return { x: point.x / 64 * width, y: point.y / 52 * height }; }
function drawHealth(entity, point, width) {
  const ratio = clamp(entity.hp / entity.maxHp, 0, 1);
  context.fillStyle = '#071016aa'; context.fillRect(point.x - width / 2, point.y - 19, width, 3);
  context.fillStyle = ratio > .55 ? '#6ac29a' : ratio > .25 ? '#edb862' : '#e54f47';
  context.fillRect(point.x - width / 2, point.y - 19, width * ratio, 3);
}

function drawBuilding(building, width, height) {
  const p = toCanvas(building, width, height);
  const scale = width / 64;
  const size = building.kind === 'command' ? 4.8 : building.kind === 'harvester' ? 3.8 : 3.5;
  context.save();
  context.translate(p.x, p.y);
  context.shadowColor = '#0008'; context.shadowBlur = 15; context.shadowOffsetY = 8;
  context.fillStyle = building.kind === 'command' ? '#5b2b31' : building.kind === 'power' ? '#28515b' : '#1a3e48';
  context.strokeStyle = building.kind === 'command' ? '#ef846e' : '#68a9a3'; context.lineWidth = 1.3;
  context.beginPath(); context.roundRect(-size * scale, -size * scale, size * 2 * scale, size * 1.55 * scale, 5); context.fill(); context.stroke();
  context.shadowBlur = 0; context.shadowOffsetY = 0;
  context.fillStyle = building.kind === 'command' ? '#dc574c' : '#6db1b0';
  context.fillRect(-size * .45 * scale, -size * .95 * scale, size * .9 * scale, size * .25 * scale);
  context.fillStyle = '#e8c274';
  context.beginPath(); context.arc(size * .45 * scale, size * .4 * scale, Math.max(2, scale * .33), 0, Math.PI * 2); context.fill();
  context.restore();
  drawHealth(building, { x: p.x, y: p.y - size * scale }, size * scale * 1.6);
}

function drawUnit(unit, width, height) {
  const p = toCanvas(unit, width, height);
  const scale = width / 64;
  const selected = state.selected === unit.id;
  context.save(); context.translate(p.x, p.y);
  if (selected) { context.strokeStyle = '#f1bd63'; context.lineWidth = 2; context.beginPath(); context.arc(0, 0, 12 * scale, 0, Math.PI * 2); context.stroke(); }
  context.fillStyle = unit.kind === 'tank' ? '#87bda8' : '#61b5cf';
  context.strokeStyle = '#b7e2d6'; context.lineWidth = 1;
  context.beginPath();
  if (unit.kind === 'tank') context.roundRect(-8 * scale, -5 * scale, 16 * scale, 10 * scale, 3);
  else { context.moveTo(0, -8 * scale); context.lineTo(7 * scale, 6 * scale); context.lineTo(-7 * scale, 6 * scale); context.closePath(); }
  context.fill(); context.stroke();
  context.fillStyle = '#d9f0d9'; context.beginPath(); context.arc(0, 0, 2 * scale, 0, Math.PI * 2); context.fill();
  context.restore();
  drawHealth(unit, { x: p.x, y: p.y - 13 * scale }, 24 * scale);
}

function drawEnemy(enemy, width, height) {
  const p = toCanvas(enemy, width, height);
  const scale = width / 64;
  const size = enemy.kind === 'brute' ? 9 : 6;
  context.save(); context.translate(p.x, p.y); context.rotate(Math.PI / 4);
  context.fillStyle = enemy.kind === 'brute' ? '#a53c47' : '#df564b'; context.strokeStyle = '#ff9b76'; context.lineWidth = 1;
  context.fillRect(-size * scale, -size * scale, size * 2 * scale, size * 2 * scale); context.strokeRect(-size * scale, -size * scale, size * 2 * scale, size * 2 * scale);
  context.restore(); drawHealth(enemy, { x: p.x, y: p.y - 11 * scale }, 20 * scale);
}

function drawEffects(width, height) {
  for (const effect of state.effects) {
    const p = toCanvas(effect, width, height);
    context.strokeStyle = `rgba(237, 182, 98, ${effect.life / effect.maxLife})`; context.lineWidth = 2;
    context.beginPath(); context.arc(p.x, p.y, (1 - effect.life / effect.maxLife) * 18, 0, Math.PI * 2); context.stroke();
  }
}

function render() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width; const height = rect.height;
  context.clearRect(0, 0, width, height); drawBackground(width, height);
  for (const building of state.buildings) if (building.hp > 0) drawBuilding(building, width, height);
  for (const unit of state.units) if (unit.hp > 0) drawUnit(unit, width, height);
  for (const enemy of state.enemies) if (enemy.hp > 0) drawEnemy(enemy, width, height);
  drawEffects(width, height);
  const selected = state.units.find(unit => unit.id === state.selected);
  $('#selectionLabel').textContent = selected ? `${selected.label} · ${selected.order ? '执行命令' : '待命'}` : '未选择单位';
  $('#gridReadout').textContent = selected ? `${String.fromCharCode(65 + Math.floor(selected.x / 8))}-${String(Math.floor(selected.y / 4) + 1).padStart(2, '0')}` : 'A-07';
}

function updateHud() {
  $('#credits').textContent = formatCredits(state.credits);
  $('#ore').textContent = formatCredits(state.ore);
  const generated = state.buildings.filter(item => item.kind === 'power').length * 40 + 44;
  const used = state.buildings.filter(item => item.kind === 'turret').length * 18 + state.buildings.filter(item => item.kind === 'barracks').length * 12;
  state.power = generated - used;
  state.maxPower = generated;
  $('#power').textContent = `${Math.max(0, Math.floor(state.power))} / ${state.maxPower}`;
  $('#unitCount').textContent = `${state.units.length} UNITS`;
  $('#buildCount').textContent = `${state.buildings.length} SLOTS`;
  $('#creditRate').textContent = `+${state.buildings.filter(item => item.kind === 'harvester').length * 8 + 12} / min`;
  $('#oreRate').textContent = `+${state.buildings.filter(item => item.kind === 'harvester').length * 3 + 4} / min`;
  $('#waveLabel').textContent = `WAVE ${Math.min(state.wave, 3)} / 3`;
  $('#waveProgress').style.width = `${clamp((state.wave - 1) / 3 * 100, 0, 100)}%`;
  $('#objectiveState').textContent = state.status === 'won' ? 'CLEARED' : state.status === 'lost' ? 'FAILED' : state.enemies.length ? 'ENGAGED' : 'WAITING';
  $('#missionStatus').textContent = state.status === 'won' ? '任务完成 · 霜线防卫' : state.status === 'lost' ? '防线失守 · 霜线防卫' : state.paused ? '行动暂停 · 霜线防卫' : '行动中 · 霜线防卫';
  $('#gameClock').textContent = `${String(Math.floor(state.elapsed / 60)).padStart(2, '0')}:${String(Math.floor(state.elapsed % 60)).padStart(2, '0')}`;
  const morale = clamp(78 - state.enemies.length * 5 + state.defeated * 2, 18, 100);
  $('#moraleMeter').style.width = `${morale}%`; $('#moraleValue').textContent = `${morale}%`;
  const eventSignature = state.events.map(entry => `${entry.text}|${entry.time}`).join('~');
  if (eventSignature !== renderedEventSignature) {
    renderedEventSignature = eventSignature;
    $('#eventLog').innerHTML = state.events.map(entry => `<div class="log-entry ${entry.kind === 'warn' ? 'warn' : entry.kind === 'danger' ? 'danger' : ''}"><i></i><div>${entry.text}<time>${entry.time}</time></div></div>`).join('');
  }
  const unitSignature = state.units.map(unit => `${unit.id}:${Math.round(unit.hp)}:${unit.order ? 'moving' : 'idle'}`).join('|') + `|${state.selected}`;
  if (unitSignature !== renderedUnitSignature) {
    renderedUnitSignature = unitSignature;
    $('#unitList').innerHTML = state.units.map(unit => `<div class="unit-row ${unit.id === state.selected ? 'selected' : ''}" data-unit="${unit.id}"><span class="unit-icon">${unit.kind === 'tank' ? '▰' : '△'}</span><div><h3>${unit.label}</h3><p>${unit.order ? '移动中' : '待命'}</p></div><span class="health-line"><i style="width:${clamp(unit.hp / unit.maxHp * 100, 0, 100)}%"></i></span></div>`).join('');
    document.querySelectorAll('[data-unit]').forEach(node => node.addEventListener('click', () => selectUnit(node.dataset.unit)));
  }
}

function selectUnit(id) { if (state.units.some(unit => unit.id === id)) { state.selected = id; toast('已选中单位 · 右键地图下达移动命令'); updateHud(); render(); } }

function build(kind) {
  const spec = buildingSpec[kind];
  if (!spec || state.credits < spec.credits || state.ore < spec.ore) return toast('资源不足，无法完成建造');
  state.credits -= spec.credits; state.ore -= spec.ore;
  const anchor = state.buildings.find(item => item.kind === 'command') || { x: 28, y: 29 };
  state.buildings.push({ id: `${kind}-${Date.now()}`, kind, x: anchor.x + (state.buildings.length % 3) * 7 - 7, y: anchor.y + Math.floor(state.buildings.length / 3) * 7 - 9, hp: spec.hp, maxHp: spec.hp });
  addEvent(`${spec.label}已部署，自动系统上线。`); toast(`${spec.label}建造完成`); updateHud();
}

function deploy() {
  const spec = unitSpec.ranger;
  if (state.credits < spec.credits || state.ore < spec.ore) return toast('资源不足，无法部署突击队');
  state.credits -= spec.credits; state.ore -= spec.ore; const barracks = state.buildings.find(item => item.kind === 'barracks') || { x: 38, y: 44 };
  state.units.push({ id: `ranger-${Date.now()}`, kind: 'ranger', label: `游骑兵 · ${String(state.units.length + 1).padStart(2, '0')}`, x: barracks.x + 3, y: barracks.y - 3, hp: spec.hp, maxHp: spec.hp, order: null, target: null, cooldown: 0 });
  addEvent('新的游骑兵已从兵营出发。'); toast('突击队已部署'); updateHud();
}

function repair() {
  const command = state.buildings.find(item => item.kind === 'command');
  if (!command || command.hp >= command.maxHp) return toast('指挥中心状态良好');
  if (state.credits < 180) return toast('资金不足，无法维修');
  state.credits -= 180; command.hp = Math.min(command.maxHp, command.hp + 240); addEvent('工程组完成指挥中心紧急维修。'); toast('维修完成'); updateHud();
}

function spawnWave() {
  const count = Math.min(6, 2 + state.wave);
  for (let i = 0; i < count; i += 1) state.enemies.push({ id: `enemy-${Date.now()}-${i}`, kind: i % 3 === 0 ? 'brute' : 'raider', x: 58 + (i % 2) * 3, y: 10 + (i * 8) % 31, hp: i % 3 === 0 ? 260 : 100, maxHp: i % 3 === 0 ? 260 : 100, speed: i % 3 === 0 ? 1.5 : 2.4, damage: i % 3 === 0 ? 35 : 19, cooldown: 0 });
  addEvent(`第 ${state.wave} 波敌军进入战区，所有单位就位。`, 'danger'); state.wave += 1; state.waveTimer = 30;
}

function attack(attacker, target, delta) {
  if (attacker.cooldown > 0 || distance(attacker, target) > (attacker.kind === 'tank' ? 5.5 : 4.5)) return;
  target.hp -= (attacker.kind === 'tank' ? 44 : 22) * delta; attacker.cooldown = .78; state.effects.push({ x: target.x, y: target.y, life: .24, maxLife: .24 });
}

function update(delta) {
  if (!state.started || state.paused || state.status !== 'active') return;
  state.elapsed += delta; state.waveTimer -= delta;
  const miners = state.buildings.filter(item => item.kind === 'harvester').length;
  state.credits += (12 + miners * 8) / 60 * delta; state.ore += (4 + miners * 3) / 60 * delta;
  for (const unit of state.units) {
    if (unit.hp <= 0) { unit.order = null; unit.target = null; continue; }
    unit.cooldown = Math.max(0, unit.cooldown - delta);
    const target = state.enemies.find(enemy => enemy.id === unit.target && enemy.hp > 0);
    if (!target) unit.target = null;
    if (target && target.hp > 0) attack(unit, target, delta);
    else if (unit.order) { const d = distance(unit, unit.order); if (d > .4) { unit.x += (unit.order.x - unit.x) / d * (unit.kind === 'tank' ? 3.3 : 6) * delta; unit.y += (unit.order.y - unit.y) / d * (unit.kind === 'tank' ? 3.3 : 6) * delta; } else unit.order = null; }
    if (!target && !unit.order) { const nearest = state.enemies.reduce((best, enemy) => !best || distance(unit, enemy) < distance(unit, best) ? enemy : best, null); if (nearest && distance(unit, nearest) < 5) { unit.target = nearest.id; attack(unit, nearest, delta); } }
  }
  for (const enemy of state.enemies) {
    enemy.cooldown = Math.max(0, enemy.cooldown - delta);
    const command = state.buildings.find(item => item.kind === 'command' && item.hp > 0);
    const livingUnits = state.units.filter(unit => unit.hp > 0);
    const target = livingUnits.reduce((best, unit) => !best || distance(enemy, unit) < distance(enemy, best) ? unit : best, command?.hp > 0 ? command : null);
    if (target && distance(enemy, target) < 3) { if (enemy.cooldown <= 0) { target.hp -= enemy.damage; enemy.cooldown = 1; state.effects.push({ x: target.x, y: target.y, life: .24, maxLife: .24 }); } }
    else if (target) { const d = distance(enemy, target); enemy.x += (target.x - enemy.x) / d * enemy.speed * delta; enemy.y += (target.y - enemy.y) / d * enemy.speed * delta; }
  }
  state.units = state.units.filter(unit => unit.hp > 0);
  if (state.selected && !state.units.some(unit => unit.id === state.selected)) state.selected = null;
  for (const building of state.buildings.filter(item => item.kind === 'turret')) { const enemy = state.enemies.reduce((best, item) => !best || distance(building, item) < distance(building, best) ? item : best, null); if (enemy && distance(building, enemy) < 9) { building.cooldown = Math.max(0, (building.cooldown || 0) - delta); if (!building.cooldown) { enemy.hp -= 30; building.cooldown = .72; } } }
  state.effects.forEach(effect => effect.life -= delta); state.effects = state.effects.filter(effect => effect.life > 0);
  const defeatedNow = state.enemies.filter(enemy => enemy.hp <= 0); if (defeatedNow.length) { state.defeated += defeatedNow.length; state.credits += defeatedNow.length * 45; addEvent(`确认击溃 ${defeatedNow.length} 个敌军单位，缴获补给。`); }
  state.enemies = state.enemies.filter(enemy => enemy.hp > 0);
  if (state.waveTimer <= 0 && state.enemies.length === 0 && state.wave <= 3) spawnWave();
  const command = state.buildings.find(item => item.kind === 'command');
  if (!command || command.hp <= 0) { state.status = 'lost'; addEvent('指挥中心已被摧毁，霜线防卫失败。', 'danger'); toast('防线失守'); }
  if (state.wave > 3 && state.enemies.length === 0 && state.elapsed > 60) { state.status = 'won'; addEvent('三波敌军已击退，霜线防卫成功。'); toast('任务完成 · 霜线守住了'); }
}

canvas.addEventListener('click', (event) => {
  const point = worldPoint(event); const unit = state.units.find(item => distance(item, point) < 2.2);
  if (unit) selectUnit(unit.id); else if (state.selected) { const selected = state.units.find(item => item.id === state.selected); if (selected) { selected.order = point; selected.target = null; toast('移动命令已下达'); } }
});
canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault(); const point = worldPoint(event); const selected = state.units.find(item => item.id === state.selected); if (!selected) return toast('先选择一支部队');
  const enemy = state.enemies.find(item => distance(item, point) < 2.4); if (enemy) { selected.target = enemy.id; selected.order = null; toast('攻击命令已下达'); } else { selected.order = point; selected.target = null; toast('移动命令已下达'); }
});
document.querySelectorAll('[data-build]').forEach(button => button.addEventListener('click', () => build(button.dataset.build)));
$('#deployButton').addEventListener('click', deploy); $('#repairButton').addEventListener('click', repair);
$('#pauseButton').addEventListener('click', () => { state.paused = !state.paused; $('#pauseOverlay').classList.toggle('hidden', !state.paused); updateHud(); });
$('#soundToggle').addEventListener('click', (event) => { event.currentTarget.textContent = event.currentTarget.textContent === '◒' ? '◑' : '◒'; toast(event.currentTarget.textContent === '◑' ? '音效已开启' : '音效已关闭'); });
$('#briefButton').addEventListener('click', () => $('#briefModal').classList.remove('hidden'));
function beginMission() { state.started = true; state.paused = false; $('#briefModal').classList.add('hidden'); toast('行动开始，守住霜线哨站'); updateHud(); }
$('#closeBrief').addEventListener('click', () => { if (!state.started) beginMission(); else $('#briefModal').classList.add('hidden'); });
$('#startBrief').addEventListener('click', beginMission);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') { event.preventDefault(); $('#pauseButton').click(); }
  if (event.key === 'Escape') $('#briefModal').classList.add('hidden');
});
window.addEventListener('resize', fitCanvas); fitCanvas(); updateHud(); render();
let previous = performance.now();
function loop(now) { const delta = Math.min(.1, (now - previous) / 1000); previous = now; update(delta); updateHud(); render(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
