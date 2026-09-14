const { test: base, expect } = require("@playwright/test");
const { cleanupUser } = require("./helpers/firebase-emulators");

const forbiddenProductionHosts = [
  "firebaseapp.com",
  "firebaseio.com",
  "googleapis.com",
  "cloudfunctions.net",
  "vercel.app",
];

const test = base.extend({
  cleanupUids: async ({}, use) => {
    const uids = [];
    await use(uids);

    for (const uid of [...uids].reverse()) {
      await cleanupUser(uid);
    }
  },

  page: async ({ page, context }, use, testInfo) => {
    const blockedProductionRequests = [];

    await context.addInitScript(() => {
      window.grecaptcha = {
        ready(callback) {
          callback();
        },
        async execute() {
          return "cmu-e2e-emulator-token";
        },
      };
    });

    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      const isRecaptcha =
        ["www.google.com", "www.recaptcha.net"].includes(url.hostname) &&
        url.pathname.includes("recaptcha");

      if (isRecaptcha) {
        await route.abort("blockedbyclient");
        return;
      }

      const isProduction = forbiddenProductionHosts.some(host =>
        url.hostname === host || url.hostname.endsWith(`.${host}`)
      );

      if (isProduction) {
        blockedProductionRequests.push(url.toString());
        await route.abort("blockedbyclient");
        return;
      }

      await route.continue();
    });

    await use(page);

    if (blockedProductionRequests.length) {
      await testInfo.attach("blocked-production-requests", {
        body: blockedProductionRequests.join("\n"),
        contentType: "text/plain",
      });
    }

    expect(blockedProductionRequests).toEqual([]);
  },
});

module.exports = { expect, test };
