/**
 * Markdown / HTML 渲染专项测试：从 client.js 中提取渲染器源码，
 * 在 Node 里用真实 React 18 SSR 验证以下修复点：
 *  1. 链接图片 `[![alt](img)](url)`（徽章 / trendshift 统计图常用格式）
 *  2. 空 alt 图片 `![](url)`
 *  3. 内联 / 块级 HTML 标签不再原样显示（经 DOMParser 通道消费）
 *  4. 围栏代码块内的 `<tag>` 保持原样不处理
 *  5. 表格渲染
 * 运行：node markdown-test.mjs
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

// 提取 client.js 中「Markdown 渲染」段（两个注释标记之间）。
const clientSrc = readFileSync('./client.js', 'utf8')
const startMark = '// ------------------------------------------------------- Markdown 渲染'
const endMark = '// ------------------------------------------------------------- 组件'
const start = clientSrc.indexOf(startMark)
const end = clientSrc.indexOf(endMark)
check('能从 client.js 提取渲染器源码段', start !== -1 && end !== -1 && end > start)

// 假 DOMParser：把 HTML 块替换为一个文本节点占位——用于验证 HTML 被
// 消费而不是原样泄漏（浏览器里由真实 DOMParser 解析成元素）。
class FakeDOMParser {
  parseFromString(html) {
    return { body: { childNodes: [{ nodeType: 3, nodeValue: '[HTML已处理:' + html.length + '字符]' }] } }
  }
}

const h = React.createElement
// eslint-disable-next-line no-new-func
const renderMarkdown = new Function('React', 'h', 'DOMParser', clientSrc.slice(start, end) + '\nreturn renderMarkdown;')(React, h, FakeDOMParser)
check('renderMarkdown 提取成功', typeof renderMarkdown === 'function')

const resolveImage = (src) => (/^https?:\/\//i.test(src) ? src : null)

// ---- 1. 链接图片（trendshift 徽章格式）
{
  const md = '[![Trendshift](https://trendshift.io/repositories/badge/13584)](https://trendshift.io/repositories/13584)'
  const html = renderToString(renderMarkdown(md, resolveImage))
  check('链接图片：外层 <a> 指向仓库页', html.includes('<a href="https://trendshift.io/repositories/13584"'), html.slice(0, 200))
  check('链接图片：内层 <img> 指向徽章图', html.includes('<img src="https://trendshift.io/repositories/badge/13584"'), html.slice(0, 200))
  check('链接图片：无残留语法', !html.includes('[![') && !html.includes(']('))
}

// ---- 2. 空 alt 图片
{
  const md = '![](https://trendshift.io/repositories/13584)'
  const html = renderToString(renderMarkdown(md, resolveImage))
  check('空 alt 图片渲染为 <img>', html.includes('<img src="https://trendshift.io/repositories/13584"'), html.slice(0, 200))
}

// ---- 3. HTML 块级标签被消费（不再原样显示）
{
  const md = '<p align="center"><a href="https://example.com"><img src="https://img.example/b.png"></a></p>'
  const html = renderToString(renderMarkdown(md, resolveImage))
  check('HTML 块不再原样泄漏', !html.includes('<p align=') && !html.includes('&lt;p'), html.slice(0, 300))
  check('HTML 块经 DOMParser 通道处理', html.includes('[HTML已处理'), html.slice(0, 300))
}

// ---- 4. 段落内联 HTML 被消费
{
  const md = 'hello <b>world</b> and <img src="https://img.example/i.png"> done'
  const html = renderToString(renderMarkdown(md, resolveImage))
  check('内联 <b> 不泄漏', !html.includes('<b>') && !html.includes('&lt;b&gt;'), html.slice(0, 300))
}

// ---- 5. 围栏代码块内容保持原样（作为文本，不被 HTML 通道处理）
{
  const md = '```\n<p>raw html kept</p>\n```'
  const html = renderToString(renderMarkdown(md, resolveImage))
  // React 会把代码文本转义成实体，页面上显示为字面 <p>…</p>——这是期望行为
  check('代码块内 HTML 原样保留（转义文本）', html.includes('<pre><code>&lt;p&gt;raw html kept&lt;/p&gt;</code></pre>'), html.slice(0, 300))
  check('代码块内 HTML 未经 DOMParser 通道', !html.includes('[HTML已处理'), html.slice(0, 300))
}

// ---- 6. 表格
{
  const md = '| 名称 | 说明 |\n| --- | --- |\n| a | b |'
  const html = renderToString(renderMarkdown(md, resolveImage))
  check('表格渲染', html.includes('<table') && html.includes('<th>名称</th>') && html.includes('<td>b</td>'), html.slice(0, 300))
}

// ---- 7. 注释块被跳过
{
  const md = '<!-- hidden comment -->\n可见文本'
  const html = renderToString(renderMarkdown(md, resolveImage))
  check('HTML 注释被跳过', !html.includes('hidden comment') && html.includes('可见文本'))
}

console.log('')
console.log(passed + ' passed, ' + failed + ' failed')
process.exit(failed === 0 ? 0 : 1)
