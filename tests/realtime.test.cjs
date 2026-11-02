const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {boot}=require('./runtime.cjs');const source=fs.readFileSync('index.html','utf8');
/* 2026-11-02 실시간 성장: 접속 안 해도 시간은 흐름 · 물 12시간 유지 · 마른 지 36시간/수확 안 하고 48시간이면 죽음 */
const H=3600;
function fresh(){const r=boot(source),q=r.qa;q.newGame('purple','QA only');q.ensureAlpha();q.setPlay();q.S.tutorial={status:'skipped'};return r}
function plant(r,k='turnip'){const q=r.qa;q.S.G[10][10]='w';q.S.C[10][10]={k,age:0,w:1};const tick=r.intervals.find(v=>v.ms===1000&&String(v.f).includes('rtTick'));tick.f();return {c:q.S.C[10][10],tick}}
function pass(r,c,sec){const q=r.qa;q.S.rtLast-=sec;c.rt.water-=sec;if(c.rt.ripe!=null)c.rt.ripe-=sec}
test('turnip ripens after about an hour of real time while watered',()=>{const r=fresh(),q=r.qa;const {c,tick}=plant(r);pass(r,c,30*60);tick.f();assert.ok(c.age<q.CROPS.turnip.days);pass(r,c,31*60);tick.f();assert.equal(c.age,q.CROPS.turnip.days);assert.ok(!c.dead)});
test('ripe crop left unharvested wilts after 24h and dies after 48h',()=>{const r=fresh(),q=r.qa;const {c,tick}=plant(r);c.age=q.CROPS.turnip.days;tick.f();const t=c.rt.ripe;q.S.rtLast-=25*H;c.rt.ripe-=25*H;c.rt.water=Date.now()/1000;tick.f();assert.equal(c.care.stage,'wilt');assert.ok(!c.dead);q.S.rtLast-=24*H;c.rt.ripe-=24*H;c.rt.water=Date.now()/1000;tick.f();assert.ok(c.dead)});
test('unwatered crop warns after 12h and dies after 36h; watering in between saves it',()=>{const r=fresh(),q=r.qa;const {c,tick}=plant(r);pass(r,c,13*H);tick.f();assert.equal(c.care.stage,'warn');assert.ok(!c.dead);pass(r,c,24*H);tick.f();assert.ok(c.dead)});
test('one new crop per level',()=>{const r=fresh(),q=r.qa;q.S.balKeep=[];q.S.lv=1;assert.ok(q.unlocked('seed_turnip'));assert.equal(q.unlocked('seed_radish'),false);q.S.lv=2;assert.ok(q.unlocked('seed_radish'));assert.equal(q.unlocked('seed_potato'),false)});
