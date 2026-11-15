import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createCipheriv, createHmac, randomBytes } from "node:crypto";
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "../android/app/src/main/assets/www";
/** SHA-256 of the app's signing certificate (apksigner verify --print-certs). */
const CERT_SHA256 = "62f5b3aafcd51befb5939bca98b2ad2562f0b57b6a606c7367dbb51baa6f2390";
const PACKAGE = "com.nihongopath.app";

/** Same bytes as ContentKey.pepper() in the Android app (Java int xorshift). */
function pepper() {
  const b = Buffer.alloc(32);
  let x = 0x5a17c3e9 | 0;
  for (let i = 0; i < 32; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x |= 0; b[i] = (x ^ (i * 37 + 11)) & 0xff; }
  return b;
}
export const contentKey = () => createHmac("sha256", pepper()).update(Buffer.from(CERT_SHA256, "hex")).update(PACKAGE, "utf8").digest();

const LOADER = `<script>
(function(){
  function fail(){document.getElementById("root").innerHTML='<div style="font:16px system-ui;padding:40px 24px;text-align:center;color:#555">This copy of Nihongo Path cannot open its content.<br><br>Please install the official app.</div>';}
  var N=window.Native, hex=(N&&N.contentKey)?N.contentKey():(window.__npKey||"");
  if(!hex||!window.crypto||!crypto.subtle){fail();return;}
  var k=new Uint8Array(hex.match(/../g).map(function(h){return parseInt(h,16)}));
  fetch("assets/app.bin").then(function(r){return r.arrayBuffer()}).then(function(buf){
    var raw=new Uint8Array(buf);
    return crypto.subtle.importKey("raw",k,"AES-GCM",false,["decrypt"]).then(function(key){return crypto.subtle.decrypt({name:"AES-GCM",iv:raw.slice(0,12)},key,raw.slice(12));});
  }).then(function(pt){var s=document.createElement("script");s.type="module";s.src=URL.createObjectURL(new Blob([pt],{type:"text/javascript"}));document.body.appendChild(s);}).catch(fail);
})();
</script>`;

/** Encrypts the whole app bundle (code + all lessons, words, sentences, culture) with AES-256-GCM. */
function encryptBundle(): Plugin {
  return {
    name: "np-encrypt-bundle",
    apply: "build",
    closeBundle() {
      if (process.env.NP_PLAIN === "1") return;
      const dir = join(__dirname, OUT, "assets");
      const js = readdirSync(dir).filter((f) => f.endsWith(".js"));
      if (js.length !== 1) throw new Error("expected a single JS bundle, got " + js.join(", "));
      const code = readFileSync(join(dir, js[0]));
      const iv = randomBytes(12);
      const c = createCipheriv("aes-256-gcm", contentKey(), iv);
      const enc = Buffer.concat([iv, c.update(code), c.final(), c.getAuthTag()]);
      writeFileSync(join(dir, "app.bin"), enc);
      unlinkSync(join(dir, js[0]));
      const htmlPath = join(__dirname, OUT, "index.html");
      let html = readFileSync(htmlPath, "utf8");
      html = html.replace(new RegExp(`<script type="module" crossorigin src="./assets/${js[0]}"></script>`), "");
      if (html.includes(js[0])) throw new Error("bundle tag not replaced");
      html = html.replace("</body>", LOADER + "\n</body>");
      writeFileSync(htmlPath, html);
    },
  };
}

// The build is written straight into the Android app's assets so Gradle packages it.
export default defineConfig({
  base: "./",
  plugins: [react(), encryptBundle()],
  build: {
    outDir: OUT,
    emptyOutDir: true,
    target: "es2019",
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: 0,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
