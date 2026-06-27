import "dotenv/config";

const API_BASE = "https://api.cloudflare.com/client/v4";

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN!;
const WORKER_NAME = "aurelion-email-worker";

const headers = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
  "Content-Type": "application/json",
};

interface CfResponse<T = unknown> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

async function cfFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers, ...init });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudflare API ${res.status}: ${body}`);
  }

  const json: CfResponse<T> = await res.json();
  if (!json.success) {
    const msgs = json.errors.map((e) => e.message).join("; ");
    throw new Error(`Cloudflare API error: ${msgs}`);
  }

  return json.result;
}

interface Zone {
  id: string;
  name: string;
}

async function findZone(domain: string): Promise<Zone> {
  const zones = await cfFetch<Zone[]>(`/zones?name=${domain}&status=active`);
  if (zones.length === 0) {
    throw new Error(`No active zone found for domain: ${domain}`);
  }
  return zones[0];
}

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  priority?: number;
}

async function getDnsRecords(zoneId: string): Promise<DnsRecord[]> {
  return cfFetch<DnsRecord[]>(`/zones/${zoneId}/dns_records?type=MX`);
}

async function createMxRecord(
  zoneId: string,
  domain: string,
  priority: number,
  mailServer: string
): Promise<DnsRecord> {
  return cfFetch<DnsRecord>(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify({
      type: "MX",
      name: domain,
      content: mailServer,
      priority,
      ttl: 1,
      proxied: false,
    }),
  });
}

async function deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
  await cfFetch(`/zones/${zoneId}/dns_records/${recordId}`, {
    method: "DELETE",
  });
}

interface EmailRoutingRule {
  id: string;
  name: string;
  enabled: boolean;
}

async function getEmailRouting(zoneId: string): Promise<EmailRoutingRule[]> {
  return cfFetch<EmailRoutingRule[]>(`/zones/${zoneId}/email/routing/rules`);
}

async function createCatchAllRule(
  zoneId: string,
  workerName: string
): Promise<EmailRoutingRule> {
  return cfFetch<EmailRoutingRule>(`/zones/${zoneId}/email/routing/rules`, {
    method: "POST",
    body: JSON.stringify({
      name: "aurelion-catch-all",
      enabled: true,
      matchers: [{ type: "all" }],
      actions: [
        {
          type: "forward",
          value: [`worker@${workerName}.workers.dev`],
        },
      ],
    }),
  });
}

async function validateDomain(zone: Zone): Promise<void> {
  console.log(`\n[1/4] Validating domain: ${zone.name}`);
  console.log(`  Zone ID: ${zone.id}`);
  console.log(`  Status: active`);
}

async function configureMxRecords(zoneId: string, domain: string): Promise<void> {
  console.log(`\n[2/4] Configuring MX records for ${domain}`);

  const existingRecords = await getDnsRecords(zoneId);
  const aurelionRecords = existingRecords.filter(
    (r) => r.content.includes("routing.cloudflare.net") && r.name === domain
  );

  if (aurelionRecords.length > 0) {
    console.log(`  Found ${aurelionRecords.length} existing MX record(s), cleaning up...`);
    for (const record of aurelionRecords) {
      await deleteDnsRecord(zoneId, record.id);
      console.log(`  Deleted: ${record.content} (priority ${record.priority})`);
    }
  }

  const mxRecords = [
    { priority: 67, server: "route1.mx.cloudflare.net" },
    { priority: 34, server: "route2.mx.cloudflare.net" },
    { priority: 99, server: "route3.mx.cloudflare.net" },
  ];

  for (const { priority, server } of mxRecords) {
    await createMxRecord(zoneId, domain, priority, server);
    console.log(`  Created: ${server} (priority ${priority})`);
  }

  console.log("  MX records configured successfully");
}

async function setupCatchAll(zoneId: string): Promise<void> {
  console.log(`\n[3/4] Setting up Catch-All email routing`);

  const existingRules = await getEmailRouting(zoneId);
  const existingCatchAll = existingRules.find((r) => r.name === "aurelion-catch-all");

  if (existingCatchAll) {
    console.log("  Catch-All rule already exists, skipping");
    return;
  }

  await createCatchAllRule(zoneId, WORKER_NAME);
  console.log("  Catch-All rule created");
  console.log(`  Forwarding to: worker@${WORKER_NAME}.workers.dev`);
}

async function verifyWorker(): Promise<void> {
  console.log(`\n[4/4] Verifying worker deployment`);

  const workerUrl = `https://${WORKER_NAME}.workers.dev`;
  try {
    const res = await fetch(workerUrl, { method: "HEAD" });
    console.log(`  Worker URL: ${workerUrl}`);
    console.log(`  Status: ${res.status}`);
  } catch {
    console.log(`  Worker URL: ${workerUrl}`);
    console.log("  Warning: Worker may not be deployed yet. Run: cd worker && npm run deploy");
  }
}

async function main(): Promise<void> {
  console.log("=== Aurelion Cloudflare Setup ===\n");

  if (!CF_API_TOKEN) throw new Error("Missing CLOUDFLARE_API_TOKEN");
  if (!CF_ACCOUNT_ID) throw new Error("Missing CLOUDFLARE_ACCOUNT_ID");
  if (!DOMAIN) throw new Error("Missing NEXT_PUBLIC_APP_DOMAIN");

  const zone = await findZone(DOMAIN);

  await validateDomain(zone);
  await configureMxRecords(zone.id, DOMAIN);
  await setupCatchAll(zone.id);
  await verifyWorker();

  console.log("\n=== Setup Complete ===");
  console.log(`Domain: ${DOMAIN}`);
  console.log(`Worker: ${WORKER_NAME}`);
  console.log(`\nNote: DNS propagation may take up to 24 hours.`);
}

main().catch((err) => {
  console.error("\nSetup failed:", err.message);
  process.exit(1);
});
