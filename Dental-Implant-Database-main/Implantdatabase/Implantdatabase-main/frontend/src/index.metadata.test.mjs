import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("site metadata does not use the MFU logo as a browser or mobile icon", () => {
  assert.doesNotMatch(indexHtml, /rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*logo_mfu\.jpg/i);
  assert.doesNotMatch(indexHtml, /href="\/logo_mfu\.jpg"/i);
  assert.match(indexHtml, /<title>MFU Dental Implant<\/title>/);
});
