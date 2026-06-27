import { describe, it, expect } from "vitest";
import { MimeParser } from "../src/mime";

describe("MimeParser", () => {
  it("parses simple text/plain email", () => {
    const raw = "Subject: Test\r\n\r\nHello World";
    const result = new MimeParser(raw).parse();
    expect(result.text).toBe("Hello World");
    expect(result.html).toBe("");
  });

  it("parses text/html email", () => {
    const raw = "Content-Type: text/html\r\n\r\n<h1>Hello</h1>";
    const result = new MimeParser(raw).parse();
    expect(result.html).toBe("<h1>Hello</h1>");
    expect(result.text).toBe("");
  });

  it("decodes base64 content transfer encoding", () => {
    const encoded = btoa("<h1>Hello World</h1>");
    const raw = `Content-Type: text/html\r\nContent-Transfer-Encoding: base64\r\n\r\n${encoded}`;
    const result = new MimeParser(raw).parse();
    expect(result.html).toBe("<h1>Hello World</h1>");
  });

  it("decodes quoted-printable content", () => {
    const raw = `Content-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n=C2=A9 2024 Aurelion`;
    const result = new MimeParser(raw).parse();
    expect(result.text).toBe("\u00a9 2024 Aurelion");
  });

  it("parses multipart/alternative email", () => {
    const raw = [
      'Content-Type: multipart/alternative; boundary="boundary123"',
      "",
      "--boundary123",
      "Content-Type: text/plain",
      "",
      "Hello World",
      "--boundary123",
      "Content-Type: text/html",
      "",
      "<h1>Hello World</h1>",
      "--boundary123--",
      "",
    ].join("\r\n");

    const result = new MimeParser(raw).parse();
    expect(result.text).toBe("Hello World");
    expect(result.html).toBe("<h1>Hello World</h1>");
  });

  it("parses multipart/mixed with nested multipart/alternative", () => {
    const raw = [
      'Content-Type: multipart/mixed; boundary="outer"',
      "",
      "--outer",
      'Content-Type: multipart/alternative; boundary="inner"',
      "",
      "--inner",
      "Content-Type: text/plain",
      "",
      "Hello",
      "--inner",
      "Content-Type: text/html",
      "",
      "<p>Hello</p>",
      "--inner--",
      "",
      "--outer",
      "Content-Type: application/octet-stream",
      "",
      "attachment data",
      "--outer--",
      "",
    ].join("\r\n");

    const result = new MimeParser(raw).parse();
    expect(result.text).toBe("Hello");
    expect(result.html).toBe("<p>Hello</p>");
  });

  it("handles email with only text/plain in multipart", () => {
    const raw = [
      'Content-Type: multipart/alternative; boundary="b"',
      "",
      "--b",
      "Content-Type: text/plain",
      "",
      "Plain text",
      "--b",
      'Content-Type: text/html; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      btoa("<div><p>HTML</p></div>"),
      "--b--",
      "",
    ].join("\r\n");

    const result = new MimeParser(raw).parse();
    expect(result.text).toBe("Plain text");
    expect(result.html).toBe("<div><p>HTML</p></div>");
  });

  it("returns empty strings for empty body", () => {
    const result = new MimeParser("Subject: Empty\r\n\r\n").parse();
    expect(result.text).toBe("");
    expect(result.html).toBe("");
  });

  it("handles no headers gracefully", () => {
    const result = new MimeParser("Just body text").parse();
    expect(result.text).toBe("Just body text");
  });
});

describe("Email Worker", () => {
  it("decodes MIME encoded words", () => {
    const encoded = "=?UTF-8?B?SGVsbG8gV29ybGQ=?=";
    const result = encoded.replace(
      /=\?([^?]+)\?([BbQq])\?([^?]+)\?=/g,
      (_, charset: string, encoding: string, data: string) => {
        if (encoding.toUpperCase() === "B") {
          const binary = atob(data.replace(/\s/g, ""));
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          return new TextDecoder(charset.toLowerCase()).decode(bytes);
        }
        return data;
      }
    );
    expect(result).toBe("Hello World");
  });
});
