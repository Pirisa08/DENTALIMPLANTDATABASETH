import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("./MasterDataList.jsx", import.meta.url), "utf8");

test("master data list uses client-side navigation instead of document reloads", () => {
  assert.doesNotMatch(source, /window\.location\.href|location\.href|\.reload\(/);
  assert.match(source, /useNavigate/);
  assert.match(source, /navigate\(`\/admin\/master\/officialDistributor\/\$\{x\.id\}`\)/);
  assert.match(
    source,
    /navigate\(`\/admin\/master\/officialDistributor\/\$\{x\.id\}\/edit\/\$\{d\.id\}`\)/
  );
  assert.match(source, /navigate\(`\/admin\/master\/officialDistributor\/\$\{x\.id\}\/new`\)/);
});
