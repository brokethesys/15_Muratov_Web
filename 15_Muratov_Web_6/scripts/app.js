const navButtons = Array.from(document.querySelectorAll('.nav__button'));
const apiSections = Array.from(document.querySelectorAll('.api-section'));

const elements = {
  posts: {
    loadButton: document.getElementById('load-posts'),
    list: document.getElementById('posts-list'),
    getStatus: document.getElementById('posts-get-status'),
    createForm: document.getElementById('create-post-form'),
    createStatus: document.getElementById('post-create-status'),
    createResult: document.getElementById('post-create-result'),
    patchForm: document.getElementById('patch-post-form'),
    patchStatus: document.getElementById('post-patch-status'),
    patchResult: document.getElementById('post-patch-result'),
    deleteForm: document.getElementById('delete-post-form'),
    deleteStatus: document.getElementById('post-delete-status'),
    deleteResult: document.getElementById('post-delete-result')
  },
  products: {
    form: document.getElementById('products-search-form'),
    defaultButton: document.getElementById('products-default'),
    list: document.getElementById('products-list'),
    status: document.getElementById('products-status')
  },
  countries: {
    form: document.getElementById('countries-form'),
    list: document.getElementById('countries-list'),
    status: document.getElementById('countries-status')
  }
};

const loadedSections = new Set();
const hiddenPostIds = new Set();

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const setStatus = (node, message, type = 'info') => {
  node.className = `status${type === 'info' ? '' : ` status--${type}`}`;
  node.textContent = message;
};

const setResult = (node, data) => {
  node.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
};

const parseJsonBody = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const body = await parseJsonBody(response);

  if (!response.ok) {
    const errorMessage = body?.message ?? `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return body;
};

const showSection = (sectionId) => {
  navButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.target === sectionId);
  });

  apiSections.forEach((section) => {
    section.classList.toggle('is-active', section.id === sectionId);
  });

  if (!loadedSections.has(sectionId)) {
    if (sectionId === 'products') {
      void loadProducts('');
    }
    if (sectionId === 'countries') {
      void loadCountries('all', '');
    }
    loadedSections.add(sectionId);
  }
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => showSection(button.dataset.target));
});

const renderCards = (container, html) => {
  container.innerHTML = html;
};

const renderPosts = (posts) => {
  const visiblePosts = posts.filter((post) => !hiddenPostIds.has(Number(post.id)));

  if (!visiblePosts.length) {
    renderCards(elements.posts.list, '');
    setStatus(elements.posts.getStatus, 'Посты не найдены.', 'empty');
    return;
  }

  const html = visiblePosts
    .map((post) => `
      <article class="card">
        <h4>#${post.id} ${escapeHtml(post.title)}</h4>
        <p>${escapeHtml(post.body)}</p>
      </article>
    `)
    .join('');

  renderCards(elements.posts.list, html);
  setStatus(elements.posts.getStatus, `Загружено постов: ${visiblePosts.length}.`, 'success');
};

const loadPosts = async () => {
  setStatus(elements.posts.getStatus, 'Загрузка постов...', 'loading');
  renderCards(elements.posts.list, '');

  try {
    const posts = await requestJson('https://jsonplaceholder.typicode.com/posts?_limit=6');
    renderPosts(posts);
  } catch (error) {
    setStatus(elements.posts.getStatus, `Ошибка загрузки: ${error.message}`, 'error');
  }
};

const toPositiveNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const handleCreatePost = async (event) => {
  event.preventDefault();

  const formData = new FormData(elements.posts.createForm);
  const payload = {
    title: String(formData.get('title')).trim(),
    body: String(formData.get('body')).trim(),
    userId: 1
  };

  setStatus(elements.posts.createStatus, 'Отправка POST-запроса...', 'loading');
  setResult(elements.posts.createResult, '');

  try {
    const created = await requestJson('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload)
    });

    setStatus(elements.posts.createStatus, 'Пост создан (тестовый ответ API).', 'success');
    setResult(elements.posts.createResult, created);
    elements.posts.createForm.reset();
    await loadPosts();
  } catch (error) {
    setStatus(elements.posts.createStatus, `Ошибка POST: ${error.message}`, 'error');
  }
};

const handlePatchPost = async (event) => {
  event.preventDefault();

  const formData = new FormData(elements.posts.patchForm);
  const postId = toPositiveNumber(String(formData.get('id')));
  const title = String(formData.get('title')).trim();

  if (!postId) {
    setStatus(elements.posts.patchStatus, 'ID должен быть положительным числом.', 'error');
    return;
  }

  setStatus(elements.posts.patchStatus, 'Отправка PATCH-запроса...', 'loading');
  setResult(elements.posts.patchResult, '');

  try {
    const patched = await requestJson(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ title })
    });

    setStatus(elements.posts.patchStatus, `Пост #${postId} обновлён (тестовый ответ API).`, 'success');
    setResult(elements.posts.patchResult, patched);
    elements.posts.patchForm.reset();
    await loadPosts();
  } catch (error) {
    setStatus(elements.posts.patchStatus, `Ошибка PATCH: ${error.message}`, 'error');
  }
};

