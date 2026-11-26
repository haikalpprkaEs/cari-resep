const API = "https://www.themealdb.com/api/json/v1/1";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const categoriesEl = document.getElementById("categories");
const mealsEl = document.getElementById("meals");
const statusEl = document.getElementById("status");
const titleEl = document.getElementById("result-title");
const dialog = document.getElementById("detail");
const detailBody = document.getElementById("detail-body");

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Server menjawab dengan status " + res.status);
  return res.json();
}

function esc(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function renderMeals(meals) {
  mealsEl.innerHTML = meals
    .map(
      (m) => `
    <article>
      <button data-id="${m.idMeal}"
        class="meal-card group block w-full overflow-hidden rounded-xl border border-ink/15 bg-white text-left focus:outline-none focus:ring-4 focus:ring-cobalt/40">
        <img src="${m.strMealThumb}/preview" alt="${esc(m.strMeal)}" loading="lazy"
          class="aspect-square w-full object-cover" />
        <div class="p-4">
          <h3 class="font-display text-lg font-semibold">${esc(m.strMeal)}</h3>
          ${m.strArea ? `<p class="mt-1 text-sm text-ink/60">Masakan ${esc(m.strArea)}</p>` : ""}
        </div>
      </button>
    </article>`
    )
    .join("");
}

async function searchMeals(keyword) {
  titleEl.textContent = `Hasil untuk "${keyword}"`;
  mealsEl.innerHTML = "";
  setStatus("Memuat resep...");
  try {
    const data = await getJSON(`${API}/search.php?s=${encodeURIComponent(keyword)}`);
    if (!data.meals) {
      setStatus(`Tidak ada resep untuk "${keyword}". Coba kata kunci lain, misalnya dalam bahasa Inggris.`);
      return;
    }
    setStatus("");
    renderMeals(data.meals);
  } catch (err) {
    setStatus("Gagal memuat data. Periksa koneksi internet lalu coba lagi.");
    console.error(err);
  }
}

async function filterByCategory(name) {
  titleEl.textContent = `Kategori: ${name}`;
  mealsEl.innerHTML = "";
  setStatus("Memuat resep...");
  try {
    const data = await getJSON(`${API}/filter.php?c=${encodeURIComponent(name)}`);
    setStatus("");
    renderMeals(data.meals);
  } catch (err) {
    setStatus("Gagal memuat data. Periksa koneksi internet lalu coba lagi.");
    console.error(err);
  }
}

async function loadCategories() {
  try {
    const data = await getJSON(`${API}/categories.php`);
    categoriesEl.innerHTML = data.categories
      .map(
        (c) => `
      <button data-category="${esc(c.strCategory)}"
        class="rounded-full border border-cobalt px-4 py-1.5 text-sm font-medium text-cobalt hover:bg-cobalt hover:text-white focus:outline-none focus:ring-4 focus:ring-cobalt/30">
        ${esc(c.strCategory)}
      </button>`
      )
      .join("");
  } catch (err) {
    categoriesEl.textContent = "Kategori tidak bisa dimuat.";
    console.error(err);
  }
}

async function showDetail(id) {
  detailBody.innerHTML = `<p class="p-6">Memuat detail...</p>`;
  dialog.showModal();
  try {
    const data = await getJSON(`${API}/lookup.php?i=${id}`);
    const m = data.meals[0];

    let ingredients = "";
    for (let i = 1; i <= 20; i++) {
      const item = m["strIngredient" + i];
      if (item && item.trim()) {
        ingredients += `<li>${esc(m["strMeasure" + i])} ${esc(item)}</li>`;
      }
    }

    detailBody.innerHTML = `
      <img src="${m.strMealThumb}" alt="${esc(m.strMeal)}" class="h-56 w-full object-cover" />
      <div class="p-6">
        <h2 class="font-display text-2xl font-extrabold">${esc(m.strMeal)}</h2>
        <p class="mt-1 text-sm text-ink/60">${esc(m.strCategory)} • Masakan ${esc(m.strArea)}</p>

        <h3 class="mt-5 font-display text-lg font-semibold">Bahan</h3>
        <ul class="mt-2 list-disc space-y-1 pl-5">${ingredients}</ul>

        <h3 class="mt-5 font-display text-lg font-semibold">Cara membuat</h3>
        <p class="mt-2 whitespace-pre-line leading-relaxed">${esc(m.strInstructions)}</p>

        <button id="close-detail"
          class="mt-6 rounded-lg bg-cobalt px-5 py-2.5 font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-cobalt/40">
          Tutup
        </button>
      </div>`;
  } catch (err) {
    detailBody.innerHTML = `<p class="p-6">Gagal memuat detail resep.</p>`;
    console.error(err);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const keyword = input.value.trim();
  if (keyword) searchMeals(keyword);
});

categoriesEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-category]");
  if (btn) filterByCategory(btn.dataset.category);
});

mealsEl.addEventListener("click", (e) => {
  const card = e.target.closest("[data-id]");
  if (card) showDetail(card.dataset.id);
});

dialog.addEventListener("click", (e) => {
  if (e.target.id === "close-detail" || e.target === dialog) dialog.close();
});

loadCategories();
searchMeals("chicken");
