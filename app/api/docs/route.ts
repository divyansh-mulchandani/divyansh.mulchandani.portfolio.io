import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/env";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Divyansh Mulchandani Portfolio API",
    version: "1.0.0",
    description:
      "REST API for the personal portfolio of Divyansh Mulchandani. Includes public contact form submission, system status, and admin-gated message management.",
    contact: {
      name: "Divyansh Mulchandani",
      email: "divyanshmulchandani@gmail.com",
      url: "https://linkedin.com/in/divyansh-mulchandani/",
    },
  },
  servers: [{ url: SITE_CONFIG.url, description: "Current server" }],
  tags: [
    { name: "Meta", description: "API metadata" },
    { name: "Status", description: "System health and runtime info" },
    { name: "Auth", description: "Session authentication" },
    { name: "Messages", description: "Contact messages" },
    { name: "Admin", description: "Admin-only operations" },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "portfolio_session",
        description:
          "HMAC-SHA256 signed session cookie. Obtain via POST /api/auth/login. Expires after 5 minutes.",
      },
    },
    schemas: {
      Message: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
          name: { type: "string", example: "Jane Smith" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          message: { type: "string", example: "Hi Divyansh, I'd love to connect!" },
          createdAt: { type: "string", format: "date-time", example: "2026-08-08T12:00:00.000Z" },
        },
        required: ["id", "name", "email", "message", "createdAt"],
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Unauthorized" },
        },
        required: ["error"],
      },
      LoadAverage: {
        type: "object",
        properties: {
          oneMinute: { type: "number", example: 0.52 },
          fiveMinutes: { type: "number", example: 0.47 },
          fifteenMinutes: { type: "number", example: 0.42 },
        },
      },
      StatusResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "degraded"], example: "ok" },
          timestamp: { type: "string", format: "date-time" },
          uptimeSeconds: { type: "integer", example: 3600 },
          nodeVersion: { type: "string", example: "v22.0.0" },
          cpuCount: { type: "integer", example: 8 },
          loadAverage: { $ref: "#/components/schemas/LoadAverage" },
          mongodb: { type: "string", enum: ["up", "down"], example: "up" },
        },
      },
      CollectionStats: {
        type: "object",
        properties: {
          totalDocs: { type: "integer", example: 42 },
          sizeMB: { type: "number", example: 0.12 },
          storageSizeMB: { type: "number", example: 0.16 },
          limitMB: { type: "number", example: 512 },
          usagePercent: { type: "number", example: 0.02 },
          lastRotation: { type: "string", format: "date-time", nullable: true, example: null },
        },
      },
    },
  },
  paths: {
    "/api": {
      get: {
        tags: ["Meta"],
        summary: "API metadata",
        description: "Returns API name, version, status, and a list of all endpoints.",
        responses: {
          "200": {
            description: "API metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    version: { type: "string" },
                    status: { type: "string" },
                    endpoints: { type: "object" },
                  },
                },
              },
            },
          },
          "429": { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/status": {
      get: {
        tags: ["Status"],
        summary: "System health",
        description: "Returns system load averages, CPU count, Node.js version, process uptime, and MongoDB connectivity. Returns HTTP 503 if MongoDB is unreachable.",
        responses: {
          "200": {
            description: "System is healthy",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StatusResponse" } } },
          },
          "429": { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "503": { description: "MongoDB unavailable (status: degraded)", content: { "application/json": { schema: { $ref: "#/components/schemas/StatusResponse" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Validates admin credentials and sets a secure HTTP-only session cookie valid for 5 minutes.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "divyansh.mulchandani" },
                  password: { type: "string", format: "password", example: "••••••••" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful — `portfolio_session` cookie is set", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
          "400": { description: "Missing credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Rate limit or brute-force lockout", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Clears the session cookie.",
        responses: {
          "200": { description: "Logged out", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
        },
      },
    },
    "/api/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change password",
        description: "Changes the admin password. Requires an active session. New password is stored as a salted hash in MongoDB.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  currentPassword: { type: "string", format: "password" },
                  newPassword: { type: "string", format: "password", description: "Minimum 12 characters" },
                  confirmPassword: { type: "string", format: "password" },
                },
                required: ["currentPassword", "newPassword", "confirmPassword"],
              },
            },
          },
        },
        responses: {
          "200": { description: "Password changed", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
          "400": { description: "Validation error or wrong current password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Brute-force lockout", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/messages": {
      get: {
        tags: ["Messages"],
        summary: "List messages",
        description: "Returns all contact messages sorted newest-first. Requires admin session.",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "List of messages",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    messages: { type: "array", items: { $ref: "#/components/schemas/Message" } },
                  },
                },
              },
            },
          },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "503": { description: "MongoDB unavailable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Messages"],
        summary: "Submit a contact message",
        description: "Public endpoint — no authentication required. Submits a contact message from a portfolio visitor. Automatically triggers background data rotation if the collection exceeds 512 MB.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100, example: "Jane Smith" },
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  message: { type: "string", maxLength: 2000, example: "Hi, I'd love to connect!" },
                },
                required: ["name", "email", "message"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Message created", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" }, id: { type: "string", format: "uuid" } } } } } },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "429": { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "503": { description: "MongoDB unavailable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/admin": {
      get: {
        tags: ["Admin"],
        summary: "Collection stats",
        description: "Returns MongoDB messages collection stats including size, document count, usage percentage, and last rotation timestamp.",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Collection stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { stats: { $ref: "#/components/schemas/CollectionStats" } },
                },
              },
            },
          },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "503": { description: "Failed to retrieve stats", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Trigger data rotation",
        description: "Manually triggers data rotation — deletes oldest messages in batches of 100 until collection drops below 512 MB.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { action: { type: "string", enum: ["rotate"], example: "rotate" } },
                required: ["action"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Rotation result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      properties: {
                        rotated: { type: "boolean" },
                        deletedCount: { type: "integer" },
                        sizeBeforeMB: { type: "number" },
                        sizeAfterMB: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Unknown action", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "503": { description: "Rotation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
};

export async function GET(): Promise<Response> {
  return NextResponse.json(spec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
