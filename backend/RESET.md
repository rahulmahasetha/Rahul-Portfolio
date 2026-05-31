Reset admin password

Usage:

```bash
# from the backend folder
node reset_admin_password.js <newPassword> [email]
```

Environment:
- `MONGODB_URI` from `.env` (defaults to `mongodb://127.0.0.1:27017/portfolio`)
- optional `ADMIN_EMAIL` in `.env` to set default admin email

Notes:
- The script upserts an `Admin` document with the given email and bcrypt-hashed password.
- Requires `bcrypt` in `node_modules` (run `npm install bcrypt` if missing).
