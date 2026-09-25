// Stand-in for the Redis commands the API uses. Local development only (npm run dev without
// Upstash credentials). Data is kept in memory and saved to .local-data/redis-dev.json,
// so bookings, chats and reviews survive restarting the dev server.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const FILE = join(process.cwd(), '.local-data', 'redis-dev.json')

const strings = new Map()
const hashes = new Map()
const lists = new Map()
const sortedSets = new Map()
const sets = new Map()
const expiries = new Map() // key -> timestamp (ms) for SET ... EX and EXPIRE

function load() {
  if (!existsSync(FILE)) return
  try {
    const data = JSON.parse(readFileSync(FILE, 'utf8'))
    for (const [key, value] of Object.entries(data.strings ?? {})) strings.set(key, value)
    for (const [key, value] of Object.entries(data.hashes ?? {})) hashes.set(key, new Map(Object.entries(value)))
    for (const [key, value] of Object.entries(data.lists ?? {})) lists.set(key, value)
    for (const [key, value] of Object.entries(data.sortedSets ?? {})) sortedSets.set(key, new Map(Object.entries(value)))
    for (const [key, value] of Object.entries(data.sets ?? {})) sets.set(key, new Set(value))
    for (const [key, value] of Object.entries(data.expiries ?? {})) expiries.set(key, value)
  } catch (error) {
    console.warn('Could not read local data file, starting empty:', error.message)
  }
}

function save() {
  const data = {
    strings: Object.fromEntries(strings),
    hashes: Object.fromEntries([...hashes].map(([key, value]) => [key, Object.fromEntries(value)])),
    lists: Object.fromEntries(lists),
    sortedSets: Object.fromEntries([...sortedSets].map(([key, value]) => [key, Object.fromEntries(value)])),
    sets: Object.fromEntries([...sets].map(([key, value]) => [key, [...value]])),
    expiries: Object.fromEntries(expiries),
  }
  try {
    mkdirSync(join(process.cwd(), '.local-data'), { recursive: true })
    writeFileSync(FILE, JSON.stringify(data))
  } catch (error) {
    console.warn('Could not save local data file:', error.message)
  }
}

load()

const READ_ONLY = new Set(['GET', 'MGET', 'HGETALL', 'LRANGE', 'ZRANGE', 'SMEMBERS'])

// Redis-style inclusive range with negative indexes counting from the end.
function range(items, start, stop) {
  const from = start < 0 ? Math.max(items.length + start, 0) : start
  const to = stop < 0 ? items.length + stop : stop
  return items.slice(from, to + 1)
}

const stores = [strings, hashes, lists, sortedSets, sets]

function dropIfExpired(key) {
  const at = expiries.get(key)
  if (at !== undefined && at <= Date.now()) {
    stores.forEach((store) => store.delete(key))
    expiries.delete(key)
  }
}

function run([command, ...args]) {
  const [key] = args
  if (typeof key === 'string') dropIfExpired(key)
  switch (command) {
    case 'SET': {
      if (args.includes('NX') && strings.has(key)) return null
      strings.set(key, String(args[1]))
      const ex = args.indexOf('EX')
      if (ex !== -1) expiries.set(key, Date.now() + Number(args[ex + 1]) * 1000)
      else expiries.delete(key)
      return 'OK'
    }
    case 'INCR': {
      const value = Number(strings.get(key) || 0) + 1
      strings.set(key, String(value))
      return value
    }
    case 'GET':
      return strings.get(key) ?? null
    case 'MGET':
      return args.map((name) => strings.get(name) ?? null)
    case 'DEL':
      return args.filter((name) => {
        expiries.delete(name)
        return stores.map((store) => store.delete(name)).some(Boolean)
      }).length
    case 'EXPIRE':
      expiries.set(key, Date.now() + Number(args[1]) * 1000)
      return 1
    case 'HSET': {
      if (!hashes.has(key)) hashes.set(key, new Map())
      const hash = hashes.get(key)
      let added = 0
      for (let i = 1; i < args.length; i += 2) {
        if (!hash.has(args[i])) added += 1
        hash.set(args[i], String(args[i + 1]))
      }
      return added
    }
    case 'HDEL':
      return args.slice(1).filter((field) => hashes.get(key)?.delete(field)).length
    case 'HGETALL':
      return [...(hashes.get(key) ?? new Map())].flat()
    case 'HINCRBY': {
      if (!hashes.has(key)) hashes.set(key, new Map())
      const hash = hashes.get(key)
      const value = Number(hash.get(args[1]) || 0) + Number(args[2])
      hash.set(args[1], String(value))
      return value
    }
    case 'RPUSH': {
      if (!lists.has(key)) lists.set(key, [])
      lists.get(key).push(...args.slice(1).map(String))
      return lists.get(key).length
    }
    case 'LRANGE':
      return range(lists.get(key) ?? [], args[1], args[2])
    case 'LTRIM':
      if (lists.has(key)) lists.set(key, range(lists.get(key), args[1], args[2]))
      return 'OK'
    case 'SADD': {
      if (!sets.has(key)) sets.set(key, new Set())
      const before = sets.get(key).size
      args.slice(1).forEach((member) => sets.get(key).add(String(member)))
      return sets.get(key).size - before
    }
    case 'SREM':
      return args.slice(1).filter((member) => sets.get(key)?.delete(member)).length
    case 'SMEMBERS':
      return [...(sets.get(key) ?? [])]
    case 'LPUSH': {
      if (!lists.has(key)) lists.set(key, [])
      lists.get(key).unshift(...args.slice(1).map(String).reverse())
      return lists.get(key).length
    }
    case 'ZADD':
      if (!sortedSets.has(key)) sortedSets.set(key, new Map())
      sortedSets.get(key).set(args[2], Number(args[1]))
      return 1
    case 'ZREM':
      return args.slice(1).filter((member) => sortedSets.get(key)?.delete(member)).length
    case 'ZRANGE': {
      const members = [...(sortedSets.get(key) ?? new Map())].sort((a, b) =>
        args.includes('REV') ? b[1] - a[1] : a[1] - b[1],
      )
      return range(members, args[1], args[2]).map(([member]) => member)
    }
    default:
      throw new Error(`memoryRedis: unsupported command ${command}`)
  }
}

export async function memoryRedis(commands) {
  const results = commands.map(run)
  if (commands.some(([command]) => !READ_ONLY.has(command))) save()
  return results
}
