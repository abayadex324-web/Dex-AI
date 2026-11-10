// Isi dengan URL Worker setelah backend berhasil dipublikasikan.
const API_URL = "PASTE_CLOUDFLARE_WORKER_URL_HERE";

const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const feed = document.getElementById("chatFeed");
const welcome = document.getElementById("welcome");
const newChat = document.getElementById("newChat");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

let history = [];

function showChat() {
  welcome.style.display = "none";
  feed.classList.add("active");
}
function addMessage(role, content, isError = false) {
  showChat();
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "YOU" : (isError ? "SYSTEM NOTICE" : "DEX AI");
  bubble.appendChild(label);

  // Pisahkan blok kode agar mudah disalin. Semua isi dibuat dengan textContent
  // supaya teks balasan AI tidak dieksekusi sebagai HTML.
  const parts = String(content).split(/```([\w+-]*)\n?([\s\S]*?)```/g);
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) {
      const p = document.createElement("div");
      p.textContent = parts[i].trim();
      bubble.appendChild(p);
    }
    if (i + 2 < parts.length) {
      const lang = parts[i + 1] || "code";
      const code = parts[i + 2].replace(/\n$/, "");
      const wrap = document.createElement("div");
      wrap.className = "code-block";
      const head = document.createElement("div");
      head.className = "code-head";
      const tag = document.createElement("span");
      tag.textContent = lang.toUpperCase();
      const copy = document.createElement("button");
      copy.className = "copy-code";
      copy.textContent = "COPY";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
          copy.textContent = "COPIED";
          setTimeout(() => copy.textContent = "COPY", 1200);
        } catch { copy.textContent = "GAGAL"; }
      });
      head.append(tag, copy);
      const pre = document.createElement("pre");
      pre.textContent = code;
      wrap.append(head, pre);
      bubble.appendChild(wrap);
    }
  }
  feed.appendChild(bubble);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  return bubble;
}
function setLoading(loading) {
  sendButton.disabled = loading;
  sendButton.textContent = loading ? "…" : "➤";
}
async function sendMessage(text) {
  const prompt = text.trim();
  if (!prompt || sendButton.disabled) return;
  if (API_URL.includes("PASTE_CLOUDFLARE")) {
    addMessage("assistant", "Backend belum diatur. Selesaikan tahap Cloudflare Worker, lalu tempel URL Worker ke variabel API_URL di app.js.");
    return;
  }
  addMessage("user", prompt);
  history.push({ role: "user", content: prompt });
  input.value = "";
  input.style.height = "auto";
  const loadingBubble = addMessage("assistant", "Menghubungkan ke AI core...");
  setLoading(true);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-12) })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    if (!data.reply) throw new Error("Balasan AI kosong.");
    loadingBubble.remove();
    history.push({ role: "assistant", content: data.reply });
    addMessage("assistant", data.reply);
  } catch (error) {
    loadingBubble.remove();
    history.pop();
    addMessage("assistant", `Gagal menghubungi AI: ${error.message}\nPeriksa URL Worker, API key, dan koneksi internet.`, true);
  } finally {
    setLoading(false);
    input.focus();
  }
}
sendButton.addEventListener("click", () => sendMessage(input.value));
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 170) + "px";
});
document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
});
newChat.addEventListener("click", () => {
  history = [];
  feed.innerHTML = "";
  feed.classList.remove("active");
  welcome.style.display = "";
  sidebar.classList.remove("open");
  input.value = "";
});
menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
