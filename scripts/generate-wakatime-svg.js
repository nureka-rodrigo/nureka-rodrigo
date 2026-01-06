import fs from "fs";
import https from "https";

const WAKATIME_URL =
  "https://wakatime.com/share/@nureka99/f49b73ce-55a8-41e0-8cbc-36db01175a78.json";

const OUTPUT = "wakatime-languages.svg";
const WIDTH = 400;
const BAR_HEIGHT = 22;
const GAP = 10;
const PADDING = 20;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

function generateSVG(langs) {
  const height = PADDING * 2 + langs.length * (BAR_HEIGHT + GAP);

  let y = PADDING;

  const bars = langs
    .map((lang) => {
      const barWidth = (lang.percent / 100) * (WIDTH - 200);
      const row = `
        <text x="20" y="${y + 15}" fill="#c9d1d9" font-size="13">${
        lang.name
      }</text>
        <rect x="140" y="${y}" width="${barWidth}" height="${BAR_HEIGHT}" rx="6" fill="${
        lang.color
      }" />
        <text x="${140 + barWidth + 8}" y="${
        y + 15
      }" fill="#8b949e" font-size="12">
          ${lang.percent.toFixed(2)}%
        </text>
      `;
      y += BAR_HEIGHT + GAP;
      return row;
    })
    .join("");

  return `
<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}"
     xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial; }
  </style>

  <rect width="100%" height="100%" rx="14" fill="#212121"/>

  <text x="20" y="28" fill="#f0f6fc" font-size="16" font-weight="600">
    All-Time Language Usage (WakaTime)
  </text>

  <g transform="translate(0, 20)">
    ${bars}
  </g>
</svg>
`;
}

(async () => {
  const json = await fetchJSON(WAKATIME_URL);
  const topLangs = json.data.filter((l) => l.percent > 0).slice(0, 9);

  const svg = generateSVG(topLangs);

  fs.mkdirSync("assets", { recursive: true });
  fs.writeFileSync(OUTPUT, svg.trim());
})();
