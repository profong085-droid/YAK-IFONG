/**
 * Telegram Visitor Tracker for IFONG - YAK Design AV MADE IN CAMBODIA
 * Sends real-time visitor alert notifications to Telegram Bot.
 */

export const TELEGRAM_CONFIG = {
  // Bot Token from @BotFather
  BOT_TOKEN: "8864632955:AAEY-IVLwkrxvpxOgsYTjeKKueagJqY-si8",

  // Telegram Chat ID to receive alerts.
  CHAT_ID: "8725769963",

  // Website details
  WEBSITE_NAME: "👕 IFONG - YAK Design AV MADE IN CAMBODIA",
  DOMAIN: "www.ifong-yak.shop",
};

interface IPData {
  ip: string;
  isp: string;
  org: string;
  as: string;
  country: string;
  flag: string;
  region: string;
  city: string;
  postal: string;
  lat: number;
  lon: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Fetch visitor IP and geo information
async function fetchVisitorIP(): Promise<IPData> {
  // Primary: ipwho.is
  try {
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data && data.success !== false && data.ip) {
      return {
        ip: data.ip || "មិនស្គាល់",
        isp: data.connection?.isp || "មិនស្គាល់",
        org: data.connection?.org || data.connection?.isp || "មិនស្គាល់",
        as: data.connection?.asn ? `AS${data.connection.asn} ${data.connection.org || ""}`.trim() : "មិនស្គាល់",
        country: data.country || "មិនស្គាល់",
        flag: data.flag?.emoji || "🌐",
        region: data.region || "មិនស្គាល់",
        city: data.city || "មិនស្គាល់",
        postal: data.postal || "N/A",
        lat: data.latitude || 0,
        lon: data.longitude || 0,
      };
    }
  } catch {
    // Fallback below
  }

  // Fallback: freeipapi.com
  try {
    const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data && data.ipAddress) {
      return {
        ip: data.ipAddress,
        isp: "មិនស្គាល់",
        org: "មិនស្គាល់",
        as: "មិនស្គាល់",
        country: data.countryName || "មិនស្គាល់",
        flag: "🌐",
        region: data.regionName || "មិនស្គាល់",
        city: data.cityName || "មិនស្គាល់",
        postal: data.zipCode || "N/A",
        lat: data.latitude || 0,
        lon: data.longitude || 0,
      };
    }
  } catch {
    // Fallback
  }

  return {
    ip: "មិនស្គាល់",
    isp: "មិនស្គាល់",
    org: "មិនស្គាល់",
    as: "មិនស្គាល់",
    country: "មិនស្គាល់",
    flag: "🌐",
    region: "មិនស្គាល់",
    city: "មិនស្គាល់",
    postal: "N/A",
    lat: 0,
    lon: 0,
  };
}

// Device and OS detection
function getDeviceInfo() {
  const ua = navigator.userAgent || "";
  let deviceType = "💻 Desktop (កុំព្យូទ័រ)";
  if (/iPad|Tablet/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    deviceType = "📱 Tablet (ថេបប្លែត)";
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    deviceType = "📱 Mobile (ទូរស័ព្ទដៃ)";
  }

  let os = "មិនស្គាល់";
  if (/Win/i.test(ua)) os = "Windows";
  else if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = "macOS (Apple Mac)";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS (Apple iPhone/iPad)";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "មិនស្គាល់";
  if (/Edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome|CriOS/i.test(ua)) browser = "Google Chrome";
  else if (/Safari/i.test(ua)) browser = "Apple Safari";
  else if (/Firefox|FxiOS/i.test(ua)) browser = "Mozilla Firefox";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";

  return { deviceType, os, browser };
}

// Battery status
async function getBatteryStatus(): Promise<string> {
  try {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      const b: any = await (navigator as any).getBattery();
      const level = Math.round((b.level || 0) * 100);
      const charging = b.charging ? "កំពុងសាកថ្ម ⚡" : "មិនបានសាក";
      return `🔋 ${level}% (${charging})`;
    }
  } catch {
    // ignore
  }
  return "មិនស្គាល់";
}

