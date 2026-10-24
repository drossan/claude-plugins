#!/usr/bin/env node
// Check de enlaces del portal a GitHub (CU portal-enlaces-github).
//
// VitePress solo valida enlaces internos; este script comprueba que cada enlace
// `https://github.com/drossan/claude-plugins/(blob|tree)/main/<ruta>[#ancla]` de los .md
// publicados de `website/` apunta a una ruta y a un ancla que existen en el árbol LOCAL.
// Sin red, sin dependencias, solo lectura. Corre solo (`node website/scripts/check-github-links.mjs`)
// y encadenado en `pnpm docs:build`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MIN_NODE = 18
const WEBSITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = path.resolve(WEBSITE_DIR, '..')
const SKIP_DIRS = new Set(['node_modules', 'dist', 'cache'])

/** Texto sin BOM ni CRLF. */
const normalizeText = (text) => text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')

/** Abre/cierra bloques de código (``` o ~~~, longitud ≥ 3); un bloque sin cerrar llega al final. */
function fenceTracker() {
  let open = null
  return (line) => {
    if (open) {
      const m = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/)
      if (m && m[1][0] === open.char && m[1].length >= open.len) open = null
      return true
    }
    const m = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (m) {
      open = { char: m[1][0], len: m[1].length }
      return true
    }
    return false
  }
}

/** Líneas de `text` con el contenido de los bloques de código vaciado (conserva los números de línea). */
function stripFences(text) {
  const inFence = fenceTracker()
  return normalizeText(text)
    .split('\n')
    .map((line) => (inFence(line) ? '' : line))
}

/** Slug de un heading estilo GitHub (sin soporte del sufijo -N de duplicados). */
export function slug(heading) {
  const clean = heading
    .replace(/[ \t]+#+[ \t]*$/, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*]/g, '')
  return clean
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
}

/** Conjunto de slugs de los headings ATX de un .md (sin front matter ni bloques de código). */
export function headingSlugs(text) {
  const lines = normalizeText(text).split('\n')
  let start = 0
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1)
    if (end !== -1) start = end + 1
  }
  const inFence = fenceTracker()
  const slugs = new Set()
  for (const line of lines.slice(start)) {
    if (inFence(line)) continue
    const m = line.match(/^ {0,3}#{1,6}[ \t]+(.+?)[ \t]*$/)
    if (m) slugs.add(slug(m[1]))
  }
  return slugs
}

/** Convierte un patrón de srcExclude (`**​/X`, `X`, `*`) en una RegExp sobre rutas relativas con `/`. */
function globToRegExp(glob) {
  const body = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '(?:.*/)?')
  return new RegExp(`^${body}$`)
}

/** Lee `srcExclude` como TEXTO de config.mts (importarlo exigiría vitepress). Falla si no se interpreta. */
function readSrcExclude() {
  const config = path.join(WEBSITE_DIR, '.vitepress', 'config.mts')
  let text
  try {
    text = readFileSync(config, 'utf8')
  } catch (e) {
    throw new Error(`no se puede leer ${config}: ${e.message}`)
  }
  const m = text.match(/srcExclude\s*:\s*\[([^\]]*)\]/)
  const globs = m ? [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]) : []
  if (!m || globs.length === 0) {
    throw new Error(`no se puede interpretar srcExclude en ${config}; no se revisan todos los .md en silencio`)
  }
  return globs.map(globToRegExp)
}

function collectMarkdown(dir, excluded, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || SKIP_DIRS.has(name)) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      collectMarkdown(full, excluded, out)
    } else if (name.endsWith('.md')) {
      const rel = path.relative(WEBSITE_DIR, full).split(path.sep).join('/')
      if (!excluded.some((re) => re.test(rel))) out.push({ full, rel })
    }
  }
  return out
}

/** ¿Existe `rel` (relativa a la raíz del repo) distinguiendo mayúsculas, como GitHub? */
function existsExactCase(rel) {
  let current = REPO_ROOT
  for (const part of rel.split('/').filter(Boolean)) {
    let names
    try {
      names = readdirSync(current)
    } catch {
      return false
    }
    if (!names.includes(part)) return false
    current = path.join(current, part)
  }
  return true
}

const LINE_ANCHOR = /^L\d+(C\d+)?(-L\d+(C\d+)?)?$/

/** Valida una URL; devuelve el motivo del fallo o null. */
function checkUrl(rest, cache) {
  const hashAt = rest.indexOf('#')
  const rawAnchor = hashAt === -1 ? '' : rest.slice(hashAt + 1)
  const rawPath = (hashAt === -1 ? rest : rest.slice(0, hashAt)).split('?')[0]

  let decodedPath
  try {
    decodedPath = decodeURIComponent(rawPath)
  } catch {
    return 'ruta con codificación % inválida'
  }
  const normalized = path.posix.normalize(decodedPath || '.')
  if (normalized.startsWith('..') || path.posix.isAbsolute(normalized)) return 'la ruta sale del repo'
  const relPath = normalized === '.' ? '' : normalized.replace(/\/$/, '')
  if (!existsExactCase(relPath)) return `la ruta no existe: ${relPath || '/'}`

  if (!rawAnchor || LINE_ANCHOR.test(rawAnchor)) return null
  if (!relPath.endsWith('.md') || !statSync(path.join(REPO_ROOT, relPath)).isFile()) return null
  let anchor
  try {
    anchor = decodeURIComponent(rawAnchor).toLowerCase()
  } catch {
    return `ancla con codificación % inválida: #${rawAnchor}`
  }
  if (!cache.has(relPath)) cache.set(relPath, headingSlugs(readFileSync(path.join(REPO_ROOT, relPath), 'utf8')))
  return cache.get(relPath).has(anchor) ? null : `el ancla #${rawAnchor} no existe en ${relPath}`
}

function main() {
  const major = Number(process.versions.node.split('.')[0])
  if (major < MIN_NODE) {
    console.error(`check-github-links: requiere Node >= ${MIN_NODE} (actual ${process.versions.node}).`)
    return 1
  }

  const urlRe = new RegExp('https://github\\.com/drossan/claude-plugins/(?:blob|tree)/main/([^\\s)"\'<>\\]`]*)', 'g')
  let files
  try {
    files = collectMarkdown(WEBSITE_DIR, readSrcExclude())
  } catch (e) {
    console.error(`check-github-links: ${e.message}`)
    return 1
  }

  const cache = new Map()
  const failures = []
  let total = 0
  let withAnchor = 0
  for (const { full, rel } of files) {
    const seen = new Set()
    stripFences(readFileSync(full, 'utf8')).forEach((line, i) => {
      for (const m of line.matchAll(urlRe)) {
        const rest = m[1].replace(/[.,;:!?]+$/, '')
        total++
        if (rest.includes('#') && !rest.endsWith('#')) withAnchor++
        const reason = checkUrl(rest, cache)
        const key = `${rest}|${reason}`
        if (reason && !seen.has(key)) {
          seen.add(key)
          failures.push(`${rel}:${i + 1}  ${m[0].replace(/[.,;:!?]+$/, '')}  ${reason}`)
        }
      }
    })
  }

  if (total === 0) {
    console.error('check-github-links: no se encontró ningún enlace a GitHub; una extracción rota no puede pasar por verde.')
    return 1
  }
  if (failures.length) {
    console.error(`check-github-links: ${failures.length} enlace(s) roto(s):\n${failures.map((f) => `  ${f}`).join('\n')}`)
    return 1
  }
  console.log(`check-github-links: OK — ${total} enlaces (${withAnchor} con ancla) en ${files.length} ficheros.`)
  return 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main())
}
