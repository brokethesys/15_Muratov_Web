var defaultReviews = [
  {
    name: "Андрей",
    text: "Я купил эту подушку и… все еще не сплю. Но мне нравится упаковка.",
    image: "img/pillow.svg"
  },
  {
    name: "Катя",
    text: "Она мягкая. Возможно это подушка.",
    image: "img/ad1.svg"
  },
  {
    name: "Сергей",
    text: "Я не знаю что это, но реклама была убедительная.",
    image: "img/ad2.svg"
  },
  {
    name: "Валерия",
    text: "Подушка красивая. Смысла нет, зато настроение есть.",
    image: "img/paint.svg"
  }
];

var reviews = [];

function loadReviews() {
  var saved = getCookie("reviews");
  if (saved) {
    try {
      var parsed = JSON.parse(decodeURIComponent(saved));
      if (Array.isArray(parsed)) {
        reviews = parsed;
        return;
      }
    } catch (e) {
      // если cookie повреждена, используем дефолт
    }
  }
  reviews = defaultReviews.slice();
}

function saveReviews() {
  var value = encodeURIComponent(JSON.stringify(reviews));
  setCookie("reviews", value, 30);
}

function renderReviews() {
  var list = document.getElementById("reviewsList");
  list.innerHTML = "";

  for (var i = 0; i < reviews.length; i++) {
    var item = reviews[i];
    var article = document.createElement("article");
    article.className = "review";

    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = "Фото отзыва";
      article.appendChild(img);
    }

    var title = document.createElement("h4");
    title.textContent = item.name;

    var text = document.createElement("p");
    text.textContent = item.text;

    article.appendChild(title);
    article.appendChild(text);
    list.appendChild(article);
  }
}

function setupForm() {
  var form = document.getElementById("reviewForm");
  var error = document.getElementById("reviewError");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("reviewName").value.trim();
    var text = document.getElementById("reviewText").value.trim();
    var image = document.getElementById("reviewImage").value.trim();

    if (name.length < 2) {
      error.textContent = "Введите имя (минимум 2 символа).";
      return;
    }

    if (text.length < 5) {
      error.textContent = "Введите текст отзыва (минимум 5 символов).";
      return;
    }

    error.textContent = "";

    reviews.push({
      name: name,
      text: text,
      image: image
    });

    saveReviews();
    renderReviews();

    form.reset();
  });
}

function setupThemeToggle() {
  var toggle = document.getElementById("themeToggle");
  var body = document.body;

  var savedTheme = getCookie("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark");
  }

  function updateToggle() {
    var isDark = body.classList.contains("dark");
    toggle.textContent = isDark ? "Светлая тема" : "Тёмная тема";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  }

  updateToggle();

  toggle.addEventListener("click", function () {
    body.classList.toggle("dark");
    updateToggle();
    setCookie("theme", body.classList.contains("dark") ? "dark" : "light", 30);
  });
}

loadReviews();
renderReviews();
setupForm();
setupThemeToggle();
