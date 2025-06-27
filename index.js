const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const BasePage = require("./WebPage");

async function sleep(sec) {
  return new Promise((res) => setTimeout(res, sec * 1000));
}

async function startBot() {
  const page = new BasePage();

  // Direct login link
  await page.visit(
    "https://www.linkedin.com/uas/login?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F",
  );
  await sleep(3);

  await page.signin();
  await sleep(10);

  const invitationUrl =
    "https://www.linkedin.com/mynetwork/invitation-manager/received";
  await page.visit(invitationUrl);
  await sleep(5);

  // Click "Show all" if visible
  const showAll = await page.driver.findElements(
    By.xpath("//a[contains(text(), 'Show all')]"),
  );
  if (showAll.length > 0) {
    console.log("▶️ Clicking 'Show all'");
    await showAll[0].click();
    await sleep(3);
  }

  // Accept loop with exit condition
  let zeroClickCount = 0;
  const maxZeroStreak = 3;

  for (let i = 0; i < 100; i++) {
    try {
      const clicked = await page.pressAcceptButton();

      if (clicked === 0) {
        zeroClickCount++;
        console.log(`⚠️ No Accepts found (streak: ${zeroClickCount})`);
      } else {
        zeroClickCount = 0;
      }

      if (zeroClickCount >= maxZeroStreak) {
        console.log("🛑 No Accept buttons found 3 times in a row. Stopping.");
        break;
      }

      await page.scrollToBottom();
      await sleep(3);
    } catch (e) {
      console.error("❌ Error in loop:", e.message);
    }
  }

  await sleep(2);
  await page.driver.quit();
}

startBot();
