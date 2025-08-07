import { createSwaggerSpec } from "next-swagger-doc"
import { NextResponse } from "next/server"

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "vanish.club API Documentation",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  })

  return NextResponse.json(spec)
}

