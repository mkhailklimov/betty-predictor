import AVATARS from './avatars.json'

// PRO avatars: every FIFA nation (illustrated card where we have one, else a
// flag) and Premier League club badges. Codes are stored in users.fav_team;
// the worker validates against the same avatars.json.
export interface Avatar {
  code: string
  name: string
  group: 'nation' | 'epl'
  src: string
}

export const AVATAR_LIST = AVATARS as Avatar[]
const BY_CODE = new Map(AVATAR_LIST.map((a) => [a.code, a]))

export const getAvatar = (code?: string | null): Avatar | undefined =>
  code ? BY_CODE.get(code) : undefined

// Exact country name (as the sheet writes it) -> code, for cards whose challenge
// has no linked feed match. Exact names only, so clubs never match a nation.
const NATION_BY_NAME = new Map(
  AVATAR_LIST.filter((a) => a.group === 'nation').map((a) => [a.name, a.code]),
)

export const nationCode = (name?: string | null): string | null =>
  (name && NATION_BY_NAME.get(name)) || null

// Exact club name (as the sheet writes it) -> shield badge, for club cards with no sticker.
const CLUB_BY_NAME = new Map(
  AVATAR_LIST.filter((a) => a.group === 'epl').map((a) => [a.name, a.src]),
)

export const clubBadge = (name?: string | null): string | null =>
  (name && CLUB_BY_NAME.get(name)) || null
