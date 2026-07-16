import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

type Check = {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
};

const checks: Check[] = [];

function addCheck(
  category: string,
  name: string,
  passed: boolean,
  details = ""
) {
  checks.push({
    category,
    name,
    passed,
    details,
  });
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(importerRoot, relativePath));
}

let importerRoot = process.cwd();

if (exists("backend/importer")) {
  importerRoot = path.join(importerRoot, "backend", "importer");
}

console.clear();

console.log("==================================================");
console.log("          SutraSparsh Doctor v1.0");
console.log("==================================================");
console.log("");

console.log("Importer Root");
console.log(importerRoot);
console.log("");

/* -------------------------------- */
/* SYSTEM */
/* -------------------------------- */

const nodeMajor = Number(process.version.split(".")[0].replace("v", ""));

addCheck(
  "System",
  `Node.js ${process.version}`,
  nodeMajor >= 24,
  "Requires Node.js >=24"
);

addCheck(
  "System",
  os.platform(),
  true
);

addCheck(
  "System",
  os.arch(),
  true
);

/* -------------------------------- */
/* PROJECT */
/* -------------------------------- */

addCheck(
  "Project",
  "package.json",
  exists("package.json")
);

addCheck(
  "Project",
  "tsconfig.json",
  exists("tsconfig.json")
);

addCheck(
  "Project",
  ".env",
  exists(".env")
);

addCheck(
  "Project",
  ".env.example",
  exists(".env.example")
);

addCheck(
  "Project",
  "config/",
  exists("config")
);

addCheck(
  "Project",
  "firebase-service-account.json",
  exists("config/firebase-service-account.json")
);

addCheck(
  "Project",
  "logs/",
  exists("logs")
);

addCheck(
  "Project",
  "src/",
  exists("src")
);

addCheck(
  "Project",
  "tests/",
  exists("tests")
);

addCheck(
  "Project",
  "dist/",
  exists("dist"),
  "Will be created after build."
);

/* -------------------------------- */
/* REPORT */
/* -------------------------------- */

let passed = 0;

let currentCategory = "";

for (const check of checks) {

  if (check.category !== currentCategory) {

    currentCategory = check.category;

    console.log("");
    console.log(currentCategory);
    console.log("--------------------------------------------");

  }

  if (check.passed) {

    console.log(`✅ ${check.name}`);
    passed++;

  } else {

    console.log(`❌ ${check.name}`);

    if (check.details.length > 0) {

      console.log(`   ${check.details}`);

    }

  }

}

const score = Math.round((passed / checks.length) * 100);

console.log("");
console.log("==================================================");
console.log(`Health Score : ${passed}/${checks.length} (${score}%)`);
console.log("==================================================");

if (score === 100) {

  console.log("");
  console.log("🟢 SutraSparsh Import Engine is READY.");
  console.log("");

  process.exit(0);

}

if (score >= 80) {

  console.log("");
  console.log("🟡 SutraSparsh Import Engine is MOSTLY READY.");
  console.log("");

  process.exit(0);

}

console.log("");
console.log("🔴 SutraSparsh Import Engine requires attention.");
console.log("");

process.exit(1);