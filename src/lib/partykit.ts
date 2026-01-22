// PartyKit connection configuration

export function getPartyKitHost(): string {
  // In production, use your deployed PartyKit URL
  // In development, use localhost
  return process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999'
}
