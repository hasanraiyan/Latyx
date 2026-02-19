# LaTeX Compilation Service API

REST API for compiling LaTeX source code to PDF with automatic cloud storage.

**Base URL:** `https://latex-to-pdf-14zg.onrender.com/` or `http://localhost:8000`

---

## Authentication

The API supports dual authentication mechanisms:

1. **Clerk JWT (Frontend/User)**: Standard Bearer token authentication.
   ```http
   Authorization: Bearer <clerk_jwt_token>
   ```

2. **API Key (Scripts/Integrations)**: For programmatic access without user login.
   ```http
   X-API-Key: sk_...
   ```

**Protected Routes:**
- `POST /compile`
- `POST /assist`
- `POST /api/v1/api-keys`
- `GET /api/v1/api-keys`
- `DELETE /api/v1/api-keys/{id}`

---

## API Key Management

Endpoints for users to manage their programmatic access keys.

### `POST /api/v1/api-keys`

Generate a new API Key. **Important:** The key is returned only once.

**Request Body:**

```json
{
  "name": "My CI Script"
}
```

| Field  | Type   | Required | Description               |
|--------|--------|----------|---------------------------|
| `name` | string | ✅       | Friendly name for the key |

**Response (200):**

```json
{
  "key": "sk_ab12...",
  "api_key": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My CI Script",
    "prefix": "sk_ab12",
    "created_at": "2023-10-27T10:00:00",
    "last_used_at": null
  }
}
```

### `GET /api/v1/api-keys`

List all active API keys for the current user.

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My CI Script",
    "prefix": "sk_ab12",
    "created_at": "2023-10-27T10:00:00",
    "last_used_at": "2023-10-28T14:30:00"
  }
]
```

### `DELETE /api/v1/api-keys/{id}`

Revoke an existing API key.

**Response:** `204 No Content`

---

## Endpoints

### `GET /health`

Check service health and available compilers.

**Response:**

```json
{
  "status": "ok",
  "latex_service": "healthy",
  "default_compiler": "pdflatex",
  "timeout_seconds": 90,
  "compilers": {
    "lualatex": "/usr/bin/lualatex",
    "pdflatex": "/usr/bin/pdflatex",
    "xelatex": "/usr/bin/xelatex"
  }
}
```

---

### `POST /compile`

Compile LaTeX source code to PDF and upload to cloud storage.

**Headers:**

| Header          | Value            | Required | Description |
|-----------------|------------------|----------|-------------|
| `Authorization` | `Bearer <token>` | ✅ (User) | Clerk JWT   |
| `X-API-Key`     | `sk_...`         | ✅ (Bot)  | API Key     |

**Query Parameters:**

| Parameter | Type    | Default | Description                                   |
|-----------|---------|---------|-----------------------------------------------|
| `debug`   | boolean | `false` | Include detailed debug diagnostics in response |

**Request Body:**

```json
{
  "source_code": "\\documentclass{article}\n\\begin{document}\nHello World!\n\\end{document}",
  "compiler": "pdflatex"
}
```

| Field         | Type   | Required | Description                                         |
|---------------|--------|----------|-----------------------------------------------------|
| `source_code` | string | ✅       | LaTeX source code (min 1 character)                 |
| `compiler`    | string | ❌       | Compiler to use: `pdflatex`, `xelatex`, or `lualatex` |

**Success Response (200):**

```json
{
  "success": true,
  "request_id": "a1b2c3d4e5f6",
  "compiler": "pdflatex",
  "pdf_url": "https://utfs.io/f/your-file-key"
}
```

**With `?debug=true`:**

```json
{
  "success": true,
  "request_id": "a1b2c3d4e5f6",
  "compiler": "pdflatex",
  "pdf_url": "https://utfs.io/f/your-file-key",
  "debug": {
    "duration_ms": 1234,
    "return_code": 0,
    "upload_file_key": "AkvCBIr4I6Td...",
    "upload_file_url": "https://utfs.io/f/..."
  }
}
```

---

## Error Responses

### Compilation Failed (400)

LaTeX syntax error or missing packages.

```json
{
  "error": "Compilation failed",
  "compiler": "pdflatex",
  "log": "! Undefined control sequence...",
  "failure_type": "compile_error"
}
```

### Invalid Compiler (400)

```json
{
  "error": "Invalid compile request",
  "detail": "Unsupported compiler 'foo'. Allowed compilers: lualatex, pdflatex, xelatex."
}
```

### Upload Failed (502)

Compilation succeeded but PDF upload failed.

```json
{
  "error": "PDF upload failed",
  "detail": "Compilation succeeded, but storing the PDF failed: ...",
  "compiler": "pdflatex"
}
```

### Timeout (400)

```json
{
  "error": "Compilation failed",
  "compiler": "pdflatex",
  "log": "Compilation timed out after 90 seconds.",
  "failure_type": "timeout"
}
```

### System Error (500)

Compiler not found or internal error.

```json
{
  "error": "Compilation failed",
  "compiler": "pdflatex",
  "log": "Compiler 'pdflatex' was not found in PATH...",
  "failure_type": "system_error"
}
```

### Unauthorized (401)

Missing or invalid authentication credentials.

```json
{
  "detail": "Missing API Key"
}
```

or

```json
{
  "detail": "Invalid API Key"
}
```

---

## Environment Variables

| Variable                | Required | Default    | Description                     |
|-------------------------|----------|------------|---------------------------------|
| `UPLOADTHING_TOKEN`     | ✅       | —          | Uploadthing API token           |
| `DEFAULT_COMPILER`      | ❌       | `pdflatex` | Default LaTeX compiler          |
| `LATEX_TIMEOUT_SECONDS` | ❌       | `90`       | Max compilation time in seconds |
| `DETAILED_DEBUG`        | ❌       | `false`    | Enable debug mode for all requests |
| `LOG_LEVEL`             | ❌       | `INFO`     | Logging level                   |
| `CLERK_SECRET_KEY`      | ✅       | —          | Clerk Secret Key for Auth       |

---

## Example Usage

### cURL (with API Key)

```bash
curl -X POST http://localhost:8000/compile \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_..." \
  -d '{
    "source_code": "\\documentclass{article}\\begin{document}Hello!\\end{document}",
    "compiler": "pdflatex"
  }'
```

### Python (with API Key)

```python
import requests

response = requests.post(
    "http://localhost:8000/compile",
    headers={"X-API-Key": "sk_..."},
    json={
        "source_code": r"\documentclass{article}\begin{document}Hello!\end{document}",
        "compiler": "pdflatex"
    }
)
data = response.json()
print(f"PDF URL: {data['pdf_url']}")
```
