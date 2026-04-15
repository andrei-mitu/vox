# Auth Flow

## Cookie

- Name: `vox_session`
- Type: `httpOnly`, `secure` (in prod), `sameSite=lax`
- Value: signed JWT (`jose` HS256)
- Payload: `{ sub: userId, email, role }`

## Login flow

```
POST /api/auth/login
  → parse + validate body (loginCredentialsSchema)
  → signIn(email, password)
      → findUserByEmail(email)
      → bcrypt.compare(password, hash)   ← always runs (dummy hash if no user)
      → check emailConfirmedAt
      → check bannedUntil
      → signSession({ sub, email, role })
      → set cookie
  → return { user: SessionUserDto }
```

## Session verification (every request)

```
getSessionUser()
  → cookies().get('vox_session')
  → verifySession(token)              ← jose verify
  → findSystemRoleById(payload.sub)   ← live DB read (role may have changed)
  → return SessionUserDto | null
```

The live DB read ensures role changes (e.g. admin demotion) take effect immediately without re-login.

## Workspace guard (`[workspace]/layout.tsx`)

```
getSessionUser()       → null → redirect /login
findTeamBySlug(slug)   → null → redirect /no-access
if user.role !== 'admin':
  findMembership(teamId, userId) → null → redirect /no-access
```

Admin bypasses the membership check — sees all workspaces.

## Logout

```
DELETE /api/auth/logout
  → cookies().delete('vox_session')
  → redirect /login
```

## Security notes

- Same error message for "user not found" and "wrong password" — prevents email enumeration
- Dummy hash always runs bcrypt to prevent timing attacks
- Role is always re-fetched from DB — JWT role is only used as a cache hint
- **⚠️ No `exp` claim set** — sessions are currently indefinite. Must add expiry (e.g. `{ expiresIn: '7d' }`) before any
  production deployment. Tracked in [[02-Roadmap]].

## SessionUserDto

```ts
interface SessionUserDto {
    id: string;
    email: string;
    role: 'admin' | 'user';
}
```
