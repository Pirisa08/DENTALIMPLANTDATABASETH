import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const footerSource = readFileSync(new URL("./Footer.jsx", import.meta.url), "utf8");
const footerStyles = readFileSync(new URL("./Footer.module.css", import.meta.url), "utf8");

test("mobile footer uses a clean copyright symbol and compact brand layout", () => {
  assert.match(footerSource, /© 2025 MFU Dental Implant Database/);
  assert.doesNotMatch(footerSource, /ยฉ 2025/);
  assert.match(footerSource, /className=\{styles\.mobileFooterCard\}/);
  assert.match(footerStyles, /\.mobileFooterCard/);
  assert.match(footerStyles, /\.mobileFooterCard[\s\S]*border-radius:\s*18px/);
});

test("mobile footer leaves breathing room above the floating bottom navigation", () => {
  assert.match(footerStyles, /padding-bottom:\s*calc\(10px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(footerStyles, /\.footerBottom[\s\S]*border-top:\s*1px solid rgba\(188, 212, 255, 0\.1\)/);
});