// Format date and time
function getFormattedDateTime(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${dateStr} at ${timeStr}`;
}

/**
 * Sends visitor notification to Telegram bot
 */
export async function trackVisitor() {
  // Prevent duplicate alert within 2 minutes of the same session
  const lastTracked = sessionStorage.getItem("yak_visitor_last_tracked");
  const nowMs = Date.now();
  if (lastTracked && nowMs - parseInt(lastTracked, 10) < 120000) {
    return;
  }
  sessionStorage.setItem("yak_visitor_last_tracked", String(nowMs));

  try {
    const botToken = TELEGRAM_CONFIG.BOT_TOKEN;
    const targetChatId = TELEGRAM_CONFIG.CHAT_ID;

    const [ipInfo, batteryText] = await Promise.all([
      fetchVisitorIP(),
      getBatteryStatus(),
    ]);

    const { deviceType, os, browser } = getDeviceInfo();
    const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = isDark ? "🌙 Dark Mode (ងងឹត)" : "☀️ Light Mode (ភ្លឺ)";
    const screenRes = `🖥 ${window.screen.width} × ${window.screen.height}`;
    const language = `🌐 ${navigator.language || "en-US"}`;
    const pagePath = window.location.pathname || "/";
    const referrer = document.referrer ? document.referrer : "ចូលផ្ទាល់ (Direct Visit)";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const datetime = getFormattedDateTime();
    const domain = window.location.hostname || TELEGRAM_CONFIG.DOMAIN;

    const mapsUrl = `https://www.google.com/maps?q=${ipInfo.lat},${ipInfo.lon}`;

    // Exact message template in Telegram HTML format (100% reliable)
    const message = [
      `🚨 <b>ការជូនដំណឹង៖ មានអ្នកចូលទស្សនាថ្មី! (New Visitor)</b>`,
      `🌐 <b>វេបសាយ (Website):</b> ${TELEGRAM_CONFIG.WEBSITE_NAME}`,
      `🔗 <b>Domain:</b> ${escapeHtml(domain)}`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `🌐 <b>បណ្តាញអ៊ីនធឺណិត (Network & IP):</b>`,
      `• IP Address: <code>${escapeHtml(ipInfo.ip)}</code>`,
      `• ក្រុមហ៊ុន (ISP): ${escapeHtml(ipInfo.isp)}`,
      `• ស្ថាប័ន (Org): ${escapeHtml(ipInfo.org)}`,
      `• បណ្តាញ (AS): ${escapeHtml(ipInfo.as)}`,
      `📍 <b>ទីតាំងភូមិសាស្ត្រ (🌐 ប៉ាន់ស្មានតាម IP / ISP):</b>`,
      `• កម្រិតសុក្រឹតភាព: 🌐 ប៉ាន់ស្មានតាម Server/បង្គោល ISP (~5-15km)`,
      `• ប្រទេស: ${escapeHtml(ipInfo.country)} ${ipInfo.flag}`,
      `• រាជធានី/ខេត្ត: ${escapeHtml(ipInfo.region)}`,
      `• ទីក្រុង: ${escapeHtml(ipInfo.city)} (Zip: ${escapeHtml(ipInfo.postal)})`,
      `• កូអរដោនេ: ${ipInfo.lat}, ${ipInfo.lon}`,
      `• 🗺️ ផែនទី Google: <a href="${mapsUrl}">ចុចទីនេះដើម្បីបើក Google Maps 📍</a>`,
      `📱 <b>ឧបករណ៍ & ប្រព័ន្ធ (Device & System):</b>`,
      `• ប្រភេទឧបករណ៍: ${deviceType}`,
      `• ប្រព័ន្ធប្រតិបត្តិការ: ${escapeHtml(os)}`,
      `• កម្មវិធីរុករក: ${escapeHtml(browser)}`,
      `• ទំហំអេក្រង់: ${screenRes}`,
      `• ភាសាឧបករណ៍: ${language}`,
      `• ថាមពលថ្ម: ${batteryText}`,
      `• រូបរាង (Theme): ${theme}`,
      `📄 <b>ព័ត៌មានទស្សនា (Visit Details):</b>`,
      `• ទំព័របានចូល: ${escapeHtml(pagePath)}`,
      `• ប្រភពចូល (Referrer): ${escapeHtml(referrer)}`,
      `• តំបន់ម៉ោង: ⏰ ${escapeHtml(timezone)}`,
      `• កាលបរិច្ឆេទ & ម៉ោង: ${datetime}`,
      `━━━━━━━━━━━━━━━━━━━━━`,
    ].join("\n");

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const resJson = await response.json();
    if (!resJson.ok) {
      console.warn("[Telegram Tracker] Telegram API error:", resJson);
    } else {
      console.log("[Telegram Tracker] Alert sent successfully!");
    }
  } catch (error) {
    console.error("[Telegram Tracker] Failed to send visitor alert:", error);
  }
}
