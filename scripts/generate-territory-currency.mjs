// Regenerates lib/locale/territoryCurrency.json from Unicode CLDR data.
// Run manually (`node scripts/generate-territory-currency.mjs`) whenever
// cldr-core is updated (e.g. after a currency changeover) - not part of the
// build. cldr-core is a devDependency only; nothing here ships at runtime,
// just the static JSON it produces.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import territoryInfoModule from "cldr-core/supplemental/territoryInfo.json" with { type: "json" };
import currencyDataModule from "cldr-core/supplemental/currencyData.json" with { type: "json" };

const territoryInfo = territoryInfoModule.supplemental.territoryInfo;
const currencyRegionData = currencyDataModule.supplemental.currencyData.region;

/**
 * CLDR lists every currency a territory has ever used, in an order that
 * puts the current primary currency first among the still-valid entries.
 * "Still valid" means no `_to` (not superseded) and not a non-circulating
 * unit (`_tender: "false"`, e.g. the IMF's USN alongside USD).
 */
function currentCurrency(territoryCode) {
  const entries = currencyRegionData[territoryCode];
  if (!entries) return undefined;
  for (const entry of entries) {
    const [currency, attrs] = Object.entries(entry)[0];
    if (!attrs._to && attrs._tender !== "false") return currency;
  }
  return undefined;
}

// territoryInfo's key set is exactly the real ISO 3166-1 territories CLDR
// tracks (population/literacy data) - it excludes aggregate/historical
// codes that currencyData's own region list still carries (EU, SU, YU,
// former country codes, etc.), so intersecting against it is what keeps
// this map to actual countries/territories rather than every code CLDR
// has ever assigned a currency to.
const result = {};
for (const code of Object.keys(territoryInfo).sort()) {
  const currency = currentCurrency(code);
  if (currency) result[code] = currency;
}

const outPath = fileURLToPath(new URL("../lib/locale/territoryCurrency.json", import.meta.url));
await writeFile(outPath, JSON.stringify(result, null, 2) + "\n");
console.log(`Wrote ${Object.keys(result).length} territories to ${outPath}`);
