const newsContainer = document.getElementById("newsContainer");
const slider = document.getElementById("slider");
const sliderPrev = document.getElementById("sliderPrev");
const sliderNext = document.getElementById("sliderNext");
const sliderDots = document.getElementById("sliderDots");
const refreshBtn = document.getElementById("refreshBtn");

const URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=videojuegos&hl=es-419&gl=MX&ceid=MX:es-419";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80";

let destacadas = [];
let slideIndex = 0;
let autoSlide = null;

async function cargarNoticias() {
  newsContainer.innerHTML = "<p class='loading'>Cargando noticias...</p>";
  slider.innerHTML = "<p class='loading'>Cargando...</p>";
  sliderDots.innerHTML = "";

  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      slider.innerHTML = "<p>No hay noticias disponibles.</p>";
      newsContainer.innerHTML = "<p>No hay noticias disponibles.</p>";
      return;
    }

    procesarNoticias(data.items);
  } catch (error) {
    console.error(error);
    slider.innerHTML = "<p>Error al cargar el slider.</p>";
    newsContainer.innerHTML = "<p>Error al cargar noticias.</p>";
  }
}

function procesarNoticias(noticias) {
  destacadas = noticias.slice(0, 5);
  slideIndex = 0;
  renderSlider();

  const resto = noticias.slice(5);
  renderGrid(resto);
}

function renderSlider() {
  slider.innerHTML = "";
  sliderDots.innerHTML = "";

  destacadas.forEach((noticia, i) => {
    const img = noticia.thumbnail && noticia.thumbnail !== "" ? noticia.thumbnail : FALLBACK_IMG;
    const fecha = noticia.pubDate || "Sin fecha";

    // Slide
    const slideHTML = `
      <div class="slide">
        <img src="${img}">
        <div class="slide-content">
          <h2 class="slide-title" onclick="window.open('${noticia.link}', '_blank')">
            ${noticia.title}
          </h2>
          <p class="slide-meta">${fecha}</p>
        </div>
      </div>
    `;
    slider.innerHTML += slideHTML;

    // Dot
    const dotHTML = `
      <div class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></div>
    `;
    sliderDots.innerHTML += dotHTML;
  });

  document.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", (e) => {
      slideIndex = Number(e.target.dataset.index);
      updateSlider();
      restartAutoSlide();
    });
  });

  updateSlider();
  startAutoSlide();
}

function updateSlider() {
  slider.style.transform = `translateX(${-slideIndex * 100}%)`;

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === slideIndex);
  });
}

function nextSlide() {
  slideIndex = (slideIndex + 1) % destacadas.length;
  updateSlider();
}

function prevSlide() {
  slideIndex = (slideIndex - 1 + destacadas.length) % destacadas.length;
  updateSlider();
}

sliderNext.addEventListener("click", () => {
  nextSlide();
  restartAutoSlide();
});

sliderPrev.addEventListener("click", () => {
  prevSlide();
  restartAutoSlide();
});

function startAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(nextSlide, 6000);
}

function restartAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}


function renderGrid(noticias) {
  newsContainer.innerHTML = "";

  if (!noticias || noticias.length === 0) {
    newsContainer.innerHTML = "<p>No hay más noticias para mostrar.</p>";
    return;
  }

  noticias.forEach((noticia) => {
    const img = noticia.thumbnail && noticia.thumbnail !== "" ? noticia.thumbnail : FALLBACK_IMG;
    const fecha = noticia.pubDate || "Sin fecha";
    const desc = (noticia.description || "")
      .replace(/<[^>]+>/g, "")
      .slice(0, 200);

    const card = `
      <article class="news-card">
        <img src="${img}" class="news-img">

        <div class="news-body">
          <h3 class="news-title" onclick="window.open('${noticia.link}', '_blank')">
            ${noticia.title}
          </h3>
          <p class="news-meta">${fecha}</p>
          <p class="news-desc">${desc}...</p>
        </div>
      </article>
    `;

    newsContainer.innerHTML += card;
  });
}


refreshBtn.addEventListener("click", () => {
  cargarNoticias();
  restartAutoSlide();
});


cargarNoticias();
