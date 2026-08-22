/**
 * dsh-plug-skills 宿主插件冒烟测试（离线）。
 * 用假 ctx + 临时 DSH_HOME 驱动真实模块；`--net` 追加联网用例。
 * 运行：node smoke-test.mjs [--net]
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const NET = process.argv.includes('--net')
// --net 时可经代理访问（raw.githubusercontent.com 直连常被墙）：
// TEST_PROXY=http://127.0.0.1:7897 node smoke-test.mjs --net
const TEST_PROXY = process.env.TEST_PROXY ?? ''

let passed = 0
let failed = 0
function check(label, cond, extra = '') {
  if (cond) { passed += 1; console.log('  ok  ' + label) }
  else { failed += 1; console.log(' FAIL ' + label + (extra !== '' ? ' — ' + extra : '')) }
}
function section(title) { console.log('\n== ' + title + ' ==') }

// ---------------------------------------------------------------- 环境
const DSH_HOME = mkdtempSync(join(tmpdir(), 'dsh-plug-skills-test-'))
process.env.DSH_HOME = DSH_HOME
delete process.env.DSH_PLUG_SKILLS_PROXY
delete process.env.HTTPS_PROXY; delete process.env.https_proxy
delete process.env.HTTP_PROXY; delete process.env.http_proxy
delete process.env.ALL_PROXY; delete process.env.all_proxy

const mod = await import('./index.js')

function makeCtx() {
  const handlers = new Map()
  return {
    ctx: {
      webServer: { register: (route) => handlers.set(route.path, route.handler) },
      get: () => undefined,
    },
    handlers,
  }
}
async function callRoute(handlers, path, params = {}) {
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
  await handler({ url: path + (qs !== '' ? '?' + qs : '') }, res)
  return JSON.parse(out)
}

// ------------------------------------------------------------ 1. 导出
section('模块导出')
check('name === plug-skills', mod.name === 'plug-skills')
check('apply 是函数', typeof mod.apply === 'function')
check('inject 含 webServer', Array.isArray(mod.inject) === true && mod.inject.includes('webServer') === true)

// ------------------------------------------------------------ 2. 路由
section('路由注册')
const { ctx, handlers } = makeCtx()
mod.apply(ctx, {})
const EXPECTED = ['/plug-skills/search', '/plug-skills/repo', '/plug-skills/local', '/plug-skills/install', '/plug-skills/remove', '/plug-skills/proxy', '/plug-skills/proxy-test']
for (const path of EXPECTED) check('注册 ' + path, handlers.has(path) === true)

// ------------------------------------------------------------ 3. 本地扫描
section('本地技能扫描')
{
  const skillsDir = join(DSH_HOME, 'skills')
  mkdirSync(join(skillsDir, 'demo-skill'), { recursive: true })
  writeFileSync(join(skillsDir, 'demo-skill', 'SKILL.md'),
    '---\nname: demo-skill\ndescription: 一个演示技能。\ninvocation: /demo\n---\n正文内容。\n')
  writeFileSync(join(skillsDir, 'flat-skill.md'),
    '---\nname: flat-skill\ndescription: 扁平单文件技能。\n---\n正文。\n')
  mkdirSync(join(skillsDir, '.hidden'))
  writeFileSync(join(skillsDir, 'not-a-skill.txt'), 'no frontmatter here')
  mkdirSync(join(skillsDir, 'no-skillmd-dir'), { recursive: true })
  writeFileSync(join(skillsDir, 'no-skillmd-dir', 'README.md'), 'not a skill')

  const r = await callRoute(handlers, '/plug-skills/local')
  check('local ok', r.ok === true)
  check('dshHome 正确', r.dshHome === DSH_HOME)
  check('两个技能根', r.skillsRoots.length === 2 && r.skillsRoots[0].label === '$DSH_HOME/skills')
  const dirs = r.skills.map((s) => s.dir)
  check('发现目录技能', dirs.includes('demo-skill') === true)
  check('发现扁平技能', dirs.includes('flat-skill.md') === true)
  check('跳过隐藏 / 无 SKILL.md / 非 md', dirs.includes('.hidden') === false && dirs.includes('no-skillmd-dir') === false && dirs.includes('not-a-skill.txt') === false)
  const demo = r.skills.find((s) => s.dir === 'demo-skill')
  check('frontmatter 解析', demo.name === 'demo-skill' && demo.description === '一个演示技能。' && demo.invocation === '/demo')
  check('默认非托管', demo.managed === false)
}

// ------------------------------------------------------------ 4. 托管登记
section('托管登记')
{
  writeFileSync(join(DSH_HOME, 'plug-skills.json'), JSON.stringify({
    skills: [{ root: 'dsh', dir: 'demo-skill', source: 'github:foo/bar@main', path: '.', installedAt: 123 }],
  }))
  const r = await callRoute(handlers, '/plug-skills/local')
  const demo = r.skills.find((s) => s.dir === 'demo-skill')
  check('managed 标记', demo.managed === true && demo.source === 'github:foo/bar@main' && demo.installedAt === 123)
}

// ------------------------------------------------------------ 5. 安装参数校验（离线）
section('安装参数校验')
{
  let r = await callRoute(handlers, '/plug-skills/install', { fullName: 'bad repo!', paths: '.' })
  check('非法仓库名被拒', r.ok === false && /fullName|无效/.test(r.error))
  r = await callRoute(handlers, '/plug-skills/install', { fullName: 'octocat/Hello-World' })
  check('缺少 paths 被拒', r.ok === false && /paths/.test(r.error))
  r = await callRoute(handlers, '/plug-skills/install', { fullName: 'octocat/Hello-World', paths: '../evil' })
  check('路径穿越被拒', r.ok === false)
  r = await callRoute(handlers, '/plug-skills/install', { fullName: 'octocat/Hello-World', paths: 'a', names: '..' })
  check('非法目录名被拒', r.ok === false)
  r = await callRoute(handlers, '/plug-skills/install', { fullName: 'octocat/Hello-World', paths: Array.from({ length: 17 }, (_, i) => 's' + i).join(',') })
  check('超过 16 个被拒', r.ok === false && /1-16/.test(r.error))
}

// ------------------------------------------------------------ 6. 移除
section('移除技能')
{
  const target = join(DSH_HOME, 'skills', 'demo-skill')
  let r = await callRoute(handlers, '/plug-skills/remove', { root: 'dsh', dir: 'demo-skill' })
  check('移除成功', r.ok === true && existsSync(target) === false)
  const reg = JSON.parse(readFileSync(join(DSH_HOME, 'plug-skills.json'), 'utf8'))
  check('登记同步清理', reg.skills.length === 0)
  r = await callRoute(handlers, '/plug-skills/remove', { root: 'dsh', dir: 'demo-skill' })
  check('重复移除报错', r.ok === false && /不存在/.test(r.error))
  r = await callRoute(handlers, '/plug-skills/remove', { root: 'dsh', dir: '..' })
  check('目录名校验', r.ok === false)
  r = await callRoute(handlers, '/plug-skills/remove', { root: 'bogus', dir: 'x' })
  check('未知根被拒', r.ok === false)
}

// ------------------------------------------------------------ 7. 代理设置
section('代理设置')
{
  let r = await callRoute(handlers, '/plug-skills/proxy')
  check('初始直连', r.ok === true && r.proxy === '' && /未配置/.test(r.source))
  r = await callRoute(handlers, '/plug-skills/proxy', { set: 'http://127.0.0.1:7890' })
  check('设置代理', r.ok === true && r.proxy === 'http://127.0.0.1:7890' && /持久设置/.test(r.source))
  const persisted = JSON.parse(readFileSync(join(DSH_HOME, 'plug-skills.json'), 'utf8'))
  check('持久化到文件', persisted.proxy === 'http://127.0.0.1:7890')
  r = await callRoute(handlers, '/plug-skills/proxy', { set: 'not a proxy' })
  check('非法格式被拒', r.ok === false && /格式/.test(r.error))
  r = await callRoute(handlers, '/plug-skills/proxy', { set: 'socks5h://127.0.0.1:1080' })
  check('socks5h 合法', r.ok === true && r.proxy === 'socks5h://127.0.0.1:1080')
  r = await callRoute(handlers, '/plug-skills/proxy', { set: 'direct' })
  check('direct 强制直连', r.ok === true && r.proxy === '' && /强制直连/.test(r.source))
  r = await callRoute(handlers, '/plug-skills/proxy', { clear: '1' })
  check('清除后回落', r.ok === true && /未配置/.test(r.source))
}

// ------------------------------------------------------------ 8. 代理来源优先级
section('代理来源优先级')
{
  // 环境变量
  process.env.DSH_PLUG_SKILLS_PROXY = 'http://env-proxy:1'
  const envCtx = makeCtx()
  mod.apply(envCtx.ctx, {})
  let r = await callRoute(envCtx.handlers, '/plug-skills/proxy')
  check('环境变量生效', r.proxy === 'http://env-proxy:1' && /DSH_PLUG_SKILLS_PROXY/.test(r.source))
  delete process.env.DSH_PLUG_SKILLS_PROXY
  // 插件配置
  const cfgCtx = makeCtx()
  mod.apply(cfgCtx.ctx, { proxy: 'http://cfg-proxy:2' })
  r = await callRoute(cfgCtx.handlers, '/plug-skills/proxy')
  check('插件配置生效', r.proxy === 'http://cfg-proxy:2' && /插件配置/.test(r.source))
  // 持久设置优先于两者
  writeFileSync(join(DSH_HOME, 'plug-skills.json'), JSON.stringify({ proxy: 'http://persist:3' }))
  const topCtx = makeCtx()
  mod.apply(topCtx.ctx, { proxy: 'http://cfg-proxy:2' })
  r = await callRoute(topCtx.handlers, '/plug-skills/proxy')
  check('持久设置最优先', r.proxy === 'http://persist:3' && /持久设置/.test(r.source))
  // 恢复主 ctx（无持久代理）
  rmSync(join(DSH_HOME, 'plug-skills.json'), { force: true })
  mod.apply(ctx, {})
}

// ------------------------------------------------------------ 9. 联网用例
if (NET === true) {
  section('联网：搜索 / 详情 / 代理测试')
  if (TEST_PROXY !== '') {
    const rp = await callRoute(handlers, '/plug-skills/proxy', { set: TEST_PROXY })
    check('测试代理已应用', rp.ok === true && rp.proxy === TEST_PROXY)
  }
  const r1 = await callRoute(handlers, '/plug-skills/search', { topic: 'agent-skills' })
  check('搜索 agent-skills', r1.ok === true && r1.total > 0 && r1.repos.length > 0, JSON.stringify(r1).slice(0, 200))
  if (r1.ok === true && r1.repos.length > 0) {
    const target = r1.repos[0]
    const r2 = await callRoute(handlers, '/plug-skills/repo', { fullName: target.fullName })
    check('仓库详情', r2.ok === true && r2.repo.fullName === target.fullName && r2.repo.branch !== '', JSON.stringify(r2).slice(0, 300))
  }
  const r3 = await callRoute(handlers, '/plug-skills/proxy-test')
  check('代理测试', r3.ok === true && typeof r3.latencyMs === 'number', JSON.stringify(r3).slice(0, 200))
}

// ------------------------------------------------------------ 清理
rmSync(DSH_HOME, { recursive: true, force: true })
console.log('')
console.log(passed + ' passed, ' + failed + ' failed' + (NET === false ? '（offline；--net 追加联网用例）' : ''))
process.exit(failed === 0 ? 0 : 1)
