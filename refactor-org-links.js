const fs = require("fs");
const path = require("path");

const NAV_PATHS = [
  "/dashboard",
  "/settings",
  "/clients",
  "/assessments",
  "/services"
];

const FILE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else if (FILE_EXTENSIONS.includes(path.extname(f))) {
      callback(path.join(dir, f));
    }
  });
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  NAV_PATHS.forEach((navPath) => {
    // Replace Link href="/dashboard" or href='/dashboard'
    const linkRegex = new RegExp(
      `<Link\\s+href=(["'])${navPath}\\1`,
      "g"
    );
    if (linkRegex.test(content)) {
      content = content.replace(
        linkRegex,
        `<Link href={\`/\${organizationId}${navPath}\`}`
      );
      changed = true;
    }

    // Replace router.push("/dashboard") or router.replace("/dashboard")
    const routerRegex = new RegExp(
      `(router\\.(push|replace))\\((["'])${navPath}\\3\\)`,
      "g"
    );
    if (routerRegex.test(content)) {
      content = content.replace(
        routerRegex,
        `$1(\`/\${organizationId}${navPath}\`)`
      );
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
  }
}

console.log("Refactoring navigation links to use [organizationId]-scoped routes...");
walk("./app", refactorFile);
walk("./components", refactorFile);
console.log("Done! Review your changes and test your app.");
