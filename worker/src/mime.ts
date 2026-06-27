interface MimeHeader {
  name: string;
  value: string;
}

interface ParsedEmail {
  text: string;
  html: string;
}

export class MimeParser {
  private raw: string;

  constructor(raw: string) {
    this.raw = raw;
  }

  parse(): ParsedEmail {
    const headers = this.parseHeaders(this.raw);
    const bodyStart = this.findBodyStart(this.raw);
    const body = this.raw.slice(bodyStart);

    const contentType = this.getHeader(headers, "content-type") || "text/plain";
    const boundary = this.extractBoundary(contentType);

    if (boundary) {
      return this.parseMultipart(body, boundary);
    }

    if (!this.isTextContent(contentType)) {
      return { text: "", html: "" };
    }

    const encoding = this.getHeader(headers, "content-transfer-encoding");
    const decoded = this.decodeTransfer(body, encoding);

    if (contentType.includes("text/html")) {
      return { text: "", html: decoded };
    }

    return { text: decoded, html: "" };
  }

  private isTextContent(contentType: string): boolean {
    const ct = contentType.toLowerCase();
    return ct.startsWith("text/") || ct.startsWith("multipart/");
  }

  private parseHeaders(raw: string): MimeHeader[] {
    const match = raw.match(/^([\s\S]*?)\r?\n\r?\n/);
    if (!match) return [];
    const headerBlock = match[1];

    const headers: MimeHeader[] = [];
    const lines = headerBlock.split(/\r?\n/);
    let current: MimeHeader | null = null;

    for (const line of lines) {
      if (/^[\t ]/.test(line) && current) {
        current.value += " " + line.trim();
        continue;
      }

      const sep = line.indexOf(":");
      if (sep === -1) continue;

      current = {
        name: line.slice(0, sep).trim().toLowerCase(),
        value: line.slice(sep + 1).trim(),
      };
      headers.push(current);
    }

    return headers;
  }

  private findBodyStart(raw: string): number {
    const match = raw.match(/\r?\n\r?\n/);
    if (!match) return 0;
    return match.index! + match[0].length;
  }

  private getHeader(headers: MimeHeader[], name: string): string | null {
    for (const h of headers) {
      if (h.name === name) return h.value;
    }
    return null;
  }

  private extractBoundary(contentType: string): string | null {
    const match = contentType.match(/boundary\s*=\s*"([^"]+)"/i);
    if (match) return match[1];
    const match2 = contentType.match(/boundary\s*=\s*([^\s;]+)/i);
    if (match2) return match2[1];
    return null;
  }

  private parseMultipart(body: string, boundary: string): ParsedEmail {
    const parts = this.splitByBoundary(body, boundary);
    let text = "";
    let html = "";

    for (const part of parts) {
      const parsed = new MimeParser(part).parse();
      if (parsed.text) text += (text ? "\n" : "") + parsed.text;
      if (parsed.html) html += parsed.html;
    }

    return { text: text.trim(), html: html.trim() };
  }

  private splitByBoundary(body: string, boundary: string): string[] {
    const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = `(?:^|\\r?\\n)--${escaped}(?:--)?\\r?\\n`;
    const re = new RegExp(pattern, "g");

    const parts: string[] = [];
    let start = 0;
    let match: RegExpExecArray | null;

    while ((match = re.exec(body)) !== null) {
      if (start > 0) {
        const raw = body.slice(start, match.index);
        if (raw.trim()) parts.push(raw);
      }
      start = match.index + match[0].length;
    }

    if (start > 0 && start < body.length) {
      const remaining = body.slice(start).replace(/\r?\n--$/, "").trim();
      if (remaining) parts.push(remaining);
    }

    return parts;
  }

  private decodeTransfer(body: string, encoding: string | null): string {
    const enc = (encoding || "").toLowerCase().trim();

    switch (enc) {
      case "base64":
        return this.decodeBase64(body);
      case "quoted-printable":
        return this.decodeQuotedPrintable(body);
      case "7bit":
      case "8bit":
      case "binary":
      default:
        return body;
    }
  }

  private decodeBase64(body: string): string {
    const clean = body.replace(/\s/g, "");
    try {
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch {
      return body;
    }
  }

  private decodeQuotedPrintable(body: string): string {
    const bytes: number[] = [];
    const lines = body.split(/\r?\n/);
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line.endsWith("=")) {
        for (let j = 0; j < line.length - 1; j++) {
          if (line[j] === "=" && j + 2 < line.length - 1) {
            const hex = line.slice(j + 1, j + 3);
            if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
              bytes.push(parseInt(hex, 16));
              j += 2;
              continue;
            }
          }
          bytes.push(line.charCodeAt(j));
        }
        i++;
        continue;
      }

      for (let j = 0; j < line.length; j++) {
        if (line[j] === "=" && j + 2 < line.length) {
          const hex = line.slice(j + 1, j + 3);
          if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
            bytes.push(parseInt(hex, 16));
            j += 2;
            continue;
          }
        }
        bytes.push(line.charCodeAt(j));
      }

      if (i < lines.length - 1) {
        bytes.push(0x0a);
      }
      i++;
    }

    try {
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch {
      return body;
    }
  }
}
