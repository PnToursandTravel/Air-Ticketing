import { describe, it, expect } from "vitest";
import { parseResponseJson, parseRequestBody, sanitizeErrorMessage } from "@/lib/utils";

describe("Safe JSON Parsing and Error Sanitization", () => {
  it("safely handles empty response body without throwing 'Unexpected end of JSON input'", async () => {
    const emptyResponse = new Response("", { status: 200, headers: { "Content-Type": "application/json" } });
    const result = await parseResponseJson(emptyResponse);

    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it("safely handles empty 500 error response without throwing", async () => {
    const errorResponse = new Response("", { status: 500 });
    const result = await parseResponseJson(errorResponse);

    expect(result.data).toBeNull();
    expect(result.error).toContain("HTTP 500");
  });

  it("safely parses valid JSON responses", async () => {
    const jsonResponse = new Response(JSON.stringify({ success: true, count: 42 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseResponseJson<{ success: boolean; count: number }>(jsonResponse);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ success: true, count: 42 });
  });

  it("safely handles invalid JSON in parseRequestBody with fallback", async () => {
    const req = new Request("http://localhost:3000/api", {
      method: "POST",
      body: "",
    });

    const body = await parseRequestBody(req, { defaultVal: true });
    expect(body).toEqual({ defaultVal: true });
  });

  it("sanitizes 'Unexpected end of JSON input' into user-friendly message", () => {
    const syntaxErr = new SyntaxError("Unexpected end of JSON input");
    const sanitized = sanitizeErrorMessage(syntaxErr);

    expect(sanitized).not.toContain("Unexpected end of JSON input");
    expect(sanitized).toContain("server returned an empty or invalid response");
  });
});
