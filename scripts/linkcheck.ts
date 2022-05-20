import { green, red } from "chalk";
import { exec } from "child_process";
import * as fs from "fs";
import { getHaystackReleaseTagNames } from "../lib/github";

async function main() {
  const logFile: string = "linkcheck.log";
  const excludeDomains: string = "googletagmanager.com";

  var versions = await getHaystackReleaseTagNames();
  versions = versions.filter((tagName) => tagName.startsWith("v"));
  // prepend `latest` version, i.e. no version string in the URL
  versions = [""].concat(versions);
  console.log(versions);

  for (var version of versions) {
    const localUrl: string = `http://localhost:3000/overview/${version}/intro`;
    const cmd: string = `wget --spider -r -nd -nv -H -l 1 --exclude-domains ${excludeDomains} -o ${logFile}  ${localUrl}`;

    console.log(`Crawling ${localUrl} recursively...`);
    exec(cmd, (error, stdout, stderr) => {
      const crawlingLogs: string = fs.readFileSync(logFile, "utf8");
      const idx: number = crawlingLogs.search(/Found \d+ broken link[s]?\./g);
      if (idx != -1) {
        console.log(
          red(`error checking ${localUrl}: `) + crawlingLogs.substring(idx)
        );
        process.exitCode = 1;
        return;
      }

      console.log(green("success ") + `No broken links found in ${localUrl}`);
    });
  }
}

main();
