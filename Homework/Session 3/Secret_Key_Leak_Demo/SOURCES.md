# Sources

Pages were opened and read on 2026-10-06. The Next.js pages were marked version 16.3.8 (last updated 2026-08-25), the version this project uses.

## Next.js (official)
- [Environment variables](https://nextjs.org/docs/app/guides/environment-variables): `NEXT_PUBLIC_` values are inlined into the browser bundle at `next build`; dynamic lookups such as `process.env[name]` are not inlined; server-only variables are read from `process.env`; `.env.local` load order; dynamic rendering reads values at runtime.
- [Data security](https://nextjs.org/docs/app/guides/data-security): `server-only`, keeping `process.env` access in a data access layer, returning minimal DTOs, rate limiting, treating `route.ts` handlers as high-power entry points to audit.
- [Server and Client Components: preventing environment poisoning](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning): why `server-only` is used.

## Key remediation guidance
- [GitHub Docs: Remediating a leaked secret](https://docs.github.com/en/code-security/tutorials/remediate-leaked-secrets/remediating-a-leaked-secret): revoke at the provider, replace, update affected services, review logs; removing the secret from code or history does not stop exploitation.
- [AWS Security Blog: What to do if you inadvertently expose an AWS access key](https://aws.amazon.com/blogs/security/what-to-do-if-you-inadvertently-expose-an-aws-access-key/): determine access, disable (rather than immediately delete) the key, review activity, move to short-lived credentials; deleting can interrupt applications.
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html): rotation, immediate revocation of exposed keys, least privilege, rotation strategies that keep old keys valid temporarily for planned changes.

## How the demo maps to the sources
| Demo statement | Source |
|---|---|
| The prefix makes a value public; it is frozen at build | Next.js environment variables |
| A server module can hold the secret; guard what it returns | Next.js data security |
| Removing a key from code does not invalidate it | GitHub remediation |
| Revoke at the provider, then update every consumer | GitHub remediation, AWS blog |
| Planned rotation can overlap; compromised keys need urgent revocation | OWASP; AWS blog (disabling vs deleting, service interruption) |
| This mock revokes immediately with no overlap | Simplification: real providers differ |

AWS and GitHub are cited as examples of provider guidance; the mock API does not simulate either service.
