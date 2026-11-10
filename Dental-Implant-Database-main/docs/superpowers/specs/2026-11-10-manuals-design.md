# PDF manuals

Approved in chat: display the supplied user and administrator PDFs in an internal reading page, with a heading, return link, and a fallback link for mobile browsers.

- User entry: book icon beside Night Mode in the existing navbar; `/manual` inside the user layout.
- Admin entry: Manual below Dashboard in the sidebar's Features section; `/admin/manual` inside the protected admin layout.
- Share a responsive viewer with loading/error feedback and an open-PDF link.
- Serve the user PDF from frontend public assets. Keep the admin PDF outside public/uploads and fetch it through the existing token authentication plus an admin role check. Use a temporary blob URL without exposing tokens in links.
- Approaches considered: direct PDF in a new tab (simpler), internal viewer (selected by the user; preserves navigation). No PDF conversion or new dependencies.
- Retain original PDF contents. Existing login and API configuration remain the source of authentication and backend location.
