import type Discord from "discord.js-selfbot-v13";
import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import ytdl from "ytdl-core";

class Video {
  owner: string | undefined;
  in_progress = false;
  in_loading = false;
  init = false;
  killed = false;
  driver: webdriver.ThenableWebDriver | undefined;
  guild_id: string | undefined;
  channel_id: string | undefined;
  duration: any;
  client_url = `file://${__dirname}/client/index.html`;

  async load(url: string, youtube_dl: boolean, msg: Discord.Message<boolean>) {
    if (this.in_loading) return;
    this.in_loading = true;
    this.driver?.executeScript("video.innerHTML = null");

    if (youtube_dl) {
      await msg.edit("Fetching video formats...").then(async (msg) => {
        console.log("Fetching video formats...");
        try {
          let info = await ytdl.getInfo(url);
          let formats = info.formats.filter((f) => f.hasVideo && f.hasAudio);
          formats = formats.filter((f) => (f?.height || 0) <= 720 && (f.fps || 0) <= 30);
          formats = formats.sort((a, b) => (b.height || 0) - (a.height || 0));

          url = formats[0].url;
        } catch (e) {
          console.error({ ...(e as Error) });
          msg.edit(":no_entry_sign: " + String(e));
        }
      });
    }

    await this.driver?.executeScript(`video.src='${url}'`).then(() => {
      console.log("Loading...");
      msg.edit("Loading...").then(() => {
        var int1 = setInterval(() => {
          is_error && clearInterval(int1);

          if (this.killed) {
            msg.edit(":no_entry_sign: Loading stopped");
            this.in_loading = false;
            this.killed = false;
            clearInterval(int1);
            clearInterval(int2);
            clearInterval(int3);
          }

          this.driver?.getCurrentUrl().then((url) => {
            if (!this.init && url === "file:///channels/@me") {
              this.init = true;
              this.open_guild();
              this.join();
              clearInterval(int1);
            } else if (this.init) clearInterval(int1);
          });
        }, 10);
      });
    });

    // Wait until video load
    let is_load: boolean = false;
    let is_error: boolean = false;
    var int2 = setInterval(() => {
      this.driver?.executeScript("return video.duration").then((result) => {
        if (result) {
          // TODO: Check result type
          is_load = true;
          this.duration = result as any;
          this.in_loading = false;
          msg.edit("Done, Type `*play` to start playing.");
          clearInterval(int2);
        } else if (is_error) clearInterval(int2);
      });
    }, 10);

    // Error event

    var int3 = setInterval(() => {
      this.driver?.executeScript("return video_error").then((error_msg) => {
        if (error_msg) {
          msg.edit(":no_entry_sign: " + error_msg);
          is_error = true;
          this.in_loading = false;
          this.driver?.executeScript('video_error = ""');
          clearInterval(int3);
          return;
        } else if (is_load) clearInterval(int3);
      });
    }, 10);
  }

  start() {
    this.driver
      ?.executeScript(
        `
                var streamBtn_inject = document.querySelector('[aria-label="Share Your Screen"]')
                !streamBtn_inject.className.includes('buttonActive-3FrkXp') &&
                    streamBtn_inject.click()
        `,
      )
      .catch((e) => e);
  }

  play() {
    console.log("Play");
    this.start();
    this.driver?.executeScript("video.play()");
  }

  pause() {
    console.log("Pause");
    this.driver?.executeScript("video.pause()");
  }

  current(time?: string) {
    if (time) {
      if (time[0] === "+" || time[0] === "-") {
        this.current()?.then((c) => {
          if (!c) return;

          let r;
          const v = parseFloat(c);
          const s = parseInt(time.slice(1));

          time[0] === "+" ? (r = v + s) : (r = v - s);

          this.driver?.executeScript(`video.currentTime = ${r}`);
        });
      } else this.driver?.executeScript(`video.currentTime = ${time}`);
    } else return this.driver?.executeScript<string>("return video.currentTime");
  }

  open_guild() {
    this.driver?.executeScript(
      `document.querySelector('[data-list-item-id="guildsnav___${this.guild_id}"]').click()`,
    );
  }

  join() {
    var intJoin = setInterval(() => {
      this.driver
        ?.executeScript(
          `document.querySelector("[data-list-item-id='channels___${this.channel_id}']").click()`,
        )
        .then(() => {
          setTimeout(() => {
            this.start();
          }, 1000);

          clearInterval(intJoin);
        })
        .catch(() => this.scroll());
    }, 10);
  }

  hms(sec: number) {
    if (sec) return new Date(sec * 1000).toISOString().substr(11, 8);
    return sec;
  }

  scroll() {
    this.driver?.executeScript(`
            var c_inject = document.getElementById("channels");
            if( c_inject.scrollTop === (c_inject.scrollHeight - c_inject.offsetHeight))
                c_inject.scroll(0, 0)
            else
                c_inject.scroll(0, c_inject.scrollTop + 250)
        `);
  }
}

export class Stream extends Video {
  constructor(token: string, headless = true) {
    super();
    const chrome_options = new chrome.Options();
    headless && chrome_options.addArguments("--headless");
    chrome_options.addArguments("--no-sandbox");
    chrome_options.addArguments("--window-size=1920,1080");
    chrome_options.addArguments("--disable-web-security");
    chrome_options.addArguments("--disable-gpu");
    chrome_options.addArguments("--disable-features=NetworkService");
    chrome_options.addArguments("--autoplay-policy=no-user-gesture-required");
    chrome_options.addArguments(
      "user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36",
    );
    console.log("Webdriver started");
    this.driver = new webdriver.Builder()
      .forBrowser("chrome")
      .setChromeOptions(chrome_options)
      .build();
    this.driver.get(this.client_url);
    this.driver.executeScript(`localStorage.setItem("token", '"${token}"')`);
  }

  is_full() {
    return this.driver?.executeScript(`
            return document.querySelector("[aria-label='Channel is full']")
        `);
  }

  is_locked() {
    return this.driver?.executeScript(`
            return document.querySelector("[data-list-item-id='channels___${this.channel_id}']").innerHTML.includes("Voice (Locked)")
        `);
  }

  stop() {
    console.log("Stop");
    this.init = false;
    this.driver?.get(this.client_url);
  }
}
