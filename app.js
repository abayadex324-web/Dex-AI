
const files = {
  html: `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Project DEX</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="card">
    <h1>Halo, Developer!</h1>
    <p>Selamat datang di project pertamamu.</p>
    <button id="hello">Klik saya</button>
    <p id="result"></p>
  </main>
  <script src="script.js"><\/script>
</body>
</html>`,

  css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #101827;
  color: white;
  font-family: Arial, sans-serif;
}
.card {
  text-align: center;
  padding: 32px;
  border: 1px solid #00eaff;
  border-radius: 16px;
}
button {
  padding: 10px 18px;
  background: #00eaff;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}`,

  js: `document.querySelector("#hello")?.addEventListener("click", () => {
  const result = document.querySelector("#result");
  result.textContent = "DEX AI preview berhasil!";
});`
};

let active = "html";

const code = document.querySelector("#code");
const gutter = document.querySelector("#gutter");
const preview = document.querySelector("#preview");

function updateGutter() {
  if (!code) return;

  const lines = code.value.split("\n").length;

  if (gutter) {
    gutter.textContent = Array.from(
      { length: lines },
      (_, i) => i + 1
    ).join("\n");
  }

  const lineInfo = document.querySelector("#lineInfo");

  if (lineInfo) {
    const before = code.value.slice(0, code.selectionStart);
    const line = before.split("\n").length;
    const col = before.length - before.lastIndexOf("\n");

    lineInfo.textContent = `Ln ${line}, Col ${col}`;
  }
}

function render() {
  if (!preview) return;

  let html = files.html;

  html = html.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/i,
    `<style>${files.css}</style>`
  );

  const script = "<scr" + "ipt>" +
    files.js +
    "</scr" + "ipt>";

  if (/<script\s+src=["']script\.js["']\s*><\/script>/i.test(html)) {
    html = html.replace(
      /<script\s+src=["']script\.js["']\s*><\/script>/i,
      script
    );
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, script + "</body>");
  } else {
    html += script;
  }

  preview.srcdoc = html;
}

function load() {
  if (!code) return;

  code.value = files[active];

  document.querySelectorAll("[data-file]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.file === active
    );
  });

  const fileInfo = document.querySelector("#fileInfo");

  if (fileInfo) {
    fileInfo.textContent = active.toUpperCase() + " · LOCAL";
  }

  updateGutter();
  render();
}

function saveCurrent() {
  if (code) {
    files[active] = code.value;
  }
}

if (code) {
  code.addEventListener("input", () => {
    files[active] = code.value;
    updateGutter();
    render();
  });

  code.addEventListener("click", updateGutter);
  code.addEventListener("keyup", updateGutter);
}

document.querySelectorAll("[data-file]").forEach(button => {
  button.addEventListener("click", () => {
    saveCurrent();
    active = button.dataset.file;
    load();
  });
});

document.querySelector("#refresh")?.addEventListener("click", () => {
  saveCurrent();
  render();
});

document.querySelector("#saveBtn")?.addEventListener("click", () => {
  saveCurrent();

  try {
    localStorage.setItem(
      "dexai-project",
      JSON.stringify(files)
    );

    alert("Project berhasil disimpan!");
  } catch (error) {
    alert("Gagal menyimpan project.");
    console.error(error);
  }
});

try {
  const old = JSON.parse(
    localStorage.getItem("dexai-project")
  );

  if (old && typeof old === "object") {
    ["html", "css", "js"].forEach(key => {
      if (typeof old[key] === "string") {
        files[key] = old[key];
      }
    });
  }
} catch (error) {
  console.error("Gagal membaca project:", error);
}

document.querySelector("#newProject")?.addEventListener("click", () => {
  if (!confirm("Buat project baru?")) return;

  files.html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Project Baru</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Project Baru</h1>
  <script src="script.js"><\/script>
</body>
</html>`;

  files.css = "body { font-family: Arial; }";
  files.js = "// Tulis JavaScript di sini";

  active = "html";
  load();
});

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "html" || action === "js") {
      active = action;
    }

    if (action === "clear") {
      files[active] = "";
    }

    load();
  });
});

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    const isAssistant = button.dataset.tab === "assistant";

    document.querySelector("#studioView")
      ?.classList.toggle("hidden", isAssistant);

    document.querySelector("#assistantView")
      ?.classList.toggle("hidden", !isAssistant);

    const viewName = document.querySelector("#viewName");

    if (viewName) {
      viewName.textContent = isAssistant
        ? "AI ASSISTANT"
        : "CODE STUDIO";
    }

    document.querySelectorAll(".nav").forEach(nav => {
      nav.classList.toggle("active", nav === button);
    });

    document.querySelector("#sidebar")
      ?.classList.remove("open");
  });
});

document.querySelector("#hamb")?.addEventListener("click", () => {
  document.querySelector("#sidebar")?.classList.toggle("open");
});

document.querySelector("#openPreview")?.addEventListener("click", () => {
  saveCurrent();

  const win = window.open("", "_blank");

  if (!win) {
    alert("Izinkan pop-up untuk membuka preview.");
    return;
  }

  const html = files.html
    .replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/i,
      `<style>${files.css}</style>`
    )
    .replace(
      /<script\s+src=["']script\.js["']\s*><\/script>/i,
      "<scr" + "ipt>" + files.js + "</scr" + "ipt>"
    );

  win.document.open();
  win.document.write(html);
  win.document.close();
});

document.querySelector("#chatSend")?.addEventListener("click", () => {
  const input = document.querySelector("#chatInput");
  const log = document.querySelector("#chatLog");

  if (!input || !log || !input.value.trim()) return;

  const message = document.createElement("p");

  message.textContent =
    "AI online belum dihubungkan. Pesan kamu: " +
    input.value.trim();

  log.appendChild(message);
  input.value = "";
});

document.querySelector("#chatInput")?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    document.querySelector("#chatSend")?.click();
  }
});

load();

console.log("DEX AI berhasil dimuat!");
