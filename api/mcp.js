// Sensibo MCP server for Claude. One file, no dependencies.
// Vercel runs this as a serverless function; vercel.json maps /mcp/<secret> to it.
// Env vars: SENSIBO_API_KEY (required), MCP_SECRET (required), DEFAULT_DEVICE_ID (optional).

const SENSIBO_API = "https://home.sensibo.com/api/v2";
const SUPPORTED_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const device = {
  device_id: {
    type: "string",
    description: "Sensibo device id from list_devices. Optional when DEFAULT_DEVICE_ID is set.",
  },
};

const TOOLS = [
  {
    name: "list_devices",
    description: "List all Sensibo devices (AC units) on the account, with id and room name.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_ac_status",
    description: "Current AC state (on/off, mode, target temperature, fan) plus room temperature and humidity.",
    inputSchema: { type: "object", properties: { ...device } },
  },
  {
    name: "turn_on_ac",
    description: "Turn the AC on.",
    inputSchema: { type: "object", properties: { ...device } },
  },
  {
    name: "turn_off_ac",
    description: "Turn the AC off.",
    inputSchema: { type: "object", properties: { ...device } },
  },
  {
    name: "set_temperature",
    description: "Set the target temperature in Celsius (16-30).",
    inputSchema: {
      type: "object",
      properties: { ...device, temperature: { type: "number", minimum: 16, maximum: 30 } },
      required: ["temperature"],
    },
  },
  {
    name: "set_mode",
    description: "Set the AC mode.",
    inputSchema: {
      type: "object",
      properties: { ...device, mode: { type: "string", enum: ["cool", "heat", "dry", "auto", "fan"] } },
      required: ["mode"],
    },
  },
  {
    name: "set_fan_level",
    description: "Set the fan speed. Supported levels depend on the AC model.",
    inputSchema: {
      type: "object",
      properties: {
        ...device,
        fan_level: { type: "string", enum: ["quiet", "low", "medium", "high", "strong", "auto"] },
      },
      required: ["fan_level"],
    },
  },
];

async function sensibo(path, options = {}) {
  const url = new URL(SENSIBO_API + path);
  url.searchParams.set("apiKey", process.env.SENSIBO_API_KEY);
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status !== "success") {
    throw new Error(`Sensibo ${res.status}: ${data.reason || data.message || "request failed"}`);
  }
  return data.result;
}

function deviceId(args) {
  const id = args.device_id || process.env.DEFAULT_DEVICE_ID;
  if (!id) throw new Error("No device_id. Call list_devices first, or set DEFAULT_DEVICE_ID in Vercel.");
  return encodeURIComponent(id);
}

function setAc(args, property, value) {
  return sensibo(`/pods/${deviceId(args)}/acStates/${property}`, {
    method: "PATCH",
    body: JSON.stringify({ newValue: value }),
  });
}

async function callTool(name, args = {}) {
  switch (name) {
    case "list_devices": {
      const pods = await sensibo("/users/me/pods?fields=id,room");
      return pods.map((p) => ({ id: p.id, room: p.room?.name }));
    }
    case "get_ac_status": {
      const pod = await sensibo(`/pods/${deviceId(args)}?fields=room,acState,measurements`);
      return {
        room: pod.room?.name,
        ac: pod.acState,
        room_temperature: pod.measurements?.temperature,
        humidity: pod.measurements?.humidity,
      };
    }
    case "turn_on_ac":
      return setAc(args, "on", true);
    case "turn_off_ac":
      return setAc(args, "on", false);
    case "set_temperature": {
      const t = Number(args.temperature);
      if (!Number.isFinite(t) || t < 16 || t > 30) throw new Error("temperature must be between 16 and 30");
      return setAc(args, "targetTemperature", Math.round(t));
    }
    case "set_mode":
      return setAc(args, "mode", args.mode);
    case "set_fan_level":
      return setAc(args, "fanLevel", args.fan_level);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleMessage(msg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return { jsonrpc: "2.0", id: msg?.id ?? null, error: { code: -32600, message: "Invalid request" } };
  }
  if (msg.id === undefined) return null; // notification: no reply

  const reply = (result) => ({ jsonrpc: "2.0", id: msg.id, result });
  switch (msg.method) {
    case "initialize": {
      const asked = msg.params?.protocolVersion;
      return reply({
        protocolVersion: SUPPORTED_VERSIONS.includes(asked) ? asked : SUPPORTED_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: "sensibo-mcp", version: "1.0.0" },
      });
    }
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call":
      try {
        const result = await callTool(msg.params?.name, msg.params?.arguments || {});
        return reply({ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
      } catch (err) {
        return reply({ content: [{ type: "text", text: `Error: ${err.message}` }], isError: true });
      }
    default:
      return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `Method not found: ${msg.method}` } };
  }
}

module.exports = async function handler(req, res) {
  const secret = process.env.MCP_SECRET;
  if (!secret || !process.env.SENSIBO_API_KEY) {
    return res.status(500).json({ error: "Set SENSIBO_API_KEY and MCP_SECRET in Vercel, then redeploy." });
  }
  const given = req.query.key || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (given !== secret) {
    return res.status(401).json({ error: "Wrong or missing secret in the URL." });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "MCP server is running. Claude connects with POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = undefined; }
  }
  if (body === undefined || body === null) {
    return res.status(400).json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }

  // One log line per call, without the secret. The leak check reads these from the Vercel logs.
  const ua = req.headers["user-agent"] || "";
  for (const m of Array.isArray(body) ? body : [body]) {
    console.log(JSON.stringify({
      event: "mcp_call",
      method: m?.method,
      tool: m?.params?.name,
      user_agent: ua.slice(0, 200),
      country: req.headers["x-vercel-ip-country"] || "",
    }));
  }

  const batch = Array.isArray(body);
  const replies = (await Promise.all((batch ? body : [body]).map(handleMessage))).filter(Boolean);
  if (!replies.length) return res.status(202).end();
  return res.status(200).json(batch ? replies : replies[0]);
};
