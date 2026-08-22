/**
 * 客户端渲染冒烟测试：模拟 __ModuleLoader__ 加载 client.js，
 * 用真实 React 18 SSR 渲染设置页组件树，捕捉运行时错误。
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const pnpmReq = createRequire('/Users/wangfeng/TraeProject/deepseek-harness/node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom/package.json')
const React = pnpmReq('react')
const { renderToString } = pnpmReq('react-dom/server')

let passed = 0
let failed = 0
function check(label, cond, extra = '') {
  if (cond) { passed += 1; console.log('  ok  ' + label) }
  else { failed += 1; console.log(' FAIL ' + label + (extra !== '' ? ' — ' + extra : '')) }
}

let captured = null
global.window = {
  __ModuleLoader__: { load: (def) => { captured = def } },
  addEventListener() {},
  removeEventListener() {},
}
global.document = {
  createElement: () => ({ dataset: {}, style: {}, textContent: '', addEventListener() {}, remove() {} }),
  head: { appendChild() {} },
}

// eslint-disable-next-line no-eval
eval(readFileSync('./client.js', 'utf8'))
check('模块被 __ModuleLoader__ 捕获', captured !== null && captured.id === 'dsh-plug-skills')

const mod = captured.factory((spec) => {
  if (spec === 'react') return React
  throw new Error('未知依赖：' + spec)
})
check('exports.apply 存在', typeof mod.apply === 'function')

let registered = null
const ctx = {
  effect: (fn) => fn(),
  get: (name) => (name === 'slots' ? {
    inject: (_slot, cb) => cb(),
    register: (opts, factory) => { registered = { opts, factory } },
  } : undefined),
}
mod.apply(ctx)
check('slot 注册', registered !== null && registered.opts.name === 'settings.plugins.tab' && registered.opts.id === 'skills-marketplace')
check('标签页标签', registered.opts.label === 'Skills')

let html = ''
try {
  html = renderToString(registered.factory({}))
} catch (error) {
  check('SSR 渲染成功', false, String(error))
}
if (html !== '') {
  check('SSR 渲染成功', true)
  check('含发现/已安装标签', html.includes('发现') && html.includes('已安装'))
  check('含代理面板', html.includes('GitHub 代理'))
  check('含技能 topic 选择', html.includes('topic:agent-skills') && html.includes('topic:dsh-skill') && html.includes('topic:claude-skills'))
  check('无 MCP 残留', !html.includes('MCP 服务') && !html.includes('plug-mcp'))
}

console.log('')
console.log(passed + ' passed, ' + failed + ' failed')
process.exit(failed === 0 ? 0 : 1)
