/**
 * dsh-plug-skills — 宿主插件。
 *
 * DeepSeek Harness 的 Skills 管理器：
 *
 * - 发现：搜索 GitHub 上的 Agent Skills 仓库（SKILL.md 目录包格式，按
 *   `agent-skills` / `dsh-skill` / `claude-skills` topic 发现）。
 * - 详情：仓库元数据 + README + 内容探测——经 git trees 递归扫描列出全部
 *   SKILL.md 技能包并解析其 frontmatter（name / description / invocation）。
 * - 安装 / 移除：经 HTTPS 下载 codeload tarball（自动走代理），解压后把选中
 *   的技能目录复制进 `$DSH_HOME/skills/<dir>`。skill-filesystem 对用户技能
 *   根目录做文件监视——装完 / 移除立即生效，无需重启。安装登记记录在
 *   $DSH_HOME/plug-skills.json。
 * - 本地 JSON API（`/plug-skills/*`），供本 bundle 的浏览器端调用。
 *
 * 依赖仅 js-yaml（解析 SKILL.md 的 YAML frontmatter）。GitHub 抓取默认
 * 直连；配置代理后经由系统 curl 走代理（支持 http/https/socks5/socks5h/
 * socks4），代理来源优先级：持久设置（UI 写入 $DSH_HOME/plug-skills.json）
 * > 插件配置（patch config.proxy）> 环境变量。
 * @module dsh-plug-skills
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import yaml from 'js-yaml'

const GH_API = 'https://api.github.com'
const GH_RAW = 'https://raw.githubusercontent.com'
const GH_CODELOAD = 'https://codeload.github.com'
const SETTINGS_FILE = 'plug-skills.json'
const SRC_DIR_NAME = '.plug-skills-src'
const SRC_MAX_BYTES = 50 * 1024 * 1024
const REPO_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/
const SKILL_PATH_RE = /^[A-Za-z0-9._][A-Za-z0-9._-]*(\/[A-Za-z0-9._][A-Za-z0-9._-]*)*$/
const SKILL_DIR_RE = /^[A-Za-z0-9._][A-Za-z0-9._-]{0,63}$/
const TOPIC_RE = /^[a-z0-9][a-z0-9-]{0,49}$/
const UNSAFE_RE = /[\u0000-\u001f\u007f'`;|&$<>(){}[\]\\]/
const PER_PAGE = 12

export const name = 'plug-skills'

// 硬依赖：webServer 不存在（非 web profile）时 fiber 保持 PENDING，
// 不会产生任何副作用。其余服务在使用时通过 ctx.get() 惰性解析。
export const inject = ['webServer']

export function apply(ctx, config) {
  const webServer = ctx.webServer

  // ------------------------------------------------------------------ paths
  function dshHomeDir() {
    return typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
      ? process.env.DSH_HOME
      : join(homedir(), '.dsh')
  }
  function agentsHomeDir() {
    return typeof process.env.DSH_AGENTS_HOME === 'string' && process.env.DSH_AGENTS_HOME !== ''
      ? process.env.DSH_AGENTS_HOME
      : join(homedir(), '.agents')
  }
  function skillsRoots() {
    return [
      { key: 'dsh', label: '$DSH_HOME/skills', path: join(dshHomeDir(), 'skills') },
      { key: 'agents', label: '$DSH_AGENTS_HOME/skills', path: join(agentsHomeDir(), 'skills') },
    ]
  }

  // ------------------------------------------------------------- settings
  // 持久设置：{ proxy?: string, skills?: InstalledSkillRecord[] }
  function settingsPath() {
    return join(dshHomeDir(), SETTINGS_FILE)
  }
  function readSettings() {
    try {
      const parsed = JSON.parse(readFileSync(settingsPath(), 'utf8'))
      return parsed !== null && typeof parsed === 'object' && Array.isArray(parsed) === false ? parsed : {}
    } catch { return {} }
  }
  async function writeSettings(patchData) {
    const data = Object.assign(readSettings(), patchData)
    await writeFile(settingsPath(), JSON.stringify(data, null, 2) + '\n', 'utf8')
  }
  function installedSkillRecords() {
    const records = readSettings().skills
    return Array.isArray(records) ? records.filter((r) => r !== null && typeof r === 'object') : []
  }

  // ------------------------------------------------------------------ proxy
  // 代理来源优先级：持久设置（UI 写入）> 插件配置（patch config.proxy）>
  // 环境变量。值为 '' 表示显式强制直连。代理请求经由系统 curl 发出
  // （支持 http/https/socks5/socks5h/socks4），直连请求用 Node fetch。
  const configProxy = config !== null && typeof config === 'object' && typeof config.proxy === 'string'
    ? config.proxy.trim() : ''
  let persistedProxy // undefined = 未设置；'' = 强制直连；其余为代理 URL
  try {
    const persisted = readSettings()
    if (typeof persisted.proxy === 'string') persistedProxy = persisted.proxy
  } catch { /* 尚无持久设置 */ }

  async function saveProxySetting(value) {
    const data = readSettings()
    if (value === undefined) delete data.proxy
    else data.proxy = value
    await writeFile(settingsPath(), JSON.stringify(data, null, 2) + '\n', 'utf8')
  }

  const PROXY_SCHEME_RE = /^(https?|socks5h?|socks4a?):\/\/[^\s'"<>\\]+$/i
  const PROXY_ENV_KEYS = ['DSH_PLUG_SKILLS_PROXY', 'HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy', 'ALL_PROXY', 'all_proxy']

  function resolveProxy() {
    if (persistedProxy !== undefined) {
      return { proxy: persistedProxy, source: persistedProxy === '' ? '持久设置（强制直连）' : '持久设置' }
    }
    if (configProxy !== '') return { proxy: configProxy, source: '插件配置（patch config.proxy）' }
    for (const key of PROXY_ENV_KEYS) {
      const value = process.env[key]
      if (typeof value === 'string' && value.trim() !== '') return { proxy: value.trim(), source: '环境变量 ' + key }
    }
    return { proxy: '', source: '未配置（直连）' }
  }

  let curlOk
  function probeCurl() {
    if (curlOk !== undefined) return curlOk
    try {
      curlOk = spawnSync('curl', ['--version'], { timeout: 5000 }).status === 0
    } catch { curlOk = false }
    return curlOk
  }

  const GH_FETCH_TIMEOUT_MS = 30000
  const GH_FETCH_MAX_BYTES = 5 * 1024 * 1024
  const GH_FETCH_MAX_CHARS = 100000

  function curlFetch(url, proxy) {
    return new Promise((resolvePromise, rejectPromise) => {
      const args = [
        '-sS', '-L',
        '--max-time', '30',
        '--connect-timeout', '10',
        '--max-filesize', String(GH_FETCH_MAX_BYTES),
        '-x', proxy,
        '-H', 'User-Agent: dsh-plug-skills/0.1',
        '-H', 'Accept: application/vnd.github+json, application/json;q=0.9, */*;q=0.8',
        '-w', '\n__DSH_PLUG_SKILLS_STATUS__:%{http_code}',
        url,
      ]
      let child
      try {
        child = spawn('curl', args, { stdio: ['ignore', 'pipe', 'pipe'] })
      } catch (error) {
        rejectPromise(new Error('无法启动 curl：' + (error instanceof Error ? error.message : String(error))))
        return
      }
      const chunks = []
      let bytes = 0
      let stderrText = ''
      let settled = false
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        if (settled !== true) { settled = true; rejectPromise(new Error('GitHub 请求超时（代理 ' + proxy + '）：' + url)) }
      }, 35000)
      child.stdout.on('data', (chunk) => {
        bytes += chunk.length
        if (bytes > GH_FETCH_MAX_BYTES + 1024) {
          child.kill('SIGKILL')
          if (settled !== true) { settled = true; clearTimeout(timer); rejectPromise(new Error('GitHub 响应过大：' + url)) }
          return
        }
        chunks.push(chunk)
      })
      child.stderr.on('data', (chunk) => { stderrText = (stderrText + chunk.toString('utf8')).slice(-1000) })
      child.on('error', (error) => {
        if (settled !== true) { settled = true; clearTimeout(timer); rejectPromise(new Error('curl 调用失败：' + error.message)) }
      })
      child.on('close', (code) => {
        if (settled === true) return
        settled = true
        clearTimeout(timer)
        if (code !== 0) {
          const hints = { 5: '无法解析代理', 7: '无法连接代理', 28: '超时', 35: 'TLS 错误', 56: '接收失败', 60: 'SSL 证书错误', 63: '响应超过大小上限' }
          const hint = hints[code] !== undefined ? '（' + hints[code] + '）' : ''
          const detail = stderrText.trim() !== '' ? stderrText.trim() : 'curl 退出码 ' + code
          rejectPromise(new Error('代理请求失败' + hint + '：' + detail))
          return
        }
        const text = Buffer.concat(chunks).toString('utf8')
        const marker = '\n__DSH_PLUG_SKILLS_STATUS__:'
        const at = text.lastIndexOf(marker)
        const statusText = at >= 0 ? text.slice(at + marker.length).trim() : ''
        const body = at >= 0 ? text.slice(0, at) : text
        const status = Number(statusText)
        resolvePromise({ status: Number.isFinite(status) === true && status > 0 ? status : 200, body })
      })
    })
  }

  /** 直连抓取（Node fetch），返回 { status, body }。 */
  async function directFetch(url) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), GH_FETCH_TIMEOUT_MS)
    let res
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'user-agent': 'dsh-plug-skills/0.1',
          'accept': 'application/vnd.github+json, application/json;q=0.9, */*;q=0.8',
        },
      })
    } catch (error) {
      if (error !== null && typeof error === 'object' && error.name === 'AbortError') {
        throw new Error('GitHub 请求超时（' + GH_FETCH_TIMEOUT_MS + 'ms）：' + url)
      }
      throw new Error('GitHub 请求失败：' + url + ' — ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      clearTimeout(timer)
    }
    const reader = res.body.getReader()
    const chunks = []
    let bytes = 0
    for (;;) {
      const part = await reader.read()
      if (part.done === true) break
      bytes += part.value.byteLength
      if (bytes > GH_FETCH_MAX_BYTES) {
        await reader.cancel()
        throw new Error('GitHub 响应过大（超过 ' + GH_FETCH_MAX_BYTES + ' 字节）：' + url)
      }
      chunks.push(part.value)
    }
    const merged = new Uint8Array(bytes)
    let offset = 0
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength }
    return { status: res.status, body: new TextDecoder('utf-8').decode(merged) }
  }

  /** 按生效代理选择通道：配置了代理走 curl，否则直连。 */
  async function httpGet(url) {
    const { proxy } = resolveProxy()
    if (proxy === '') return await directFetch(url)
    if (probeCurl() !== true) {
      throw new Error('已配置代理（' + proxy + '），但宿主未找到 curl，无法经代理访问；请安装 curl 或清除代理设置')
    }
    return await curlFetch(url, proxy)
  }

  async function ghFetch(url, maxChars = GH_FETCH_MAX_CHARS) {
    const { status, body } = await httpGet(url)
    if (status !== 200) {
      let hint = ''
      if (status === 403 || status === 429) hint = '——可能是 GitHub 搜索匿名限流（10 次/分钟），稍后再试'
      throw new Error('GitHub 返回 HTTP ' + status + hint + '（' + url + '）' + (body !== '' ? ' — ' + clip(body, 200) : ''))
    }
    if (body.length > maxChars) {
      throw new Error('GitHub 响应文本过长（超过 ' + maxChars + ' 字符）：' + url)
    }
    return body
  }
  async function ghJson(url, maxChars = GH_FETCH_MAX_CHARS) {
    const text = await ghFetch(url, maxChars)
    try { return JSON.parse(text) } catch (error) {
      if (error instanceof SyntaxError) throw new Error('来自 ' + url + ' 的 JSON 无效')
      throw error
    }
  }

  /**
   * 经 HTTPS 把远端文件下载到本地（代理走 curl -o，直连用 fetch）。
   * 与 GitHub API 请求共享代理配置；上限 SRC_MAX_BYTES、180 秒超时。
   */
  async function downloadToFile(url, destPath) {
    const { proxy } = resolveProxy()
    if (proxy !== '') {
      if (probeCurl() !== true) {
        throw new Error('已配置代理（' + proxy + '），但宿主未找到 curl，无法经代理下载')
      }
      await new Promise((resolvePromise, rejectPromise) => {
        const args = [
          '-x', proxy,
          '-sS', '-L',
          '--max-time', '180',
          '--connect-timeout', '15',
          '--max-filesize', String(SRC_MAX_BYTES),
          '-H', 'User-Agent: dsh-plug-skills/0.1',
          '-o', destPath,
          '-w', '%{http_code}',
          url,
        ]
        let child
        try {
          child = spawn('curl', args, { stdio: ['ignore', 'pipe', 'pipe'] })
        } catch (error) {
          rejectPromise(new Error('无法启动 curl：' + (error instanceof Error ? error.message : String(error))))
          return
        }
        let out = ''
        let stderrText = ''
        let settled = false
        const timer = setTimeout(() => {
          child.kill('SIGKILL')
          if (settled !== true) { settled = true; rejectPromise(new Error('下载超时（180 秒，代理 ' + proxy + '）：' + url)) }
        }, 190000)
        child.stdout.on('data', (chunk) => { out += chunk.toString('utf8') })
        child.stderr.on('data', (chunk) => { stderrText = (stderrText + chunk.toString('utf8')).slice(-1000) })
        child.on('error', (error) => {
          if (settled !== true) { settled = true; clearTimeout(timer); rejectPromise(new Error('curl 调用失败：' + error.message)) }
        })
        child.on('close', (code) => {
          if (settled === true) return
          settled = true
          clearTimeout(timer)
          const status = Number(out.trim())
          if (code === 0 && status === 200) { resolvePromise(); return }
          const hints = { 5: '无法解析代理', 7: '无法连接代理', 28: '超时', 35: 'TLS 错误', 56: '接收失败', 60: 'SSL 证书错误', 63: '响应超过大小上限' }
          const hint = hints[code] !== undefined ? '（' + hints[code] + '）' : ''
          const detail = stderrText.trim() !== '' ? stderrText.trim() : 'curl 退出码 ' + code
          rejectPromise(new Error('下载失败' + hint + '：HTTP ' + (Number.isFinite(status) === true && status > 0 ? status : '未知') + ' — ' + detail))
        })
      })
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 180000)
    try {
      const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
      if (res.status !== 200) throw new Error('下载失败：HTTP ' + res.status + ' — ' + url)
      const declared = Number(res.headers.get('content-length') ?? '0')
      if (declared > SRC_MAX_BYTES) throw new Error('源码包过大（超过 50 MB）：' + url)
      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.byteLength > SRC_MAX_BYTES) throw new Error('源码包过大（超过 50 MB）：' + url)
      await writeFile(destPath, buffer)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('下载超时（180 秒）：' + url)
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * 并发竞速抓取 README 候选：raw.githubusercontent.com 在部分网络下会
   * 间歇性挂起，串行尝试会把等待时间乘以候选数；并发后最坏只耗一次超时。
   */
  async function fetchReadme(fullName, branch) {
    const candidates = ['README.md', 'readme.md', 'README.zh.md', 'README']
    const attempts = candidates.map(async (candidate) => {
      const text = await ghFetch(GH_RAW + '/' + fullName + '/' + branch + '/' + candidate)
      return { candidate, text }
    })
    const results = await Promise.allSettled(attempts)
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === 'fulfilled') return { name: candidates[i], text: result.value.text }
    }
    return { name: '', text: '' }
  }

  // ---------------------------------------------------------------- helpers
  function clip(value, max) {
    if (typeof value !== 'string') return ''
    return value.length > max ? value.slice(0, max) + ' …[已截断]' : value
  }
  function safeArg(value, label) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 300) {
      throw new Error(label + '：应为非空字符串（最多 300 字符）')
    }
    if (UNSAFE_RE.test(value) === true) throw new Error(label + '：包含不支持的字符')
    return value
  }

  /** SKILL.md frontmatter 解析：`---` 包围的 YAML 头（容错：失败返回空对象）。 */
  function parseFrontmatter(text) {
    if (typeof text !== 'string') return {}
    const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)
    if (m === null) return {}
    try {
      const parsed = yaml.load(m[1])
      return parsed !== null && typeof parsed === 'object' && Array.isArray(parsed) === false ? parsed : {}
    } catch { return {} }
  }
  function frontmatterString(meta, ...keys) {
    for (const key of keys) {
      const value = meta[key]
      if (typeof value === 'string' && value.trim() !== '') return value.trim()
    }
    return ''
  }

  // ------------------------------------------------------------- skills local
  /** 扫描本地技能根目录（$DSH_HOME/skills 与 $DSH_AGENTS_HOME/skills）。 */
  function scanLocalSkills() {
    const records = installedSkillRecords()
    const skills = []
    for (const root of skillsRoots()) {
      let entries
      try {
        entries = readdirSync(root.path, { withFileTypes: true })
      } catch { continue }
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (entry.name.startsWith('.') === true) continue
        let skillFile = ''
        if (entry.isDirectory() === true) {
          if (existsSync(join(root.path, entry.name, 'SKILL.md')) === true) skillFile = join(root.path, entry.name, 'SKILL.md')
        } else if (entry.isFile() === true && entry.name.endsWith('.md') === true) {
          skillFile = join(root.path, entry.name)
        }
        if (skillFile === '') continue
        let text = ''
        try { text = readFileSync(skillFile, 'utf8') } catch { continue }
        const meta = parseFrontmatter(text)
        let mtime = 0
        try { mtime = Math.round(statSync(skillFile).mtimeMs) } catch { /* 忽略 */ }
        const record = records.find((r) => r.root === root.key && r.dir === entry.name)
        skills.push({
          root: root.key,
          rootLabel: root.label,
          dir: entry.name,
          path: skillFile,
          name: frontmatterString(meta, 'name'),
          description: clip(frontmatterString(meta, 'description'), 300),
          whenToUse: clip(frontmatterString(meta, 'whenToUse', 'when_to_use'), 200),
          invocation: frontmatterString(meta, 'invocation'),
          mtime,
          managed: record !== undefined,
          source: record !== undefined && typeof record.source === 'string' ? record.source : '',
          installedAt: record !== undefined && typeof record.installedAt === 'number' ? record.installedAt : 0,
        })
      }
    }
    return skills
  }

  /** 校验技能目标目录名。 */
  function assertSkillDirName(value) {
    if (typeof value !== 'string' || SKILL_DIR_RE.test(value) === false) {
      throw new Error('无效的技能目录名：' + value + '（应为 1-64 个字母 / 数字 / . _ -）')
    }
    if (value === '.' || value === '..') throw new Error('无效的技能目录名：' + value)
    return value
  }

  /**
   * 安装技能：下载仓库 tarball → 解压 → 复制选中的技能目录到
   * $DSH_HOME/skills。全部预检通过后才复制（冲突时整体失败）。
   */
  async function installSkills(fullName, ref, picks, force) {
    if (REPO_RE.test(fullName) === false) throw new Error('无效的仓库名：' + fullName)
    if (picks.length === 0) throw new Error('未选择任何技能')
    for (const pick of picks) {
      if (pick.path !== '.' && SKILL_PATH_RE.test(pick.path) === false) throw new Error('无效的技能路径：' + pick.path)
      assertSkillDirName(pick.dir)
    }
    let resolvedRef = ref
    if (resolvedRef === '') {
      try {
        const repo = await ghJson(GH_API + '/repos/' + fullName)
        resolvedRef = typeof repo.default_branch === 'string' && repo.default_branch !== '' ? repo.default_branch : 'main'
      } catch {
        resolvedRef = 'main'
      }
    }
    const root = skillsRoots()[0].path
    mkdirSync(root, { recursive: true })
    // 预检冲突
    if (force !== true) {
      const conflicts = picks.filter((pick) => existsSync(join(root, pick.dir)) === true).map((pick) => pick.dir)
      if (conflicts.length > 0) {
        throw new Error('目标目录已存在：' + conflicts.join('、') + '（如需覆盖安装请勾选「覆盖」）')
      }
    }
    const srcRoot = join(dshHomeDir(), SRC_DIR_NAME)
    mkdirSync(srcRoot, { recursive: true })
    const dirName = fullName.replace('/', '--') + '-' + Date.now()
    const dir = join(srcRoot, dirName)
    const tarball = join(srcRoot, dirName + '.tar.gz')
    const candidates = [GH_CODELOAD + '/' + fullName + '/tar.gz/' + resolvedRef]
    if (resolvedRef.indexOf('/') !== -1) candidates.push(GH_CODELOAD + '/' + fullName + '/tar.gz/refs/heads/' + resolvedRef)
    try {
      let lastError = null
      for (const url of candidates) {
        try { await downloadToFile(url, tarball); lastError = null; break } catch (error) { lastError = error }
      }
      if (lastError !== null) {
        throw new Error('源码下载失败：' + (lastError instanceof Error ? lastError.message : String(lastError)) + '。若网络受限，请配置 GitHub 代理后重试。')
      }
      mkdirSync(dir, { recursive: true })
      const tar = spawnSync('tar', ['-xzf', tarball, '-C', dir, '--strip-components=1'], { timeout: 120000 })
      if (tar.status !== 0) throw new Error('解压失败（tar 退出码 ' + tar.status + '）')
      // 预检每个选中路径都含 SKILL.md
      for (const pick of picks) {
        const skillDir = pick.path === '.' ? dir : join(dir, pick.path)
        if (existsSync(join(skillDir, 'SKILL.md')) === false) {
          throw new Error('仓库中未找到技能：' + pick.path + '（该目录下没有 SKILL.md）')
        }
      }
      const installed = []
      const records = installedSkillRecords()
      for (const pick of picks) {
        const skillDir = pick.path === '.' ? dir : join(dir, pick.path)
        const target = join(root, pick.dir)
        if (force === true && existsSync(target) === true) rmSync(target, { recursive: true, force: true })
        await cp(skillDir, target, { recursive: true, dereference: false, errorOnExist: false })
        const record = {
          root: 'dsh', dir: pick.dir,
          source: 'github:' + fullName + '@' + resolvedRef,
          path: pick.path, installedAt: Date.now(),
        }
        const existing = records.findIndex((r) => r.root === record.root && r.dir === record.dir)
        if (existing !== -1) records[existing] = record
        else records.push(record)
        installed.push(record)
      }
      await writeSettings({ skills: records })
      return { installed, ref: resolvedRef }
    } finally {
      rmSync(tarball, { force: true })
      rmSync(dir, { recursive: true, force: true })
    }
  }

  /** 移除本地技能（仅限用户技能根目录内的条目）。 */
  async function removeSkill(rootKey, dirName) {
    const root = skillsRoots().find((r) => r.key === rootKey)
    if (root === undefined) throw new Error('未知技能根：' + rootKey)
    if (SKILL_DIR_RE.test(dirName) === false || dirName === '.' || dirName === '..') {
      throw new Error('无效的技能目录名：' + dirName)
    }
    const target = resolve(root.path, dirName)
    if (target.startsWith(resolve(root.path) + '/') === false) {
      throw new Error('技能目录越界：' + dirName)
    }
    if (existsSync(target) === false) throw new Error('技能不存在：' + target)
    await rm(target, { recursive: true, force: true })
    const records = installedSkillRecords().filter((r) => (r.root === rootKey && r.dir === dirName) === false)
    await writeSettings({ skills: records })
    return { removed: target }
  }

  // ------------------------------------------------------------- discovery
  function trimRepo(item) {
    return {
      fullName: String(item.full_name ?? ''),
      url: String(item.html_url ?? ''),
      description: typeof item.description === 'string' ? item.description.slice(0, 300) : '',
      stars: typeof item.stargazers_count === 'number' ? item.stargazers_count : 0,
      language: typeof item.language === 'string' ? item.language : '',
      updatedAt: String(item.updated_at ?? ''),
      archived: item.archived === true,
      fork: item.fork === true,
      owner: item.owner !== null && typeof item.owner === 'object'
        ? { login: String(item.owner.login ?? ''), avatar: String(item.owner.avatar_url ?? '') }
        : { login: '', avatar: '' },
    }
  }

  /** 详情：递归树扫描 SKILL.md 并解析每个技能的 frontmatter。 */
  async function inspectSkillRepo(fullName, branch) {
    let tree = []
    let treeError = ''
    try {
      // 大型技能 monorepo 的递归树 JSON 可达数百 KB，单独放宽字符上限。
      const data = await ghJson(GH_API + '/repos/' + fullName + '/git/trees/' + encodeURIComponent(branch) + '?recursive=1', 3000000)
      tree = Array.isArray(data.tree) ? data.tree : []
    } catch (error) {
      treeError = error instanceof Error ? error.message : String(error)
    }
    const dirs = []
    const seen = new Set()
    for (const item of tree) {
      if (item === null || typeof item !== 'object' || item.type !== 'blob') continue
      const p = typeof item.path === 'string' ? item.path : ''
      let dir = ''
      if (p === 'SKILL.md') dir = '.'
      else if (p.endsWith('/SKILL.md') === true) dir = p.slice(0, -'/SKILL.md'.length)
      else continue
      if (seen.has(dir) === true) continue
      seen.add(dir)
      const segments = dir === '.' ? [] : dir.split('/')
      if (segments.some((seg) => seg.startsWith('.') === true || seg === 'node_modules') === true) continue
      dirs.push(dir)
      if (dirs.length >= 30) break
    }
    const skills = await Promise.all(dirs.slice(0, 16).map(async (dir) => {
      const rawPath = dir === '.' ? 'SKILL.md' : dir + '/SKILL.md'
      let meta = {}
      let bodyChars = 0
      try {
        const text = await ghFetch(GH_RAW + '/' + fullName + '/' + branch + '/' + rawPath.split('/').map(encodeURIComponent).join('/'))
        meta = parseFrontmatter(text)
        bodyChars = text.length
      } catch { /* 单个技能读取失败不阻塞整体 */ }
      return {
        path: dir,
        suggestedDir: dir === '.' ? basename(fullName) : basename(dir),
        name: frontmatterString(meta, 'name'),
        description: clip(frontmatterString(meta, 'description'), 300),
        invocation: frontmatterString(meta, 'invocation'),
        bodyChars,
      }
    }))
    return { skills, truncated: dirs.length > 16, treeError }
  }

  // --------------------------------------------------- 本地 JSON API 路由
  function sendJson(res, value) {
    const body = JSON.stringify(value)
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(body)
  }
  function route(path, fn) {
    webServer.register({
      kind: 'exact',
      path,
      handler: async (req, res) => {
        try {
          const params = new URL(req.url ?? '/', 'http://plug-skills.local').searchParams
          sendJson(res, await fn(params))
        } catch (error) {
          sendJson(res, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
      },
    })
  }

  route('/plug-skills/search', async (params) => {
    const topicRaw = (params.get('topic') ?? '').trim()
    const topic = topicRaw !== '' && TOPIC_RE.test(topicRaw) === true ? topicRaw : 'agent-skills'
    const query = (params.get('query') ?? '').trim().slice(0, 100)
    const sortRaw = params.get('sort') ?? ''
    const sort = sortRaw === 'stars' || sortRaw === 'updated' ? sortRaw : ''
    const pageRaw = Number(params.get('page') ?? '1')
    const page = Number.isInteger(pageRaw) === true && pageRaw > 0 && pageRaw <= 100 ? pageRaw : 1
    let queryText = 'topic:' + topic
    if (query !== '') queryText += ' ' + query
    let url = GH_API + '/search/repositories?q=' + encodeURIComponent(queryText) + '&per_page=' + PER_PAGE + '&page=' + page + '&order=desc'
    if (sort !== '') url += '&sort=' + sort
    const data = await ghJson(url)
    const items = Array.isArray(data.items) ? data.items : []
    return { ok: true, topic, total: typeof data.total_count === 'number' ? data.total_count : items.length, page, perPage: PER_PAGE, repos: items.map(trimRepo) }
  })

  route('/plug-skills/repo', async (params) => {
    const fullName = params.get('fullName') ?? ''
    if (REPO_RE.test(fullName) === false) return { ok: false, error: '无效的仓库名：' + fullName }
    const repo = await ghJson(GH_API + '/repos/' + fullName)
    const branch = typeof repo.default_branch === 'string' && repo.default_branch !== '' ? repo.default_branch : 'main'
    const { name: readmeName, text: readmeRaw } = await fetchReadme(fullName, branch)
    const readme = readmeRaw
    const inspected = await inspectSkillRepo(fullName, branch)
    return Object.assign({
      ok: true,
      repo: {
        fullName,
        branch,
        url: typeof repo.html_url === 'string' ? repo.html_url : 'https://github.com/' + fullName,
        description: typeof repo.description === 'string' ? repo.description.slice(0, 300) : '',
        stars: typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0,
        forks: typeof repo.forks_count === 'number' ? repo.forks_count : 0,
        openIssues: typeof repo.open_issues_count === 'number' ? repo.open_issues_count : 0,
        topics: Array.isArray(repo.topics) ? repo.topics.filter((t) => typeof t === 'string').slice(0, 20) : [],
        license: repo.license !== null && typeof repo.license === 'object' && typeof repo.license.spdx_id === 'string' ? repo.license.spdx_id : '',
        homepage: typeof repo.homepage === 'string' ? repo.homepage : '',
        createdAt: String(repo.created_at ?? ''),
        updatedAt: String(repo.updated_at ?? ''),
        archived: repo.archived === true,
      },
      readme: { name: readmeName, text: clip(readme, 20000), truncated: readme.length > 20000 },
    }, inspected)
  })

  route('/plug-skills/local', async () => {
    return {
      ok: true,
      dshHome: dshHomeDir(),
      skillsRoots: skillsRoots().map((r) => ({ key: r.key, label: r.label, path: r.path })),
      skills: scanLocalSkills(),
    }
  })

  route('/plug-skills/install', async (params) => {
    const fullName = safeArg(params.get('fullName') ?? '', 'fullName')
    const refRaw = params.get('ref') ?? ''
    const ref = refRaw === '' ? '' : safeArg(refRaw, 'ref')
    const pathsParam = params.get('paths') ?? ''
    const namesParam = params.get('names') ?? ''
    if (pathsParam === '') return { ok: false, error: '缺少 paths 参数' }
    const paths = pathsParam.split(',').map((s) => s.trim()).filter((s) => s !== '')
    const names = namesParam.split(',').map((s) => s.trim())
    if (paths.length === 0 || paths.length > 16) return { ok: false, error: 'paths 数量应为 1-16' }
    const picks = paths.map((path, i) => ({
      path,
      dir: names[i] !== undefined && names[i] !== '' ? names[i] : (path === '.' ? basename(fullName) : basename(path)),
    }))
    const force = params.get('force') === '1'
    const result = await installSkills(fullName, ref, picks, force)
    return {
      ok: true,
      message: '已安装 ' + result.installed.length + ' 个技能到 ' + join(dshHomeDir(), 'skills') + '（skill-filesystem 热加载，无需重启）',
      installed: result.installed,
    }
  })

  route('/plug-skills/remove', async (params) => {
    const rootKey = params.get('root') ?? 'dsh'
    const dirName = params.get('dir') ?? ''
    const result = await removeSkill(rootKey, dirName)
    return { ok: true, message: '已移除技能：' + result.removed + '（热加载，立即生效）' }
  })

  route('/plug-skills/proxy', async (params) => {
    const set = params.get('set')
    if (typeof set === 'string') {
      const value = set.trim()
      let toSave
      if (value === 'direct') toSave = ''
      else {
        if (value === '') return { ok: false, error: '请提供代理地址，或使用 direct 强制直连' }
        if (value.length > 300) return { ok: false, error: '代理地址过长（最多 300 字符）' }
        if (PROXY_SCHEME_RE.test(value) === false) {
          return { ok: false, error: '不支持的代理格式：' + value + '（应为 http://、https://、socks5://、socks5h:// 或 socks4:// 开头）' }
        }
        toSave = value
      }
      try {
        await saveProxySetting(toSave)
        persistedProxy = toSave
      } catch (error) {
        return { ok: false, error: '保存代理设置失败：' + (error instanceof Error ? error.message : String(error)) }
      }
    } else if (params.get('clear') !== null) {
      try {
        await saveProxySetting(undefined)
        persistedProxy = undefined
      } catch (error) {
        return { ok: false, error: '清除代理设置失败：' + (error instanceof Error ? error.message : String(error)) }
      }
    }
    const current = resolveProxy()
    return { ok: true, proxy: current.proxy, source: current.source, curl: probeCurl() }
  })

  route('/plug-skills/proxy-test', async () => {
    const current = resolveProxy()
    const startedAt = Date.now()
    try {
      const { status, body } = await httpGet(GH_API + '/zen')
      return {
        ok: status === 200,
        status,
        latencyMs: Date.now() - startedAt,
        proxy: current.proxy,
        source: current.source,
        text: clip(body, 100),
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        latencyMs: Date.now() - startedAt,
        proxy: current.proxy,
        source: current.source,
      }
    }
  })
}
