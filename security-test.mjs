/**
 * dsh-plug-skills 安全回归测试（离线，不需要网络）。
 *
 * 覆盖 CVE 类缺陷：/plug-skills/* 的 7 个 exact 路由此前没有任何鉴权，
 * 也没有 Host/Origin 校验 —— 本机任意进程（或经 DNS rebinding 的网页）无需凭据即可
 * 读取 $DSH_HOME 路径与技能清单、把仓库装进 $DSH_HOME/skills、删除技能、改写代理设置。
 *
 * 运行：node security-test.mjs
 */
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let passed = 0
let failed = 0
function check(label, cond, extra = '') {
  if (cond) { passed += 1; console.log('  ok  ' + label) }
  else { failed += 1; console.log(' FAIL ' + label + (extra !== '' ? ' — ' + extra : '')) }
}
function section(title) { console.log('\n== ' + title + ' ==') }

// ---------------------------------------------------------------- 环境
const DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-plug-skills-sec-'))
process.env.DSH_HOME = DSH_HOME
delete process.env.DSH_PLUG_SKILLS_PROXY
delete process.env.HTTPS_PROXY; delete process.env.https_proxy
delete process.env.HTTP_PROXY; delete process.env.http_proxy
delete process.env.ALL_PROXY; delete process.env.all_proxy

const ROUTES = [
  '/plug-skills/search',
  '/plug-skills/repo',
  '/plug-skills/local',
  '/plug-skills/install',
  '/plug-skills/remove',
  '/plug-skills/proxy',
  '/plug-skills/proxy-test',
]

const SETTINGS_FILE = join(DSH_HOME, 'plug-skills.json')
const SKILLS_DIR = join(DSH_HOME, 'skills')

const mod = await import('./index.js')

/** 假 ctx；withConnection=false 模拟缺少 connection 服务的环境。 */
function makeCtx({ withConnection = true } = {}) {
  const handlers = new Map()
  const connection = {
    // 与真实 connection.requestRejection 同语义：403=围栏拒绝，401=缺凭据，undefined=放行
    requestRejection(req) {
      const headers = req.headers ?? {}
      if (headers.host !== '127.0.0.1:3999') return 403
      if (headers['sec-fetch-site'] === 'cross-site') return 403
      return headers['x-authed'] === '1' ? undefined : 401
    },
  }
  return {
    ctx: {
      webServer: { register: (route) => handlers.set(route.path, route.handler) },
      get: (name) => (withConnection === true && name === 'connection' ? connection : undefined),
    },
    handlers,
  }
}

async function callRoute(handlers, path, params = {}, options = {}) {
  const { authed = true, host = '127.0.0.1:3999', crossSite = false } = options
  const handler = handlers.get(path)
  if (handler === undefined) throw new Error('路由未注册：' + path)
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
    .join('&')
  let out = null
  const res = {
    writeHead(status, headers) { this.status = status; this.headers = headers },
    end(body) { out = body },
  }
  const headers = { host }
  if (authed === true) headers['x-authed'] = '1'
  if (crossSite === true) headers['sec-fetch-site'] = 'cross-site'
  await handler({ url: path + (qs !== '' ? '?' + qs : ''), headers }, res)
  return { status: res.status, body: out }
}

const { ctx, handlers } = makeCtx()
mod.apply(ctx, {})

// ------------------------------------------------------------ 1. 未鉴权必须全部 401
section('未鉴权（Host 为回环但无有效 Cookie）')
for (const path of ROUTES) {
  const r = await callRoute(handlers, path, {}, { authed: false })
  check('401 ' + path, r.status === 401 && r.body === 'unauthorized', `status=${r.status} body=${String(r.body).slice(0, 60)}`)
}

// ------------------------------------------------------------ 2. Host / Origin 围栏
section('Host 不可信 / 跨站')
for (const path of ROUTES) {
  const bad = await callRoute(handlers, path, {}, { authed: true, host: 'evil.com' })
  check('403(Host=evil.com) ' + path, bad.status === 403 && bad.body === 'forbidden', `status=${bad.status}`)
}
for (const path of ROUTES) {
  const cs = await callRoute(handlers, path, {}, { authed: true, crossSite: true })
  check('403(cross-site) ' + path, cs.status === 403, `status=${cs.status}`)
}

// ------------------------------------------------------------ 3. 缺少 connection 服务 → 默认拒绝
section('缺少 connection 服务时默认拒绝')
{
  const bare = makeCtx({ withConnection: false })
  mod.apply(bare.ctx, {})
  for (const path of ROUTES) {
    const r = await callRoute(bare.handlers, path, {}, { authed: true })
    check('403(无 connection) ' + path, r.status === 403 && r.body === 'forbidden', `status=${r.status}`)
  }
}

// ------------------------------------------------------------ 4. 未鉴权不得产生副作用
section('未鉴权调用不得产生副作用')
{
  // 代理设置：不得被写入
  const r = await callRoute(handlers, '/plug-skills/proxy', { set: 'http://attacker.invalid:1' }, { authed: false })
  check('未鉴权 set 代理被拒', r.status === 401)
  check('未鉴权未写入 plug-skills.json', existsSync(SETTINGS_FILE) === false)

  // 安装：不得创建技能目录（也不需要网络，因为鉴权在下载之前）
  mkdirSync(SKILLS_DIR, { recursive: true })
  const r2 = await callRoute(handlers, '/plug-skills/install', { fullName: 'octocat/Hello-World', paths: '.' }, { authed: false })
  check('未鉴权 install 被拒', r2.status === 401)
  const { readdirSync } = await import('node:fs')
  check('未鉴权未写入 skills 目录', readdirSync(SKILLS_DIR).length === 0, JSON.stringify(readdirSync(SKILLS_DIR)))

  // 移除：不得删除已装技能
  mkdirSync(join(SKILLS_DIR, 'victim'), { recursive: true })
  writeFileSync(join(SKILLS_DIR, 'victim', 'SKILL.md'), '---\nname: victim\n---\n')
  const r3 = await callRoute(handlers, '/plug-skills/remove', { root: 'dsh', dir: 'victim' }, { authed: false })
  check('未鉴权 remove 被拒', r3.status === 401)
  check('未鉴权未删除 victim 技能', existsSync(join(SKILLS_DIR, 'victim', 'SKILL.md')) === true)
}

// ------------------------------------------------------------ 5. 已鉴权仍正常工作（不破坏功能）
section('已鉴权放行且功能不受影响')
{
  const local = await callRoute(handlers, '/plug-skills/local', {}, { authed: true })
  check('已鉴权 /local → 200 ok', local.status === 200 && JSON.parse(local.body).ok === true, `status=${local.status}`)

  const set = await callRoute(handlers, '/plug-skills/proxy', { set: 'http://127.0.0.1:7890' }, { authed: true })
  check('已鉴权 set 代理 → 200', set.status === 200 && JSON.parse(set.body).proxy === 'http://127.0.0.1:7890')
  check('已鉴权写入 plug-skills.json', JSON.parse(readFileSync(SETTINGS_FILE, 'utf8')).proxy === 'http://127.0.0.1:7890')

  const clear = await callRoute(handlers, '/plug-skills/proxy', { clear: '1' }, { authed: true })
  check('已鉴权 clear 代理 → 200', clear.status === 200 && JSON.parse(clear.body).proxy === '')
}

// ------------------------------------------------------------ 清理
rmSync(DSH_HOME, { recursive: true, force: true })
console.log('')
console.log(passed + ' passed, ' + failed + ' failed')
process.exit(failed === 0 ? 0 : 1)