const handleDeletePost = async (event) => {
  event.preventDefault();

  const formData = new FormData(elements.posts.deleteForm);
  const postId = toPositiveNumber(String(formData.get('id')));

  if (!postId) {
    setStatus(elements.posts.deleteStatus, 'ID должен быть положительным числом.', 'error');
    return;
  }

  setStatus(elements.posts.deleteStatus, 'Отправка DELETE-запроса...', 'loading');
  setResult(elements.posts.deleteResult, '');

  try {
    const deleted = await requestJson(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: 'DELETE'
    });

    hiddenPostIds.add(postId);
    setStatus(elements.posts.deleteStatus, `Пост #${postId} удалён и скрыт из списка.`, 'success');
    setResult(elements.posts.deleteResult, deleted);
    elements.posts.deleteForm.reset();
    await loadPosts();
  } catch (error) {
    setStatus(elements.posts.deleteStatus, `Ошибка DELETE: ${error.message}`, 'error');
  }
};

const renderProducts = (products) => {
  if (!products.length) {
    renderCards(elements.products.list, '');
    setStatus(elements.products.status, 'По запросу ничего не найдено.', 'empty');
    return;
  }

  const html = products
    .map((product) => `
      <article class="card">
        <h4>${escapeHtml(product.title)}</h4>
        <p>${escapeHtml(product.description)}</p>
        <div class="card__meta">
          <span class="tag">Категория: ${escapeHtml(product.category)}</span>
          <span class="tag">Цена: $${escapeHtml(product.price)}</span>
          <span class="tag">Рейтинг: ${escapeHtml(product.rating)}</span>
          <span class="tag">Остаток: ${escapeHtml(product.stock)}</span>
        </div>
      </article>
    `)
    .join('');

  renderCards(elements.products.list, html);
  setStatus(elements.products.status, `Найдено товаров: ${products.length}.`, 'success');
};

const loadProducts = async (query) => {
  setStatus(elements.products.status, 'Загрузка товаров...', 'loading');
  renderCards(elements.products.list, '');

  const trimmedQuery = query.trim();
  const endpoint = trimmedQuery
    ? `https://dummyjson.com/products/search?q=${encodeURIComponent(trimmedQuery)}`
    : 'https://dummyjson.com/products?limit=8';

  try {
    const data = await requestJson(endpoint);
    renderProducts(Array.isArray(data.products) ? data.products : []);
  } catch (error) {
    setStatus(elements.products.status, `Ошибка загрузки: ${error.message}`, 'error');
  }
};

const handleProductsSearch = async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.products.form);
  const query = String(formData.get('query') ?? '').trim();
  await loadProducts(query);
};

const renderCountries = (countries) => {
  if (!countries.length) {
    renderCards(elements.countries.list, '');
    setStatus(elements.countries.status, 'Страны не найдены.', 'empty');
    return;
  }

  const html = countries
    .map((country) => {
      const countryName = country.name?.common ?? 'Без названия';
      const capital = Array.isArray(country.capital) && country.capital.length
        ? country.capital.join(', ')
        : 'Нет данных';

      return `
        <article class="card">
          <img class="flag" src="${escapeHtml(country.flags?.png ?? '')}" alt="Флаг ${escapeHtml(countryName)}">
          <div>
            <h4>${escapeHtml(countryName)}</h4>
            <p>Столица: ${escapeHtml(capital)}</p>
            <div class="card__meta">
              <span class="tag">Регион: ${escapeHtml(country.region ?? 'Нет данных')}</span>
              <span class="tag">Население: ${escapeHtml(country.population?.toLocaleString('ru-RU') ?? 'Нет данных')}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  renderCards(elements.countries.list, html);
  setStatus(elements.countries.status, `Загружено стран: ${countries.length}.`, 'success');
};

const loadCountries = async (region, nameQuery) => {
  setStatus(elements.countries.status, 'Загрузка стран...', 'loading');
  renderCards(elements.countries.list, '');

  const fields = 'fields=name,capital,region,population,flags';
  const normalizedName = nameQuery.trim();
  let endpoint = `https://restcountries.com/v3.1/all?${fields}`;

  if (normalizedName) {
    endpoint = `https://restcountries.com/v3.1/name/${encodeURIComponent(normalizedName)}?${fields}`;
  } else if (region !== 'all') {
    endpoint = `https://restcountries.com/v3.1/region/${encodeURIComponent(region)}?${fields}`;
  }

  try {
    const data = await requestJson(endpoint);
    const countries = Array.isArray(data) ? data : [];
    const filteredByRegion = region === 'all'
      ? countries
      : countries.filter((country) => country.region?.toLowerCase() === region.toLowerCase());

    const trimmed = filteredByRegion
      .sort((left, right) => (left.name?.common ?? '').localeCompare(right.name?.common ?? ''))
      .slice(0, 12);

    renderCountries(trimmed);
  } catch (error) {
    setStatus(elements.countries.status, `Ошибка загрузки: ${error.message}`, 'error');
  }
};

const handleCountriesSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.countries.form);
  const region = String(formData.get('region') ?? 'all');
  const name = String(formData.get('name') ?? '');
  await loadCountries(region, name);
};

elements.posts.loadButton.addEventListener('click', () => {
  void loadPosts();
});

elements.posts.createForm.addEventListener('submit', (event) => {
  void handleCreatePost(event);
});

elements.posts.patchForm.addEventListener('submit', (event) => {
  void handlePatchPost(event);
});

elements.posts.deleteForm.addEventListener('submit', (event) => {
  void handleDeletePost(event);
});

elements.products.form.addEventListener('submit', (event) => {
  void handleProductsSearch(event);
});

elements.products.defaultButton.addEventListener('click', () => {
  const input = elements.products.form.querySelector('input[name="query"]');
  input.value = '';
  void loadProducts('');
});

elements.countries.form.addEventListener('submit', (event) => {
  void handleCountriesSubmit(event);
});

void loadPosts();
loadedSections.add('posts');
