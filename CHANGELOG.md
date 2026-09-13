# Changelog

## [0.1.3] - 2026-09-13

### Security

- **修复 `/plug-skills/*` 全部 7 个路由缺少鉴权（未授权访问）**
  `route()` 注册的 exact 路由此前既不做鉴权，也不校验 `Host`/`Origin`。本机任意进程
  （或经 DNS rebinding 的网页）无需任何凭据即可：
  - `GET /plug-skills/local` 读取 `$DSH_HOME` 路径、技能根目录与已装技能清单；
  - `GET /plug-skills/install` 将 GitHub 仓库写入 `$DSH_HOME/skills` 并热加载（可植入技能）；
  - `GET /plug-skills/remove` 删除已安装技能；
  - `GET /plug-skills/proxy` 改写持久化代理设置（并可用 `set=` 把出网改道到任意代理）；
  - `GET /plug-skills/search`、`/repo`、`/proxy-test` 让宿主代为出网请求 GitHub。

  现在 `route()` 统一复用 dsh 连接服务的 `connection.requestRejection(req)`，即
  `/api` 通道同一套围栏：Host 非回环/`trustedHosts` → 403，`Sec-Fetch-Site: cross-site`
  或 `Origin` 与 Host 不符 → 403，无有效签名 Cookie → 401。**缺少 `connection` 服务时默认拒绝（403）**，
  不再静默放开。一处改动覆盖全部 7 个路由。

### Added

- `security-test.mjs`：离线安全回归测试，覆盖未鉴权 401、Host 不可信 403、cross-site 403、
  缺少 `connection` 服务 403、已鉴权放行，以及**未鉴权调用不得产生副作用**（不写代理设置、
  不写技能目录、不删技能）。

### Changed

- `smoke-test.mjs`：假 ctx 补上 `connection` 模拟（默认已鉴权，保持原有用例语义）；
  `callRoute()` 增加鉴权/Host/跨站选项。

### Notes

- `/plug-skills/proxy` 仍是 GET 改状态，本次仅补鉴权、未改接口语义（改为 POST 会破坏 `client.js`）；
  如需进一步加固，建议后续把它拆成「GET 读 / POST 写」。
