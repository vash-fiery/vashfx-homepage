const maximumTargetLength = 2048
const blockedDomainSuffixes = [
  '.example',
  '.internal',
  '.invalid',
  '.local',
  '.localhost',
  '.test',
]

function parseIpv4(value: string) {
  const parts = value.split('.')
  if (parts.length !== 4) return null

  const octets = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) return Number.NaN
    if (part.length > 1 && part.startsWith('0')) return Number.NaN
    return Number(part)
  })

  return octets.every((octet) => octet >= 0 && octet <= 255)
    ? octets
    : null
}

function isPublicIpv4(value: string) {
  const octets = parseIpv4(value)
  if (!octets) return false

  const [first, second, third] = octets
  if (first === 0 || first === 10 || first === 127) return false
  if (first === 100 && second >= 64 && second <= 127) return false
  if (first === 169 && second === 254) return false
  if (first === 172 && second >= 16 && second <= 31) return false
  if (first === 192 && second === 0 && third === 0) return false
  if (first === 192 && second === 0 && third === 2) return false
  if (first === 192 && second === 88 && third === 99) return false
  if (first === 192 && second === 168) return false
  if (first === 198 && (second === 18 || second === 19)) return false
  if (first === 198 && second === 51 && third === 100) return false
  if (first === 203 && second === 0 && third === 113) return false
  if (first >= 224) return false

  return true
}

function parseIpv6(value: string) {
  const address = value.toLowerCase()
  if (!address.includes(':') || address.includes('.')) return null
  if ((address.match(/::/g) ?? []).length > 1) return null

  const [left = '', right = ''] = address.split('::')
  const leftGroups = left ? left.split(':') : []
  const rightGroups = right ? right.split(':') : []
  const missingGroups = 8 - leftGroups.length - rightGroups.length

  if (address.includes('::') ? missingGroups < 1 : missingGroups !== 0) {
    return null
  }

  const groups = [
    ...leftGroups,
    ...Array.from({ length: missingGroups }, () => '0'),
    ...rightGroups,
  ]
  const hasInvalidGroup = groups.some(
    (group) => !/^[\da-f]{1,4}$/.test(group),
  )
  if (groups.length !== 8 || hasInvalidGroup) {
    return null
  }

  return groups.map((group) => Number.parseInt(group, 16))
}

function isPublicIpv6(value: string) {
  const groups = parseIpv6(value)
  if (!groups) return false

  const [first, second] = groups
  const isGlobalUnicast = first >= 0x2000 && first <= 0x3fff
  const isDocumentation = first === 0x2001 && second === 0x0db8
  const isExtendedDocumentation = first === 0x3fff && second < 0x1000

  return isGlobalUnicast && !isDocumentation && !isExtendedDocumentation
}

function isPublicDomainName(value: string) {
  // The scan executor must also validate every resolved address and redirect.
  // A syntactically public domain can still resolve to a private address.
  const hostname = value.endsWith('.') ? value.slice(0, -1) : value
  if (hostname.length > 253) return false

  const lowerHostname = hostname.toLowerCase()
  if (blockedDomainSuffixes.some((suffix) => lowerHostname.endsWith(suffix))) {
    return false
  }

  const labels = lowerHostname.split('.')
  if (labels.length < 2 || /^\d+$/.test(labels.at(-1) ?? '')) return false

  return labels.every(
    (label) => label.length <= 63
      && /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/.test(label),
  )
}

function stripIpv6Brackets(value: string) {
  return value.startsWith('[') && value.endsWith(']')
    ? value.slice(1, -1)
    : value
}

function isPublicHost(value: string) {
  const hostname = stripIpv6Brackets(value)
  return isPublicIpv4(hostname)
    || isPublicIpv6(hostname)
    || isPublicDomainName(hostname)
}

export function normalizeScanTarget(value: unknown) {
  if (typeof value !== 'string') return null

  const target = value.trim()
  if (!target || target.length > maximumTargetLength) return null
  if (isPublicIpv4(target) || isPublicIpv6(stripIpv6Brackets(target))) {
    return stripIpv6Brackets(target)
  }

  try {
    const url = new URL(target)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password || !isPublicHost(url.hostname)) return null
    url.hash = ''
    return url.href
  } catch {
    return null
  }
}
