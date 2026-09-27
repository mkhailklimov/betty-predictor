# Deployment notes — 2026-04-03

Cloudflare deployment credentials must be stored in the Cloudflare dashboard or
in a local, ignored environment file. Never commit API tokens, access keys, or
secret values to this repository.

Use a least-privilege token for deployment and rotate it if exposure is
suspected. Record resource names and non-sensitive deployment steps here; keep
credential values out of documentation and Git history.