/* Cached projectile art and bounded wall-clock effects: no combat state is changed. */
const emeraldBoltSprite = document.createElement("canvas");
emeraldBoltSprite.width = 192; emeraldBoltSprite.height = 80;
{
  const g = emeraldBoltSprite.getContext("2d");
  const glow = g.createRadialGradient(137, 40, 1, 124, 40, 62);
  glow.addColorStop(0, "#d5ffe6"); glow.addColorStop(.2, "#5eff9c");
  glow.addColorStop(.5, "#13bf744d"); glow.addColorStop(1, "#13bf7400");
  g.fillStyle = glow; g.fillRect(0, 0, 192, 80);
  const flame = g.createLinearGradient(8, 0, 162, 0);
  flame.addColorStop(0, "#00ca7900"); flame.addColorStop(.45, "#18ce82aa");
  flame.addColorStop(.8, "#66ffb5"); flame.addColorStop(1, "#eefff6");
  g.fillStyle = flame; g.beginPath(); g.moveTo(177, 40);
  g.bezierCurveTo(140, 8, 98, 23, 10, 20); g.lineTo(83, 38); g.lineTo(0, 48);
  g.bezierCurveTo(75, 59, 139, 75, 177, 40); g.fill();
  g.fillStyle = "#eaffed"; g.beginPath(); g.moveTo(172, 40); g.lineTo(133, 31);
  g.lineTo(96, 40); g.lineTo(133, 49); g.closePath(); g.fill();
}
function drawEmeraldProjectile(bullet) {
  const scale = battleVisualScale * Math.max(.8, turretVisualScale);
  ctx.save(); ctx.translate(bullet.x, bullet.y); ctx.rotate(Math.atan2(bullet.vy, bullet.vx));
  ctx.scale(scale, scale);
  ctx.drawImage(emeraldBoltSprite, -83, -20, 96, 40);
  ctx.strokeStyle = "#8effbf"; ctx.lineWidth = 1.4;
  const pulse = Math.sin(performance.now() * .012 + bullet.x * .01) * 2;
  ctx.beginPath(); ctx.moveTo(-58, -9); ctx.quadraticCurveTo(-30, -18 - pulse, 6, -4);
  ctx.moveTo(-47, 10); ctx.quadraticCurveTo(-25, 19 + pulse, 6, 4); ctx.stroke();
  ctx.restore();
}
const emeraldImpacts = [];
function addEmeraldImpact(enemy, targets) {
  if (emeraldImpacts.length >= 24) emeraldImpacts.shift();
  emeraldImpacts.push({ x: enemy.x, y: enemy.y, born: performance.now(),
    points: targets.map((target) => ({ x: target.x, y: target.y })) });
}
const emeraldBaseDrawEffects = drawEffects;
drawEffects = function () {
  emeraldBaseDrawEffects();
  const now = performance.now();
  while (emeraldImpacts.length && now - emeraldImpacts[0].born > 320) emeraldImpacts.shift();
  for (const impact of emeraldImpacts) {
    if (!gameStarted || !isRenderVisible(impact.x, impact.y, 200)) continue;
    const progress = (now - impact.born) / 320;
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.strokeStyle = "#69ffad"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(impact.x, impact.y, (8 + progress * 25) * battleVisualScale, 0, Math.PI * 2); ctx.stroke();
    let from = impact;
    for (const to of impact.points) {
      const dx = to.x - from.x, dy = to.y - from.y, distance = Math.max(1, Math.hypot(dx, dy));
      ctx.beginPath(); ctx.moveTo(from.x, from.y);
      for (let i = 1; i < 6; i++) {
        const offset = (i % 2 ? 7 : -7) * battleVisualScale;
        ctx.lineTo(from.x + dx * i / 6 - dy / distance * offset, from.y + dy * i / 6 + dx / distance * offset);
      }
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = "#17c87788"; ctx.lineWidth = 7 * battleVisualScale; ctx.stroke();
      ctx.strokeStyle = "#c8ffe0"; ctx.lineWidth = 1.8 * battleVisualScale; ctx.stroke();
      from = to;
    }
    ctx.restore();
  }
};
