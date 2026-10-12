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
