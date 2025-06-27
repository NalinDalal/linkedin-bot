require("dotenv").config();
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

function initOptions(o) {
  o.addArguments("--disable-infobars");
  o.addArguments("--no-sandbox");
  o.addArguments("--disable-dev-shm-usage");
  o.addArguments(
    "user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  );
}

const BasePage = function () {
  let o = new chrome.Options();
  initOptions(o);

  this.driver = new Builder()
    .withCapabilities({ acceptSslCerts: true, acceptInsecureCerts: true })
    .setChromeOptions(o)
    .forBrowser("chrome")
    .build();

  this.visit = async function (url) {
    return await this.driver.get(url);
  };

  this.findById = async function (id) {
    await this.driver.wait(until.elementLocated(By.id(id)), 10000);
    return await this.driver.findElement(By.id(id));
  };

  this.signin = async function () {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    try {
      // Step 1: If landing page shown, click “Sign in”
      const signInLanding = await this.driver.findElements(
        By.linkText("Sign in"),
      );
      if (signInLanding.length > 0) {
        await signInLanding[0].click();
        await this.driver.wait(until.elementLocated(By.id("username")), 10000);
      }

      // Step 2: Enter username and password
      const usernameField = await this.driver.findElement(By.id("username"));
      const passwordField = await this.driver.findElement(By.id("password"));

      await usernameField.clear();
      await usernameField.sendKeys(username);

      await passwordField.clear();
      await passwordField.sendKeys(password);

      // Step 3: Click submit
      const submitButton = await this.driver.findElement(
        By.css("button[type='submit']"),
      );
      await submitButton.click();

      console.log("Login submitted...");
    } catch (err) {
      console.error("❌ Login error:", err.message);
    }
  };

  this.pressAcceptButton = async function () {
    const buttons = await this.driver.findElements(
      By.css('button[type="button"]'),
    );

    let clickedCount = 0;

    for (const btn of buttons) {
      try {
        const label = await btn.getAttribute("aria-label");
        const text = await btn.getText();

        // Check if aria-label or inner text indicates this is an "Accept" button
        if (
          (label && label.toLowerCase().includes("accept")) ||
          (text && text.trim().toLowerCase() === "accept")
        ) {
          await btn.click();
          clickedCount++;
          await this.driver.sleep(1000); // sleep to avoid too-fast interactions
        }
      } catch (e) {
        console.warn("❌ Could not click button:", e.message);
      }
    }

    console.log(`✅ Clicked ${clickedCount} Accept button(s)`);
    return clickedCount;
  };

  this.scrollToBottom = async function () {
    await this.driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight);",
    );
  };
};

module.exports = BasePage;
