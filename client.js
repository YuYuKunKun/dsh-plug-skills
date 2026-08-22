window.__ModuleLoader__.load({
	id: "dsh-plug-skills",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const h = React.createElement;

		const CSS = [
			".sk-root{display:flex;flex-direction:column;gap:16px;padding:20px;max-width:980px;margin:0 auto;color:var(--dsw-alias-label-primary,#111);font-size:13px;line-height:1.5;}",
			".sk-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}",
			".sk-input{flex:1;min-width:160px;padding:7px 10px;border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111);font-size:13px;outline:none;}",
			".sk-input:focus{border-color:var(--dsw-alias-brand-primary,#4a6cf7);}",
			".sk-input.small{flex:0 1 180px;min-width:120px;}",
			".sk-select{padding:7px 10px;border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111);}",
			".sk-btn{padding:6px 12px;border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111);cursor:pointer;font-size:12px;white-space:nowrap;text-decoration:none;display:inline-block;}",
			".sk-btn:hover{border-color:var(--dsw-alias-border-l2,#bbb);}",
			".sk-btn.primary{background:var(--dsw-alias-bg-base,#fff);border-color:var(--dsw-alias-border-l2,#bbb);color:var(--dsw-alias-label-primary,#111);font-weight:600;}",
			".sk-btn.primary:hover{border-color:var(--dsw-alias-label-primary,#111);}",
			".sk-btn.danger{color:var(--dsw-alias-state-error-primary,#d33);}",
			".sk-btn.ghost{background:transparent;border-color:transparent;color:var(--dsw-alias-label-secondary,#666);}",
			".sk-btn:disabled{opacity:.5;cursor:default;}",
			".sk-btn:active:not(:disabled){transform:translateY(1px);}",
			".sk-note{border:1px solid var(--dsw-alias-border-l1,#e5e5e5);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);padding:10px 14px;display:flex;flex-direction:column;gap:4px;}",
			".sk-muted{color:var(--dsw-alias-label-secondary,#777);font-size:12px;}",
			".sk-error{color:var(--dsw-alias-state-error-primary,#d33);background:rgba(192,57,43,.06);border:1px solid rgba(192,57,43,.25);border-radius:8px;padding:8px 12px;white-space:pre-wrap;word-break:break-all;}",
			".sk-success{color:var(--dsw-alias-state-success-primary,#2a9d4a);background:rgba(30,126,52,.07);border:1px solid rgba(30,126,52,.25);border-radius:8px;padding:8px 12px;white-space:pre-wrap;word-break:break-all;}",
			".sk-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;background:var(--dsw-alias-bg-layer-2,#f7f7f7);border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:6px;padding:2px 6px;word-break:break-all;}",
			".sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px;}",
			".sk-card{border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);padding:14px;display:flex;flex-direction:column;gap:8px;}",
			".sk-card-head{display:flex;gap:8px;align-items:center;}",
			".sk-avatar{width:22px;height:22px;border-radius:6px;flex:none;}",
			".sk-name{font-weight:600;font-size:13px;word-break:break-all;color:var(--dsw-alias-brand-primary,#4a6cf7);cursor:pointer;}",
			".sk-card-title{font-weight:600;font-size:13px;word-break:break-all;}",
			".sk-card-desc{color:var(--dsw-alias-label-secondary,#666);font-size:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:18px;}",
			".sk-badges{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}",
			".sk-badge{font-size:11px;border:1px solid var(--dsw-alias-border-l1,#e0e0e0);border-radius:20px;padding:1px 8px;color:var(--dsw-alias-label-secondary,#666);background:var(--dsw-alias-bg-layer-2,#fafafa);white-space:nowrap;}",
			".sk-badge.warn{color:var(--dsw-alias-state-warn-primary,#c8860a);border-color:currentColor;}",
			".sk-badge.ok{color:var(--dsw-alias-state-success-primary,#2a9d4a);border-color:currentColor;}",
			".sk-pager{display:flex;gap:8px;align-items:center;justify-content:center;}",
			".sk-spacer{flex:1;}",
			".sk-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:flex-start;justify-content:center;z-index:1200;padding:4vh 16px;animation:sk-fade .18s ease-out;}",
			".sk-modal{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:14px;max-width:860px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 16px 48px rgba(0,0,0,.28);animation:sk-pop .22s ease-out;}",
			".sk-modal.small{max-width:460px;}",
			"@keyframes sk-fade{from{opacity:0}to{opacity:1}}",
			"@keyframes sk-pop{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}",
			".sk-modal-head{display:flex;flex-direction:column;gap:8px;padding:16px 20px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);}",
			".sk-modal-body{overflow:auto;padding:16px 20px;display:flex;flex-direction:column;gap:14px;}",
			".sk-modal-foot{padding:12px 20px;border-top:1px solid var(--dsw-alias-border-l1,#eee);display:flex;gap:8px;align-items:center;flex-wrap:wrap;}",
			".sk-loading{display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px 0;}",
			".sk-spin{width:34px;height:34px;border-radius:50%;border:3px solid var(--dsw-alias-border-l2,#bbb);border-top-color:var(--dsw-alias-label-primary,#111);animation:sk-rotate .9s linear infinite;}",
			"@keyframes sk-rotate{to{transform:rotate(360deg)}}",
			".sk-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}",
			".sk-col{display:flex;flex-direction:column;gap:6px;}",
			".sk-label{font-size:12px;color:var(--dsw-alias-label-secondary,#666);}",
			".sk-skill-item{display:flex;gap:8px;align-items:flex-start;border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:8px;padding:8px 10px;}",
			".sk-skill-item .sk-col{flex:1;min-width:0;}",
			".sk-readme{max-height:min(62vh,640px);overflow:auto;background:var(--dsw-alias-bg-layer-2,#f7f7f7);border:1px solid var(--dsw-alias-border-l1,#ddd);border-radius:8px;padding:14px;}",
			".sk-html{display:flex;flex-direction:column;gap:8px;}",
			".sk-html img,.sk-md img{max-width:100%;}",
			".sk-md{font-size:13px;line-height:1.65;word-break:break-word;color:var(--dsw-alias-label-primary,#222);}",
			".sk-md h1{font-size:1.35em;margin:.6em 0 .4em;padding-bottom:.25em;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e5e5);}",
			".sk-md h2{font-size:1.2em;margin:.7em 0 .4em;padding-bottom:.2em;border-bottom:1px solid var(--dsw-alias-border-l1,#e5e5e5);}",
			".sk-md h3{font-size:1.08em;margin:.6em 0 .3em;}",
			".sk-md h4,.sk-md h5,.sk-md h6{font-size:1em;margin:.5em 0 .3em;color:var(--dsw-alias-label-secondary,#555);}",
			".sk-md p{margin:.45em 0;}",
			".sk-md a{color:var(--dsw-alias-brand-primary,#4a6cf7);text-decoration:none;}",
			".sk-md a:hover{text-decoration:underline;}",
			".sk-md code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l1,#e5e5e5);border-radius:4px;padding:.08em .35em;}",
			".sk-md pre{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l1,#e5e5e5);border-radius:8px;padding:10px;overflow:auto;margin:.5em 0;}",
			".sk-md pre code{background:transparent;border:none;padding:0;font-size:11px;white-space:pre;}",
			".sk-md blockquote{margin:.5em 0;padding:.2em .8em;border-left:3px solid var(--dsw-alias-border-l2,#ccc);color:var(--dsw-alias-label-secondary,#666);}",
			".sk-md ul,.sk-md ol{margin:.4em 0;padding-left:1.6em;}",
			".sk-md li{margin:.15em 0;}",
			".sk-md img{max-width:100%;border-radius:6px;margin:.2em 0;}",
			".sk-md hr{border:none;border-top:1px solid var(--dsw-alias-border-l1,#e5e5e5);margin:1em 0;}",
			".sk-md-table{border-collapse:collapse;margin:.6em 0;font-size:12px;display:block;overflow-x:auto;max-width:100%;}",
			".sk-md-table th,.sk-md-table td{border:1px solid var(--dsw-alias-border-l1,#ddd);padding:4px 10px;}",
			".sk-md-table th{background:var(--dsw-alias-bg-layer-1,#fff);}",
			".sk-section-title{font-size:13px;font-weight:600;display:flex;gap:8px;align-items:center;flex-wrap:wrap;}",
		].join("\n");

		function rpc(path, params) {
			const entries = [];
			if (params) {
				for (const key of Object.keys(params)) {
					const value = params[key];
					if (value === undefined || value === null || value === "") continue;
					entries.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
				}
			}
			const url = "/plug-skills/" + path + (entries.length > 0 ? "?" + entries.join("&") : "");
			return fetch(url, { headers: { accept: "application/json" } }).then((res) => {
				if (!res.ok) return { ok: false, error: "请求 /plug-skills/" + path + " 返回 HTTP " + res.status };
				return res.json();
			});
		}

		function errMsg(error) {
			if (error === null || error === undefined) return "未知错误";
			if (typeof error === "string") return error;
			if (typeof error.message === "string") return error.message;
			return String(error);
		}

		function sanitizeDir(name) {
			let out = String(name ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^\.+/, "");
			if (out === "") out = "skill";
			return out.slice(0, 64);
		}

		function fmtDate(iso) {
			if (typeof iso !== "string" || iso === "") return "";
			return iso.slice(0, 10);
		}

		// ------------------------------------------------------- Markdown 渲染
		// 迷你 Markdown → React 元素渲染器（与 dsh-plug-manager 同源）：不插入
		// 任何原始 HTML，文本一律经 React 转义，链接只放行 http(s)/锚点。
		// README 中的内联 / 块级 HTML 经 DOMParser 解析 + 白名单净化后转成
		// React 元素；支持链接图片 `[![alt](img)](url)`（徽章/统计图常用）。
		const MD_HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
		const MD_HR_RE = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
		const MD_FENCE_RE = /^(`{3,}|~{3,})\s*([A-Za-z0-9_+#.-]*)\s*$/;
		const MD_LIST_RE = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
		const MD_QUOTE_RE = /^ {0,3}>\s?(.*)$/;
		const MD_TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}[^\s|]*\s*(\|\s*:?-{2,}[^\s|]*\s*)*\|?\s*$/;

		function mdSafeUrl(url) {
			if (typeof url !== "string") return null;
			const u = url.trim();
			if (/^https?:\/\//i.test(u)) return u;
			if (u.startsWith("#")) return u;
			return null;
		}

		function mdSplitTableRow(line) {
			let t = line.trim();
			if (t.startsWith("|")) t = t.slice(1);
			if (t.endsWith("|")) t = t.slice(0, -1);
			return t.split("|").map((c) => c.trim());
		}

		// ---- README 中的 HTML：DOMParser 解析 + 白名单净化后转 React 元素 ----
		const HTML_DROP_TAGS = { script: 1, style: 1, iframe: 1, frame: 1, frameset: 1, object: 1, embed: 1, link: 1, meta: 1, base: 1, form: 1, input: 1, textarea: 1, select: 1, button: 1, svg: 1, math: 1, template: 1, title: 1, noscript: 1, applet: 1, area: 1, map: 1 };
		const HTML_ALLOWED_TAGS = { a: 1, abbr: 1, b: 1, blockquote: 1, br: 1, caption: 1, center: 1, code: 1, dd: 1, del: 1, details: 1, div: 1, dl: 1, dt: 1, em: 1, figcaption: 1, figure: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, hr: 1, i: 1, img: 1, ins: 1, kbd: 1, li: 1, mark: 1, ol: 1, p: 1, picture: 1, pre: 1, q: 1, s: 1, samp: 1, small: 1, source: 1, span: 1, strike: 1, strong: 1, sub: 1, summary: 1, sup: 1, table: 1, tbody: 1, td: 1, tfoot: 1, th: 1, thead: 1, tr: 1, u: 1, ul: 1, var: 1 };
		const HTML_VOID_TAGS = { br: 1, hr: 1, img: 1, source: 1 };
		const HTML_ALLOWED_ATTRS = { align: 1, alt: 1, colspan: 1, height: 1, rowspan: 1, start: 1, title: 1, valign: 1, width: 1 };
		const HTML_BLOCK_START_RE = /^\s*<(div|p|table|ul|ol|dl|blockquote|pre|figure|details|section|article|picture|center|summary|nav|header|footer|aside|main|h[1-6]|hr|br|img)([\s/>]|$)/i;

		function domNodeToReact(node, key, resolveImage) {
			if (node.nodeType === 3) {
				const text = node.nodeValue.replace(/\s+/g, " ");
				if (text === "" || text === " ") return null;
				return mdInline(text, key, resolveImage);
			}
			if (node.nodeType !== 1) return null;
			const tag = node.tagName.toLowerCase();
			if (HTML_DROP_TAGS[tag] === 1) return null;
			if (HTML_ALLOWED_TAGS[tag] !== 1) return domChildrenToReact(node, key, resolveImage);
			const props = { key };
			for (let ai = 0; ai < node.attributes.length; ai++) {
				const attr = node.attributes[ai];
				const name = attr.name.toLowerCase();
				const value = attr.value;
				if (typeof value !== "string" || value.length > 2000) continue;
				if (name === "href") {
					const u = mdSafeUrl(value);
					if (u !== null) props.href = u;
				} else if (name === "src") {
					const u = resolveImage(value);
					if (u !== null) props.src = u;
				} else if (HTML_ALLOWED_ATTRS[name] === 1 && value.length <= 200) {
					props[name] = value;
				}
			}
			if (tag === "a") {
				if (props.href === undefined) return domChildrenToReact(node, key, resolveImage);
				props.target = "_blank";
				props.rel = "noreferrer noopener";
			}
			if (tag === "img") {
				if (props.src === undefined) return null;
				props.loading = "lazy";
				return h("img", props);
			}
			if (HTML_VOID_TAGS[tag] === 1) return h(tag, props);
			return h(tag, props, domChildrenToReact(node, key, resolveImage));
		}
		function domChildrenToReact(parent, keyBase, resolveImage) {
			const out = [];
			for (let ni = 0; ni < parent.childNodes.length; ni++) {
				const converted = domNodeToReact(parent.childNodes[ni], keyBase + "-" + ni, resolveImage);
				if (converted !== null) out.push(converted);
			}
			return out;
		}
		function renderHtmlChunk(html, keyBase, resolveImage) {
			try {
				const doc = new DOMParser().parseFromString(html, "text/html");
				return domChildrenToReact(doc.body, keyBase, resolveImage);
			} catch (e) {
				return [html];
			}
		}

		function mdInline(text, keyBase, resolveImage) {
			const patterns = [
				{ re: /`([^`]+)`/, type: "code" },
				{ re: /\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/, type: "imglink" },
				{ re: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/, type: "img" },
				{ re: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/, type: "link" },
				{ re: /\*\*([\s\S]+?)\*\*/, type: "bold" },
				{ re: /__([\s\S]+?)__/, type: "bold" },
				{ re: /~~([\s\S]+?)~~/, type: "strike" },
				{ re: /\*([^*\n]+)\*/, type: "italic" },
				{ re: /(^|[\s(])_([^_\n]+)_(?=[\s).,!?:;]|$)/, type: "italic2" },
				{ re: /<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*)?\s*\/?>/, type: "html" },
			];
			const nodes = [];
			let rest = text;
			let k = 0;
			while (rest.length > 0) {
				let best = null;
				for (const p of patterns) {
					const m = p.re.exec(rest);
					if (m !== null && (best === null || m.index < best.m.index || (m.index === best.m.index && m[0].length > best.m[0].length))) {
						best = { p, m };
					}
				}
				if (best === null) { nodes.push(rest); break; }
				const p = best.p;
				const m = best.m;
				if (m.index > 0) nodes.push(rest.slice(0, m.index));
				const kk = keyBase + "-" + (k++);
				let extraSkip = 0;
				if (p.type === "code") {
					nodes.push(h("code", { key: kk }, m[1]));
				} else if (p.type === "imglink") {
					const imgSrc = resolveImage(m[2]);
					const href = mdSafeUrl(m[3]);
					if (imgSrc !== null && href !== null) {
						nodes.push(h("a", { key: kk, href, target: "_blank", rel: "noreferrer noopener" }, h("img", { src: imgSrc, alt: m[1], loading: "lazy" })));
					} else if (imgSrc !== null) {
						nodes.push(h("img", { key: kk, src: imgSrc, alt: m[1], loading: "lazy" }));
					} else {
						nodes.push(m[1] !== "" ? m[1] : m[0]);
					}
				} else if (p.type === "img") {
					const src = resolveImage(m[2]);
					if (src !== null) nodes.push(h("img", { key: kk, src, alt: m[1], loading: "lazy" }));
					else nodes.push(m[1] !== "" ? m[1] : m[0]);
				} else if (p.type === "link") {
					const href = mdSafeUrl(m[2]);
					if (href !== null) nodes.push(h("a", { key: kk, href, target: "_blank", rel: "noreferrer noopener" }, mdInline(m[1], kk, resolveImage)));
					else nodes.push(m[1]);
				} else if (p.type === "bold") {
					nodes.push(h("strong", { key: kk }, mdInline(m[1], kk, resolveImage)));
				} else if (p.type === "strike") {
					nodes.push(h("del", { key: kk }, mdInline(m[1], kk, resolveImage)));
				} else if (p.type === "italic") {
					nodes.push(h("em", { key: kk }, mdInline(m[1], kk, resolveImage)));
				} else if (p.type === "html") {
					const tagNameMatch = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(m[0]);
					const tagName = tagNameMatch !== null ? tagNameMatch[1].toLowerCase() : "";
					const isClosing = m[0].charAt(0) === "<" && m[0].charAt(1) === "/";
					const selfClosing = /\/\s*>$/.test(m[0]) || HTML_VOID_TAGS[tagName] === 1;
					if (isClosing) {
						nodes.push(m[0]);
					} else if (selfClosing) {
						nodes.push(h(React.Fragment, { key: kk }, renderHtmlChunk(m[0], kk, resolveImage)));
					} else {
						const closeRe = new RegExp("</" + tagName + "\\s*>", "i");
						const after = rest.slice(m.index + m[0].length);
						const cm = closeRe.exec(after);
						if (cm !== null) {
							const chunk = m[0] + after.slice(0, cm.index) + cm[0];
							nodes.push(h(React.Fragment, { key: kk }, renderHtmlChunk(chunk, kk, resolveImage)));
							extraSkip = cm.index + cm[0].length;
						} else {
							nodes.push(h(React.Fragment, { key: kk }, renderHtmlChunk(m[0], kk, resolveImage)));
						}
					}
				} else {
					nodes.push(m[1]);
					nodes.push(h("em", { key: kk }, mdInline(m[2], kk, resolveImage)));
				}
				rest = rest.slice(m.index + m[0].length + extraSkip);
			}
			return nodes;
		}

		function mdBuildList(items, keyBase, resolveImage) {
			function build(from, indent) {
				const ordered = items[from].ordered;
				const lis = [];
				let idx = from;
				while (idx < items.length) {
					const it = items[idx];
					if (it.indent < indent) break;
					if (it.indent > indent) {
						const sub = build(idx, it.indent);
						if (lis.length === 0) lis.push(h("li", { key: keyBase + "-x" + idx }, sub.el));
						else {
							const last = lis[lis.length - 1];
							const prev = Array.isArray(last.props.children) ? last.props.children : [last.props.children];
							lis[lis.length - 1] = h("li", { key: last.key }, prev.concat(sub.el));
						}
						idx = sub.idx;
						continue;
					}
					lis.push(h("li", { key: keyBase + "-" + idx }, mdInline(it.text, keyBase + "-" + idx, resolveImage)));
					idx++;
				}
				return { el: h(ordered ? "ol" : "ul", { key: keyBase + "-l" + from }, lis), idx };
			}
			return build(0, items[0].indent).el;
		}

		function renderMarkdown(text, resolveImage) {
			const lines = String(text).split(/\r?\n/);
			const blocks = [];
			let i = 0;
			let key = 0;
			while (i < lines.length) {
				const line = lines[i];
				if (line.trim() === "") { i++; continue; }
				const fence = MD_FENCE_RE.exec(line);
				if (fence !== null) {
					const closer = new RegExp("^" + fence[1].slice(0, 3) + "+\\s*$");
					const buf = [];
					i++;
					while (i < lines.length && !closer.test(lines[i])) { buf.push(lines[i]); i++; }
					i++;
					blocks.push(h("pre", { key: "b" + (key++) }, h("code", null, buf.join("\n"))));
					continue;
				}
				const hd = MD_HEADING_RE.exec(line);
				if (hd !== null) {
					blocks.push(h("h" + hd[1].length, { key: "b" + (key++) }, mdInline(hd[2], "hd" + key, resolveImage)));
					i++;
					continue;
				}
				if (MD_HR_RE.test(line)) { blocks.push(h("hr", { key: "b" + (key++) })); i++; continue; }
				if (MD_QUOTE_RE.test(line)) {
					const buf = [];
					while (i < lines.length && lines[i].trim() !== "") {
						const qm = MD_QUOTE_RE.exec(lines[i]);
						if (qm === null) break;
						buf.push(qm[1]);
						i++;
					}
					blocks.push(h("blockquote", { key: "b" + (key++) }, renderMarkdown(buf.join("\n"), resolveImage)));
					continue;
				}
				if (line.indexOf("|") !== -1 && i + 1 < lines.length && lines[i + 1].indexOf("|") !== -1 && lines[i + 1].indexOf("-") !== -1 && MD_TABLE_SEP_RE.test(lines[i + 1])) {
					const header = mdSplitTableRow(line);
					i += 2;
					const rows = [];
					while (i < lines.length && lines[i].indexOf("|") !== -1 && lines[i].trim() !== "") { rows.push(mdSplitTableRow(lines[i])); i++; }
					blocks.push(h("table", { key: "b" + (key++), className: "sk-md-table" },
						h("thead", null, h("tr", null, header.map((c, ci) => h("th", { key: ci }, mdInline(c, "th" + key + "-" + ci, resolveImage))))),
						h("tbody", null, rows.map((r, ri) => h("tr", { key: ri }, r.map((c, ci) => h("td", { key: ci }, mdInline(c, "td" + key + "-" + ri + "-" + ci, resolveImage)))))),
					));
					continue;
				}
				if (MD_LIST_RE.test(line)) {
					const items = [];
					while (i < lines.length) {
						const m2 = MD_LIST_RE.exec(lines[i]);
						if (m2 === null) {
							if (/^\s{2,}\S/.test(lines[i]) && items.length > 0) {
								items[items.length - 1].text += " " + lines[i].trim();
								i++;
								continue;
							}
							break;
						}
						items.push({ indent: m2[1].replace(/\t/g, "  ").length, ordered: /^\d/.test(m2[2]), text: m2[3] });
						i++;
					}
					blocks.push(mdBuildList(items, "ls" + (key++), resolveImage));
					continue;
				}
				if (line.trim().startsWith("<!--")) {
					while (i < lines.length && lines[i].indexOf("-->") === -1) i++;
					i++;
					continue;
				}
				if (HTML_BLOCK_START_RE.test(line)) {
					const rootTagMatch = /^\s*<([a-zA-Z][a-zA-Z0-9-]*)/.exec(line);
					const rootTag = rootTagMatch !== null ? rootTagMatch[1].toLowerCase() : "";
					const chunk = [line];
					i++;
					if (HTML_VOID_TAGS[rootTag] !== 1 && /\/\s*>$/.test(line.trim()) === false && rootTag !== "") {
						const openRe = new RegExp("<" + rootTag + "(?=[\\s/>])", "gi");
						const closeRe = new RegExp("</" + rootTag + "\\s*>", "gi");
						let depth = 0;
						for (let ci = 0; ci < chunk.length; ci++) {
							depth += (chunk[ci].match(openRe) || []).length;
							depth -= (chunk[ci].match(closeRe) || []).length;
						}
						while (i < lines.length && depth > 0 && chunk.length < 400) {
							chunk.push(lines[i]);
							depth += (lines[i].match(openRe) || []).length;
							depth -= (lines[i].match(closeRe) || []).length;
							i++;
						}
					}
					blocks.push(h("div", { key: "b" + (key++), className: "sk-html" }, renderHtmlChunk(chunk.join("\n"), "html" + key, resolveImage)));
					continue;
				}
				const buf = [line];
				i++;
				while (i < lines.length && lines[i].trim() !== "" && !MD_HEADING_RE.test(lines[i]) && !MD_FENCE_RE.test(lines[i]) && !MD_HR_RE.test(lines[i]) && !MD_QUOTE_RE.test(lines[i]) && !MD_LIST_RE.test(lines[i]) && !HTML_BLOCK_START_RE.test(lines[i])) {
					buf.push(lines[i]);
					i++;
				}
				blocks.push(h("p", { key: "b" + (key++) }, mdInline(buf.join(" "), "p" + key, resolveImage)));
			}
			return h("div", { className: "sk-md" }, blocks);
		}

		function readmeResolveImage(repo) {
			return (src) => {
				if (/^https?:\/\//i.test(src)) return src;
				if (/^(data|javascript|vbscript):/i.test(src)) return null;
				if (src.startsWith("#")) return null;
				return "https://raw.githubusercontent.com/" + repo.fullName + "/" + repo.branch + "/" + src.replace(/^\.\//, "");
			};
		}

		// ------------------------------------------------------------- 组件
		function ProxyPanel() {
			const [state, setState] = React.useState(null);
			const [value, setValue] = React.useState("");
			const [busy, setBusy] = React.useState(false);
			const [test, setTest] = React.useState("");
			const [error, setError] = React.useState("");

			function refresh() {
				rpc("proxy").then((r) => {
					if (r && r.ok) { setState(r); setError(""); }
					else setError(errMsg(r && r.error));
				}).catch((e) => setError(errMsg(e)));
			}
			React.useEffect(() => { refresh(); }, []);

			function applyProxy(clear) {
				setBusy(true); setError("");
				const params = clear === true ? { clear: "1" } : { set: value.trim() };
				rpc("proxy", params).then((r) => {
					setBusy(false);
					if (r && r.ok) { setState(r); setValue(""); }
					else setError(errMsg(r && r.error));
				}).catch((e) => { setBusy(false); setError(errMsg(e)); });
			}
			function testProxy() {
				setBusy(true); setTest(""); setError("");
				rpc("proxy-test").then((r) => {
					setBusy(false);
					if (r && r.ok === true) setTest("连通正常（" + r.latencyMs + "ms，" + r.source + "）");
					else setTest("连接失败：" + errMsg(r && r.error) + "（" + r.source + "）");
				}).catch((e) => { setBusy(false); setTest("连接失败：" + errMsg(e)); });
			}

			return h("div", { className: "sk-note" },
				h("div", { className: "sk-row" },
					h("span", { className: "sk-label" }, "GitHub 代理："),
					state !== null
						? h("span", { className: "sk-code" }, state.proxy === "" ? "直连" : state.proxy, "（" + state.source + "）")
						: h("span", { className: "sk-muted" }, "加载中…"),
					h("span", { className: "sk-muted" }, state !== null && state.curl === false ? "⚠ 宿主缺少 curl，代理不可用" : ""),
				),
				h("div", { className: "sk-row" },
					h("input", {
						className: "sk-input small",
						style: { flex: "1 1 260px" },
						placeholder: "http://127.0.0.1:7890（支持 http/https/socks5/socks5h/socks4；direct 强制直连）",
						value: value,
						onChange: (e) => setValue(e.target.value),
					}),
					h("button", { className: "sk-btn", disabled: busy, onClick: () => applyProxy(false) }, "应用"),
					h("button", { className: "sk-btn", disabled: busy, onClick: () => applyProxy(true) }, "清除"),
					h("button", { className: "sk-btn", disabled: busy, onClick: testProxy }, "测试连接"),
				),
				error !== "" ? h("div", { className: "sk-error" }, error) : null,
				test !== "" ? h("div", { className: "sk-muted" }, test) : null,
			);
		}

		function RepoCard(props) {
			const repo = props.repo;
			return h("div", { className: "sk-card" },
				h("div", { className: "sk-card-head" },
					repo.owner.avatar !== "" ? h("img", { className: "sk-avatar", src: repo.owner.avatar, alt: "" }) : null,
					h("span", { className: "sk-name", title: "查看详情", onClick: () => props.onOpen(repo.fullName) }, repo.fullName),
				),
				h("div", { className: "sk-card-desc" }, repo.description !== "" ? repo.description : "（无描述）"),
				h("div", { className: "sk-badges" },
					h("span", { className: "sk-badge" }, "★ " + repo.stars),
					repo.language !== "" ? h("span", { className: "sk-badge" }, repo.language) : null,
					repo.fork === true ? h("span", { className: "sk-badge" }, "fork") : null,
					repo.archived === true ? h("span", { className: "sk-badge warn" }, "已归档") : null,
					h("span", { className: "sk-badge" }, fmtDate(repo.updatedAt)),
				),
				h("div", { className: "sk-row" },
					h("button", { className: "sk-btn primary", onClick: () => props.onOpen(repo.fullName) }, "详情 / 安装"),
					h("a", { className: "sk-btn", href: repo.url, target: "_blank", rel: "noreferrer noopener" }, "GitHub ↗"),
				),
			);
		}

		function ConfirmDialog(props) {
			React.useEffect(() => {
				const onKey = (e) => { if (e.key === "Escape") props.onCancel(); };
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, []);
			return h("div", { className: "sk-overlay", onClick: props.onCancel },
				h("div", { className: "sk-modal small", onClick: (e) => e.stopPropagation() },
					h("div", { className: "sk-modal-head" },
						h("div", { className: "sk-section-title" }, props.title),
						h("div", { className: "sk-muted", style: { whiteSpace: "pre-wrap" } }, props.message),
					),
					h("div", { className: "sk-modal-foot" },
						h("button", { className: "sk-btn danger", disabled: props.busy === true, onClick: props.onConfirm }, props.confirmLabel ?? "确认"),
						h("button", { className: "sk-btn", onClick: props.onCancel }, "取消"),
					),
				),
			);
		}

		function SkillInstallPanel(props) {
			const detail = props.detail;
			const skills = Array.isArray(detail.skills) ? detail.skills : [];
			const localDirs = new Set(props.localSkills.map((s) => s.dir));
			const [checked, setChecked] = React.useState(() => {
				const init = {};
				skills.forEach((s) => { init[s.path] = true; });
				return init;
			});
			const [names, setNames] = React.useState(() => {
				const init = {};
				skills.forEach((s) => { init[s.path] = sanitizeDir(s.suggestedDir); });
				return init;
			});
			const [force, setForce] = React.useState(false);
			const [busy, setBusy] = React.useState(false);
			const [message, setMessage] = React.useState(null);

			if (skills.length === 0) {
				return h("div", { className: "sk-muted" },
					"未在该仓库中发现 SKILL.md 技能包。" + (detail.treeError !== "" && detail.treeError !== undefined ? "（树扫描失败：" + detail.treeError + "）" : ""),
					"该仓库可能不是技能仓库，或技能放在未推送的分支上。");
			}

			const selected = skills.filter((s) => checked[s.path] === true);
			const conflictCount = selected.filter((s) => localDirs.has(names[s.path])).length;

			function install() {
				if (selected.length === 0) return;
				setBusy(true); setMessage(null);
				rpc("install", {
					fullName: detail.repo.fullName,
					ref: detail.repo.branch,
					paths: selected.map((s) => s.path).join(","),
					names: selected.map((s) => names[s.path]).join(","),
					force: force === true ? "1" : undefined,
				}).then((r) => {
					setBusy(false);
					if (r && r.ok === true) { setMessage({ kind: "ok", text: r.message }); props.onChanged(); }
					else setMessage({ kind: "error", text: errMsg(r && r.error) });
				}).catch((e) => { setBusy(false); setMessage({ kind: "error", text: errMsg(e) }); });
			}

			return h(React.Fragment, null,
				h("div", { className: "sk-row" },
					h("span", { className: "sk-section-title" }, "发现 " + skills.length + " 个技能" + (detail.truncated === true ? "（仅显示前 16 个）" : "")),
					h("button", {
						className: "sk-btn ghost",
						onClick: () => {
							const all = skills.every((s) => checked[s.path] === true);
							const next = {};
							skills.forEach((s) => { next[s.path] = !all; });
							setChecked(next);
						},
					}, skills.every((s) => checked[s.path] === true) ? "全不选" : "全选"),
				),
				h("div", { className: "sk-col" },
					skills.map((s) => h("div", { className: "sk-skill-item", key: s.path },
						h("input", {
							type: "checkbox",
							checked: checked[s.path] === true,
							onChange: (e) => setChecked(Object.assign({}, checked, { [s.path]: e.target.checked })),
						}),
						h("div", { className: "sk-col" },
							h("div", { className: "sk-row" },
								h("strong", null, s.name !== "" ? s.name : s.path),
								h("span", { className: "sk-muted" }, s.path === "." ? "（仓库根目录）" : s.path),
							),
							s.description !== "" ? h("div", { className: "sk-muted" }, s.description) : null,
							h("div", { className: "sk-row" },
								h("span", { className: "sk-label" }, "安装为"),
								h("input", {
									className: "sk-input small",
									value: names[s.path] ?? "",
									onChange: (e) => setNames(Object.assign({}, names, { [s.path]: e.target.value })),
								}),
								localDirs.has(names[s.path]) === true
									? h("span", { className: "sk-badge warn" }, "已存在" + (force === true ? "（将覆盖）" : ""))
									: null,
							),
						),
					)),
				),
				h("div", { className: "sk-row" },
					h("label", { className: "sk-muted" },
						h("input", { type: "checkbox", checked: force, onChange: (e) => setForce(e.target.checked) }),
						" 覆盖同名技能",
					),
					h("span", { className: "sk-spacer" }),
					h("button", { className: "sk-btn primary", disabled: busy === true || selected.length === 0, onClick: install },
						busy === true ? "安装中…" : "安装选中的 " + selected.length + " 个技能"),
				),
				conflictCount > 0 && force === false
					? h("div", { className: "sk-error" }, "有 " + conflictCount + " 个目标目录与本地技能重名，勾选「覆盖同名技能」或修改「安装为」名称后才能安装。")
					: null,
				message !== null ? h("div", { className: message.kind === "ok" ? "sk-success" : "sk-error" }, message.text) : null,
				h("div", { className: "sk-muted" },
					"技能装入 ", h("span", { className: "sk-code" }, props.skillsRoot ?? "$DSH_HOME/skills"),
					"，skill-filesystem 热加载，装完立即生效，无需重启。技能是提示词级内容，只安装你信任的仓库。"),
			);
		}

		// 详情获取：弹窗打开即显示加载过程，成功 / 失败都在弹窗内呈现。
		function useRepoDetail(fullName) {
			const [data, setData] = React.useState(null);
			const [error, setError] = React.useState("");
			React.useEffect(() => {
				let alive = true;
				setData(null);
				setError("");
				rpc("repo", { fullName })
					.then((r) => {
						if (!alive) return;
						if (r && r.ok === true) setData(r);
						else setError(r && r.error ? r.error : "加载仓库详情失败");
					})
					.catch((e) => { if (alive) setError(errMsg(e)); });
				return () => { alive = false; };
			}, [fullName]);
			return { data, error };
		}

		function DetailModal(props) {
			const fullName = props.fullName;
			const state = useRepoDetail(fullName);
			React.useEffect(() => {
				const onKey = (e) => { if (e.key === "Escape") props.onClose(); };
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, []);
			let body;
			if (state.error !== "") {
				body = h("div", { className: "sk-error" }, "加载 GitHub 仓库详情失败：" + state.error);
			} else if (state.data === null) {
				body = h("div", { className: "sk-loading" },
					h("div", { className: "sk-spin" }),
					h("div", { className: "sk-muted" }, "正在加载仓库详情（元数据 / README / 技能树扫描）…"));
			} else {
				const detail = state.data;
				const repo = detail.repo;
				body = h(React.Fragment, null,
					h("div", { className: "sk-badges" },
						h("span", { className: "sk-badge" }, "★ " + repo.stars),
						h("span", { className: "sk-badge" }, "派生 " + repo.forks),
						repo.license !== "" ? h("span", { className: "sk-badge" }, repo.license) : null,
						repo.archived === true ? h("span", { className: "sk-badge warn" }, "已归档") : null,
						repo.topics.map((t) => h("span", { className: "sk-badge", key: t }, t)),
					),
					repo.description !== "" ? h("div", { className: "sk-muted" }, repo.description) : null,
					h(SkillInstallPanel, { detail, localSkills: props.localSkills, skillsRoot: props.skillsRoot, onChanged: props.onChanged }),
					h("hr", { style: { width: "100%", borderColor: "var(--dsw-alias-border-l1,#eee)" } }),
					detail.readme.text !== ""
						? h("div", { className: "sk-readme" }, renderMarkdown(detail.readme.text, readmeResolveImage(repo)))
						: h("div", { className: "sk-muted" }, "该仓库没有 README。"),
				);
			}
			return h("div", { className: "sk-overlay", onClick: props.onClose },
				h("div", { className: "sk-modal", onClick: (e) => e.stopPropagation() },
					h("div", { className: "sk-modal-head" },
						h("div", { className: "sk-row" },
							h("span", { className: "sk-card-title", style: { fontSize: 15 } }, fullName),
							h("span", { className: "sk-spacer" }),
							h("a", { className: "sk-btn", href: "https://github.com/" + fullName, target: "_blank", rel: "noreferrer noopener" }, "GitHub ↗"),
							h("button", { className: "sk-btn ghost", onClick: props.onClose }, "✕"),
						),
					),
					h("div", { className: "sk-modal-body" }, body),
				),
			);
		}

		const TOPICS = ["agent-skills", "dsh-skill", "claude-skills"];

		function SkillsMarketplace() {
			const [view, setView] = React.useState("discover");
			const [topic, setTopic] = React.useState(TOPICS[0]);
			const [query, setQuery] = React.useState("");
			const [sort, setSort] = React.useState("");
			const [page, setPage] = React.useState(1);
			const [result, setResult] = React.useState(null);
			const [loading, setLoading] = React.useState(false);
			const [error, setError] = React.useState("");
			const [selected, setSelected] = React.useState(null);
			const [local, setLocal] = React.useState(null);
			const [confirm, setConfirm] = React.useState(null);
			const [busy, setBusy] = React.useState(false);
			const [message, setMessage] = React.useState(null);

			function refreshLocal() {
				rpc("local").then((r) => {
					if (r && r.ok === true) { setLocal(r); setError(""); }
					else setError(errMsg(r && r.error));
				}).catch((e) => setError(errMsg(e)));
			}
			React.useEffect(() => { refreshLocal(); }, []);

			function search(nextPage, overrides) {
				setLoading(true); setError("");
				const targetPage = nextPage !== undefined ? nextPage : 1;
				const o = overrides ?? {};
				rpc("search", {
					topic: o.topic ?? topic,
					query: query.trim(),
					sort,
					page: targetPage,
				}).then((r) => {
					setLoading(false);
					if (r && r.ok === true) { setResult(r); setPage(r.page); }
					else setError(errMsg(r && r.error));
				}).catch((e) => { setLoading(false); setError(errMsg(e)); });
			}
			React.useEffect(() => { search(1); }, []);

			function act(fn) {
				setBusy(true); setMessage(null);
				fn().then((r) => {
					setBusy(false);
					setConfirm(null);
					if (r && r.ok === true) { setMessage({ kind: "ok", text: r.message }); refreshLocal(); }
					else setMessage({ kind: "error", text: errMsg(r && r.error) });
				}).catch((e) => { setBusy(false); setMessage({ kind: "error", text: errMsg(e) }); });
			}

			const localSkills = local !== null ? local.skills : [];
			const skillsRoot = local !== null && local.skillsRoots.length > 0 ? local.skillsRoots[0].path : undefined;
			const totalPages = result !== null ? Math.max(1, Math.ceil(Math.min(result.total, 1000) / result.perPage)) : 1;

			return h("div", { className: "sk-root" },
				h("div", { className: "sk-toolbar" },
					h("button", { className: "sk-btn" + (view === "discover" ? " primary" : ""), onClick: () => setView("discover") }, "发现"),
					h("button", { className: "sk-btn" + (view === "installed" ? " primary" : ""), onClick: () => setView("installed") }, "已安装"),
				),
				h(ProxyPanel, null),
				error !== "" ? h("div", { className: "sk-error" }, error) : null,
				message !== null ? h("div", { className: message.kind === "ok" ? "sk-success" : "sk-error" }, message.text) : null,

				view === "discover" ? h(React.Fragment, null,
					h("div", { className: "sk-toolbar" },
						h("select", { className: "sk-select", value: topic, onChange: (e) => { setTopic(e.target.value); setPage(1); search(1, { topic: e.target.value }); } },
							TOPICS.map((t) => h("option", { key: t, value: t }, "topic:" + t)),
						),
						h("input", {
							className: "sk-input",
							placeholder: "追加关键词（可选）…",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							onKeyDown: (e) => { if (e.key === "Enter") search(1); },
						}),
						h("select", { className: "sk-select", value: sort, onChange: (e) => setSort(e.target.value) },
							h("option", { value: "" }, "最佳匹配"),
							h("option", { value: "stars" }, "最多 Star"),
							h("option", { value: "updated" }, "最近更新"),
						),
						h("button", { className: "sk-btn primary", disabled: loading, onClick: () => search(1) }, loading ? "搜索中…" : "搜索"),
					),
					result !== null
						? h(React.Fragment, null,
							h("div", { className: "sk-muted" }, "共 " + result.total + " 个仓库（topic:" + result.topic + "，第 " + result.page + " 页）"),
							h("div", { className: "sk-grid" }, result.repos.map((repo) => h(RepoCard, { key: repo.fullName, repo, onOpen: setSelected }))),
							result.repos.length === 0 ? h("div", { className: "sk-muted" }, "没有匹配的仓库。") : null,
							h("div", { className: "sk-pager" },
								h("button", { className: "sk-btn", disabled: page <= 1 || loading, onClick: () => search(page - 1) }, "上一页"),
								h("span", { className: "sk-muted" }, page + " / " + totalPages),
								h("button", { className: "sk-btn", disabled: page >= totalPages || loading, onClick: () => search(page + 1) }, "下一页"),
							),
						)
						: (loading === false ? h("div", { className: "sk-muted" }, "点击「搜索」开始发现。") : null),
				) : h(React.Fragment, null,
					h("div", { className: "sk-note" },
						h("div", null, "DSH 主目录：", h("span", { className: "sk-code" }, local !== null ? local.dshHome : "…")),
						h("div", null, "技能根目录：",
							(local !== null ? local.skillsRoots : []).map((r) => h("span", { className: "sk-code", key: r.key, style: { marginRight: 6 } }, r.label + "　"))),
						h("div", { className: "sk-muted" }, "技能为热加载：安装 / 移除后立即生效，无需重启。"),
					),
					h("div", { className: "sk-section-title" }, "本地技能（" + localSkills.length + "）",
						h("button", { className: "sk-btn", onClick: refreshLocal }, "刷新")),
					localSkills.length === 0
						? h("div", { className: "sk-muted" }, "尚未安装任何技能。去「发现」搜索 topic:agent-skills / dsh-skill 看看。")
						: null,
					h("div", { className: "sk-grid" },
						localSkills.map((s) => h("div", { className: "sk-card", key: s.root + ":" + s.dir },
							h("div", { className: "sk-card-head" },
								h("span", { className: "sk-card-title" }, s.name !== "" ? s.name : s.dir),
							),
							h("div", { className: "sk-card-desc" }, s.description !== "" ? s.description : "（无描述）"),
							h("div", { className: "sk-badges" },
								h("span", { className: "sk-badge" }, s.dir),
								h("span", { className: "sk-badge" }, s.rootLabel),
								s.managed === true ? h("span", { className: "sk-badge ok" }, "本插件安装") : null,
								s.source !== "" ? h("span", { className: "sk-badge" }, s.source) : null,
							),
							h("div", { className: "sk-row" },
								h("button", {
									className: "sk-btn danger",
									onClick: () => setConfirm({
										title: "移除技能 " + s.dir,
										message: "将删除目录 " + s.path + "（不可恢复）。确认移除？",
										confirmLabel: "删除",
										run: () => rpc("remove", { root: s.root, dir: s.dir }),
									}),
								}, "移除"),
							),
						))),
				),

				selected !== null
					? h(DetailModal, {
						fullName: selected,
						localSkills,
						skillsRoot,
						onClose: () => setSelected(null),
						onChanged: refreshLocal,
					})
					: null,
				confirm !== null
					? h(ConfirmDialog, {
						title: confirm.title,
						message: confirm.message,
						confirmLabel: confirm.confirmLabel,
						busy,
						onConfirm: () => act(confirm.run),
						onCancel: () => setConfirm(null),
					})
					: null,
			);
		}

		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-plug-skills";
				tag.dataset.pluginCss = "dsh-plug-skills/marketplace.css";
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => { tag.remove(); };
			}, "plug-skills: css");
			const slots = ctx.get("slots");
			if (slots === undefined) return;
			slots.inject("settings.plugins.tab", () => slots.register(
				{ name: "settings.plugins.tab", id: "skills-marketplace", order: 40, label: "Skills" },
				() => h(SkillsMarketplace, null),
			));
		}

		exports.apply = apply;
		return module.exports;
	}
});
