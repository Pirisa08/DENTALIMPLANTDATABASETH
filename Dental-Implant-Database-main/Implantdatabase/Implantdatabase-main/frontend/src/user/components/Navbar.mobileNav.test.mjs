import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const navbarSource = readFileSync(
  new URL("./Navbar.jsx", import.meta.url),
  "utf8"
);

const navbarStyles = readFileSync(
  new URL("./Navbar.module.css", import.meta.url),
  "utf8"
);

test("mobile navigation renders as a floating bottom action card", () => {
  assert.match(navbarSource, /mobileBottomNav/);
  assert.match(navbarSource, /aria-label="Mobile bottom navigation"/);
  assert.match(navbarStyles, /\.mobileBottomNav/);
  assert.match(navbarStyles, /position:\s*fixed/);
  assert.match(navbarStyles, /bottom:\s*calc\(/);
});

test("mobile bottom navigation keeps only the four primary page links", () => {
  for (const label of ["Home", "Blog", "Implants", "Contact"]) {
    assert.match(navbarSource, new RegExp(`>${label}<|aria-label="${label}`));
  }

  assert.doesNotMatch(navbarSource, /className=\{styles\.mobileBottomButton\}/);
  assert.match(navbarStyles, /grid-template-columns:\s*repeat\(4,/);
});

test("mobile bottom navigation uses the site navy capsule style", () => {
  assert.match(navbarStyles, /\.mobileBottomNav[\s\S]*border-radius:\s*999px/);
  assert.match(navbarStyles, /\.mobileBottomNav[\s\S]*background:\s*#0f172a/);
  assert.match(navbarStyles, /\.mobileBottomActive[\s\S]*color:\s*#93c5fd/);
});

test("mobile bottom navigation hides while scrolling down and reappears while scrolling up", () => {
  assert.match(navbarSource, /mobileBottomHidden/);
  assert.match(navbarSource, /lastScrollYRef/);
  assert.match(navbarSource, /window\.addEventListener\("scroll"/);
  assert.match(navbarSource, /setBottomNavHidden\(true\)/);
  assert.match(navbarSource, /setBottomNavHidden\(false\)/);
  assert.match(navbarStyles, /\.mobileBottomHidden/);
  assert.match(navbarStyles, /translate\(-50%,\s*calc\(100% \+ 28px\)\)/);
});

test("mobile bottom navigation does not add document-end body padding", () => {
  assert.doesNotMatch(navbarStyles, /:global\(body\)\s*\{[\s\S]*?padding-bottom:\s*86px/);
});

test("mobile top utility actions render as small circles", () => {
  assert.match(navbarStyles, /\.nightModeBtn,[\s\S]*\.filterBtn[\s\S]*border-radius:\s*999px/);
  assert.match(navbarStyles, /\.searchBox[\s\S]*border-radius:\s*999px/);
});

test("mobile search and filter stay in the top navigation", () => {
  assert.match(navbarSource, /aria-label=\{isMobile && searchOpen \? "Search" : "Open search"\}/);
  assert.match(navbarSource, /aria-label="Open filters"/);
  assert.match(navbarSource, /setSearchOpen\(true\)/);
  assert.match(navbarSource, /setFilterOpen\(true\)/);
});

test("navbar navigation does not trigger a full document reload", () => {
  assert.doesNotMatch(navbarSource, /window\.location|location\.href|\.reload\(/);
});
