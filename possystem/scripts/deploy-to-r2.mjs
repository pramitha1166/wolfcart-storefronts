/**
 * Deploys the built dist/ folder directly to Cloudflare R2 as the base storefront template.
 * Target path in R2: templates/common/latest/
 *
 * Usage: node scripts/deploy-to-r2.mjs
 * Or via npm: npm run deploy
 *
 * Requires .env.deploy in the template root with R2 credentials.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── Load .env.deploy manually (no dotenv dep needed) ──────────────────────
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv(path.join(ROOT, '.env.deploy'))

// ── Validate required env vars ─────────────────────────────────────────────
const required = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_BUCKET_NAME',
]
const missing = required.filter((k) => !process.env[k])
if (missing.length) {
  console.error(`\n❌  Missing env vars in .env.deploy:\n   ${missing.join('\n   ')}`)
  console.error('\nCopy .env.deploy.example → .env.deploy and fill in your values.\n')
  process.exit(1)
}

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME
const BASE_PREFIX = 'templates/common/latest/'
const DIST_DIR = path.join(ROOT, 'dist')

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

// ── MIME type map ──────────────────────────────────────────────────────────
const MIME = {
  html: 'text/html', css: 'text/css', js: 'application/javascript',
  mjs: 'application/javascript', json: 'application/json',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon',
  woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf',
  otf: 'font/otf', txt: 'text/plain', xml: 'text/xml', map: 'application/json',
}

function mime(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? 'application/octet-stream'
}

// ── Collect all files in dist/ recursively ────────────────────────────────
function collectFiles(dir, base = dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, base))
    } else {
      const rel = path.relative(base, full).replace(/\\/g, '/')
      // skip config.js — injected per-merchant at provision time
      if (rel !== 'config.js') results.push(rel)
    }
  }
  return results
}

async function main() {
  console.log('\n🐺  WolfCart — Deploy Template to R2')
  console.log('═══════════════════════════════════════')

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌  dist/ not found. Run "npm run build" first.')
    process.exit(1)
  }

  const files = collectFiles(DIST_DIR)
  console.log(`📦  ${files.length} files to upload → ${BUCKET}/${BASE_PREFIX}`)

  // 1. Delete all existing files at the base prefix
  console.log('\n🗑   Removing old template files from R2…')
  let deleted = 0
  let continuationToken

  do {
    const listRes = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: BASE_PREFIX,
      ContinuationToken: continuationToken,
    }))

    const keys = (listRes.Contents ?? []).map((o) => ({ Key: o.Key }))
    if (keys.length) {
      await r2.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: keys } }))
      deleted += keys.length
    }
    continuationToken = listRes.IsTruncated ? listRes.NextContinuationToken : undefined
  } while (continuationToken)

  console.log(`   Deleted ${deleted} old file(s)`)

  // 2. Upload all dist/ files
  console.log('\n⬆   Uploading new template files…')
  let uploaded = 0

  await Promise.all(
    files.map(async (rel) => {
      const body = fs.readFileSync(path.join(DIST_DIR, rel))
      const key = `${BASE_PREFIX}${rel}`
      await r2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: mime(rel),
      }))
      uploaded++
      process.stdout.write(`\r   ${uploaded}/${files.length} uploaded…`)
    })
  )

  console.log(`\n\n✅  Done! ${uploaded} files uploaded to R2.`)
  console.log(`\n   Base template path : ${BASE_PREFIX}`)
  console.log(`   New storefronts    : will use this template automatically`)
  console.log(`   Existing stores    : merchant clicks "Sync" in Dashboard → Your Store\n`)
}

main().catch((err) => {
  console.error('\n❌  Deploy failed:', err.message)
  process.exit(1)
})
