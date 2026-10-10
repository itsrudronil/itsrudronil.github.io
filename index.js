const $ = s => document.querySelector(s);

// ====== CONFIG ======
const CONFIG = {
  proxy: "https://plain-art-ebfe.soumyadeeptalukderrudronil.workers.dev/", // your Cloudflare Worker URL
  host: "http://dvltv.cc:80",
  user: "talukderrudronil",
  pass: "talRudronil8",
};
// ====================

const S = { ...CONFIG, mode: "live", cat: "", cats: [], items: [], hls: null };
S.proxy = S.proxy.replace(/\/+$/, "");
S.host = S.host.replace(/\/+$/, "");

const proxify = url => `${S.proxy}/?url=${encodeURIComponent(url)}`;

async function api(action) {
  const url = `${S.host}/player_api.php?username=${encodeURIComponent(S.user)}&password=${encodeURIComponent(S.pass)}&action=${action}`;
  const res = await fetch(proxify(url));
  if (!res.ok) throw new Error(`Server replied ${res.status}`);
  return res.json();
}

document.querySelectorAll(".tab").forEach(b =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === b));
    loadMode(b.dataset.mode);
  })
);

async function loadMode(mode) {
  S.mode = mode;
  S.cat = "";
  $("#search").value = "";
  $("#list").innerHTML = '<p class="empty">Loading…</p>';
  try {
    const p = mode === "live" ? "live" : "vod";
    S.cats = await api(`get_${p}_categories`);
    S.items = await api(`get_${p}_streams`);
    renderCats();
    renderList();
  } catch (ex) {
    $("#list").innerHTML = `<p class="empty">Failed to load: ${ex.message}</p>`;
  }
}

function renderCats() {
  const box = $("#cats");
  box.innerHTML = "";
  const all = [{ category_id: "", category_name: "All" }, ...(S.cats || [])];
  all.forEach(c => {
    const b = document.createElement("button");
    b.className = "chip" + (c.category_id === S.cat ? " active" : "");
    b.textContent = c.category_name;
    b.onclick = () => { S.cat = c.category_id; renderCats(); renderList(); };
    box.appendChild(b);
  });
}

function renderList() {
  const q = $("#search").value.trim().toLowerCase();
  let items = S.items || [];
  if (S.cat) items = items.filter(i => String(i.category_id) === String(S.cat));
  if (q) items = items.filter(i => (i.name || "").toLowerCase().includes(q));
  const list = $("#list");
  list.innerHTML = "";
  if (!items.length) { list.innerHTML = '<p class="empty">Nothing found.</p>'; return; }
  items.slice(0, 200).forEach(it => {
    const c = document.createElement("button");
    c.className = "card" + (S.mode === "vod" ? " vod" : "");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    img.referrerPolicy = "no-referrer";
    img.src = it.stream_icon || "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    img.onerror = () => { img.style.visibility = "hidden"; };
    const name = document.createElement("span");
    name.textContent = it.name;
    c.append(img, name);
    c.onclick = () => {
      document.querySelectorAll(".card.playing").forEach(x => x.classList.remove("playing"));
      c.classList.add("playing");
      play(it);
    };
    list.appendChild(c);
  });
  if (items.length > 200) {
    const m = document.createElement("p");
    m.className = "empty";
    m.textContent = `Showing 200 of ${items.length}. Use search or a category to narrow it down.`;
    list.appendChild(m);
  }
}

let t;
$("#search").addEventListener("input", () => { clearTimeout(t); t = setTimeout(renderList, 200); });

function stop() {
  if (S.hls) { S.hls.destroy(); S.hls = null; }
  const v = $("#video");
  v.pause(); v.removeAttribute("src"); v.load();
}

function play(it) {
  stop();
  const v = $("#video");
  $("#nowPlaying").textContent = it.name;
  const { host, user, pass } = S;
  if (S.mode === "live") {
    const url = proxify(`${host}/live/${user}/${pass}/${it.stream_id}.m3u8`);
    if (window.Hls && Hls.isSupported()) {
      S.hls = new Hls();
      S.hls.loadSource(url);
      S.hls.attachMedia(v);
      S.hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(() => {}));
      S.hls.on(Hls.Events.ERROR, (_, d) => {
        if (d.fatal) $("#nowPlaying").textContent = `${it.name} — stream error, try another channel`;
      });
    } else {
      v.src = url; // Safari native HLS
      v.play().catch(() => {});
    }
  } else {
    v.src = proxify(`${host}/movie/${user}/${pass}/${it.stream_id}.${it.container_extension || "mp4"}`);
    v.play().catch(() => {});
  }
}

loadMode("live");
