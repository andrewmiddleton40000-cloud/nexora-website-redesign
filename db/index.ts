import { drizzle } from 'drizzle-orm/netlify-db'
import * as schema from './schema'

type Db = ReturnType<typeof make>
const make = () => drizzle({ schema })

let instance: Db | undefined

/** Lazily created so builds and client bundles never try to connect. */
export function getDb(): Db {
  instance ??= make()
  return instance
}

export { schema }
