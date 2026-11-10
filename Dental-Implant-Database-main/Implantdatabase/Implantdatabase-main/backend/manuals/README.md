# Administrator manual

`admin-manual.pdf` is intentionally outside the public upload directory.
Deploy this directory with the backend; `GET /api/manuals/admin` requires the existing bearer token and the `admin` role.
No database migration is needed. Do not expose this directory with a static-file web server.

The user manual is deployed with frontend `public/manuals/user-manual.pdf`.
Frontend routes are `/manual` and `/admin/manual`. Rebuild frontend and restart backend when deploying this feature.

The reader uses an iframe and a temporary blob URL for the authenticated file. If a reverse proxy supplies an additional Content-Security-Policy for frontend HTML, it must also allow `frame-src 'self' blob:`.
