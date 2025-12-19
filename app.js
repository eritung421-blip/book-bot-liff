// ✅ 你要改的只有這兩個
const GAS_URL = "https://script.google.com/macros/s/AKfycbwqUnCj87C0LeA6vcoLo6ygbr7zjbd7Go2DwEK8bz3r-1gtRtlrradmhZ3iI3qUFb-d/exec";
const LIFF_ID = "2008731100-q3JK2BPf";

async function initLiff() {
  await liff.init({
    liffId: LIFF_ID,
    // 外部瀏覽器時可自動導登入（你目前不取 profile 也可以先留著）
    withLoginOnExternalBrowser: true
  });
}

function numOrZero(v){
  const n = Number(String(v || "").trim());
  return Number.isFinite(n) ? n : 0;
}

document.getElementById("bookForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "送出中…";

  const payload = {
    source: "liff",
    action: "create_book",
    silent: true, // ✅ 安靜模式：只存 Notion，不發 LINE 訊息
    data: {
      title: document.getElementById("title").value.trim(),
      author: document.getElementById("author").value.trim(),
      category: document.getElementById("category").value,
      status: document.getElementById("status").value,
      rating: Number(document.getElementById("rating").value),
      page_current: numOrZero(document.getElementById("page_current").value),
      notes: document.getElementById("notes").value.trim()
    }
  };

  try {
    // ✅ Content-Type 用 text/plain，降低 CORS / preflight 機率（超重要）
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => ({}));
    if (!json.ok) throw new Error(json.error || "送出失敗");

    // 成功：顯示動畫 & 可選提供 notionUrl
    if (json.notionUrl) {
      const link = document.getElementById("notionLink");
      link.href = json.notionUrl;
      link.style.display = "inline-block";
    }
    showSuccess();

  } catch (err) {
    alert(err.message || String(err));
  } finally {
    btn.disabled = false;
    btn.textContent = "送出";
  }
});

document.getElementById("againBtn").addEventListener("click", () => {
  document.getElementById("bookForm").reset();
  hideSuccess();
});

document.getElementById("closeBtn").addEventListener("click", () => {
  // LINE 官方 API：isInClient + closeWindow :contentReference[oaicite:1]{index=1}
  if (window.liff && liff.isInClient()) liff.closeWindow();
  else window.close(); // 外部瀏覽器 fallback
});

function showSuccess(){
  const m = document.getElementById("success");
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
}
function hideSuccess(){
  const m = document.getElementById("success");
  m.classList.remove("show");
  m.setAttribute("aria-hidden", "true");
  document.getElementById("notionLink").style.display = "none";
}

initLiff();
