import assert from "node:assert/strict";
import { buildBlogPreviewPost, getBlogPreviewModes } from "./blogPreview.js";

const post = buildBlogPreviewPost({
  title: "  Guided Implant Planning  ",
  description: "Planning summary",
  publishedDate: "2026-09-14T10:30",
  readTime: "5 Min",
  category: "Clinical Research",
  author: "Admin",
  content: "First paragraph\n\nSecond paragraph",
  manualUrl: "https://example.com/manual",
  referenceUrl: "https://example.com/reference",
  imageDataUrl: "data:image/png;base64,abc",
  status: "Inactive",
});

assert.equal(post.title, "Guided Implant Planning");
assert.equal(post.excerpt, "Planning summary");
assert.equal(post.published, "September 14, 2026");
assert.equal(post.readTime, "5 Min");
assert.equal(post.category, "Clinical Research");
assert.equal(post.author, "Admin");
assert.equal(post.contentHtml, "<p>First paragraph</p><p>Second paragraph</p>");
assert.equal(post.manualUrl, "https://example.com/manual");
assert.equal(post.referenceUrl, "https://example.com/reference");
assert.equal(post.imageDataUrl, "data:image/png;base64,abc");
assert.equal(post.statusLabel, "Inactive");

const fallback = buildBlogPreviewPost({});

assert.equal(fallback.title, "Untitled blog post");
assert.equal(fallback.category, "News");
assert.equal(fallback.contentHtml, "<p>No content available.</p>");
assert.deepEqual(getBlogPreviewModes(), ["article"]);

console.log("blog preview tests passed");
