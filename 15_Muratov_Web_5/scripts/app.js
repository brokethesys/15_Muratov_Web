const STORAGE_KEY = "lab5_card_deck_state_v1";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

class Card {
  #id;
  #name;
  #cost;
  #description;
  #rarity;
  #isPreset;

  constructor({ id, name, cost, description, rarity = "common", isPreset = true }) {
    this.#id = id;
    this.name = name;
    this.cost = cost;
    this.description = description;
    this.rarity = rarity;
    this.#isPreset = Boolean(isPreset);
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    const nextValue = String(value).trim();
    if (!nextValue) {
      throw new Error("Название карты не может быть пустым.");
    }
    this.#name = nextValue;
  }

  get cost() {
    return this.#cost;
  }

  set cost(value) {
    const nextValue = Number(value);
    if (!Number.isInteger(nextValue) || nextValue < 0) {
      throw new Error("Стоимость карты должна быть целым числом не меньше 0.");
    }
    this.#cost = nextValue;
  }

  get description() {
    return this.#description;
  }

  set description(value) {
    const nextValue = String(value).trim();
    if (!nextValue) {
      throw new Error("Описание карты не может быть пустым.");
    }
    this.#description = nextValue;
  }

  get rarity() {
    return this.#rarity;
  }

  set rarity(value) {
    const allowed = ["common", "rare", "epic"];
    const nextValue = String(value).trim().toLowerCase();
    if (!allowed.includes(nextValue)) {
      throw new Error("Некорректная редкость карты.");
    }
    this.#rarity = nextValue;
  }

  get isPreset() {
    return this.#isPreset;
  }

  get rarityLabel() {
    const rarityMap = {
      common: "Обычная",
      rare: "Редкая",
      epic: "Эпическая"
    };
    return rarityMap[this.#rarity] ?? "Неизвестная";
  }

  get type() {
    return "base";
  }

  get typeLabel() {
    return "Базовая";
  }

  get typeClass() {
    return "card-base";
  }

  getStatsHtml() {
    return "";
  }

  getEditFieldsHtml() {
    return "";
  }

  applyTypeUpdates() {
    throw new Error("Метод applyTypeUpdates должен быть переопределен в наследнике.");
  }

  updateFromFormData(formData) {
    this.name = formData.get("name");
    this.cost = formData.get("cost");
    this.description = formData.get("description");
    this.rarity = formData.get("rarity");
    this.applyTypeUpdates(formData);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      cost: this.cost,
      description: this.description,
      rarity: this.rarity,
      isPreset: this.isPreset
    };
  }

  toHTML(isEditMode = false) {
    const canEdit = isEditMode && this.isPreset;
    const canDelete = isEditMode && !this.isPreset;

    return `
      <article class="card ${this.typeClass} rarity-${escapeHtml(this.rarity)}" data-card-id="${escapeHtml(this.id)}">
        <header class="card__header">
          <p class="card__type">${escapeHtml(this.typeLabel)}</p>
          <p class="card__cost" aria-label="Стоимость карты">${escapeHtml(this.cost)}</p>
        </header>

        <h3 class="card__name">${escapeHtml(this.name)}</h3>

        <p class="card__description">${escapeHtml(this.description)}</p>

        <dl class="card__stats">
          ${this.getStatsHtml()}
          <div class="stat-row">
            <dt>Редкость</dt>
            <dd>${escapeHtml(this.rarityLabel)}</dd>
          </div>
        </dl>

        ${canDelete ? `<button class="danger-btn" type="button" data-action="delete-card" data-card-id="${escapeHtml(this.id)}">Удалить карту</button>` : ""}

        ${canEdit ? `
          <form class="card-edit-form" data-form="edit-card" data-card-id="${escapeHtml(this.id)}">
            <fieldset>
              <legend>Редактирование предзаданной карты</legend>

              <label>
                Название
                <input name="name" type="text" value="${escapeHtml(this.name)}" required>
              </label>

              <label>
                Стоимость
                <input name="cost" type="number" min="0" step="1" value="${escapeHtml(this.cost)}" required>
              </label>

              <label>
                Редкость
                <select name="rarity" required>
                  <option value="common" ${this.rarity === "common" ? "selected" : ""}>Обычная</option>
                  <option value="rare" ${this.rarity === "rare" ? "selected" : ""}>Редкая</option>
                  <option value="epic" ${this.rarity === "epic" ? "selected" : ""}>Эпическая</option>
                </select>
              </label>

              ${this.getEditFieldsHtml()}

              <label>
                Описание
                <textarea name="description" rows="3" required>${escapeHtml(this.description)}</textarea>
              </label>

              <button type="submit">Сохранить карту</button>
            </fieldset>
          </form>
        ` : ""}
      </article>
    `;
  }
}

class AttackCard extends Card {
  #damage;

  constructor({ damage, ...baseProps }) {
    super(baseProps);
    this.damage = damage;
  }

  get type() {
    return "attack";
  }

  get typeLabel() {
    return "Атака";
  }

  get typeClass() {
    return "card-attack";
  }

  get damage() {
    return this.#damage;
  }

  set damage(value) {
    const nextValue = Number(value);
    if (!Number.isInteger(nextValue) || nextValue < 1) {
      throw new Error("Урон должен быть целым числом не меньше 1.");
    }
    this.#damage = nextValue;
  }

  getStatsHtml() {
    return `
      <div class="stat-row">
        <dt>Урон</dt>
        <dd>${escapeHtml(this.damage)}</dd>
      </div>
    `;
  }

  getEditFieldsHtml() {
    return `
      <label>
        Урон
        <input name="damage" type="number" min="1" step="1" value="${escapeHtml(this.damage)}" required>
      </label>
    `;
  }

  applyTypeUpdates(formData) {
    this.damage = formData.get("damage");
  }

  toJSON() {
    return {
      ...super.toJSON(),
      damage: this.damage
    };
  }

  toHTML(isEditMode = false) {
    return super.toHTML(isEditMode);
  }
}

class SkillCard extends Card {
  #block;

  constructor({ block, ...baseProps }) {
    super(baseProps);
    this.block = block;
  }

  get type() {
    return "skill";
  }

  get typeLabel() {
    return "Навык";
  }

  get typeClass() {
    return "card-skill";
  }

  get block() {
    return this.#block;
  }

  set block(value) {
    const nextValue = Number(value);
    if (!Number.isInteger(nextValue) || nextValue < 1) {
      throw new Error("Блок должен быть целым числом не меньше 1.");
    }
    this.#block = nextValue;
  }

  getStatsHtml() {
    return `
      <div class="stat-row">
        <dt>Блок</dt>
        <dd>${escapeHtml(this.block)}</dd>
      </div>
    `;
  }

  getEditFieldsHtml() {
    return `
      <label>
        Блок
        <input name="block" type="number" min="1" step="1" value="${escapeHtml(this.block)}" required>
      </label>
    `;
  }

  applyTypeUpdates(formData) {
    this.block = formData.get("block");
  }

  toJSON() {
    return {
      ...super.toJSON(),
      block: this.block
    };
  }

  toHTML(isEditMode = false) {
    return super.toHTML(isEditMode);
  }
}

class RelicCard extends Card {
  #charges;

  constructor({ charges, ...baseProps }) {
    super(baseProps);
    this.charges = charges;
  }

  get type() {
    return "relic";
  }

  get typeLabel() {
    return "Реликвия";
  }

  get typeClass() {
    return "card-relic";
  }

  get charges() {
    return this.#charges;
  }

  set charges(value) {
    const nextValue = Number(value);
    if (!Number.isInteger(nextValue) || nextValue < 1) {
      throw new Error("Заряды должны быть целым числом не меньше 1.");
    }
    this.#charges = nextValue;
  }

  getStatsHtml() {
    return `
      <div class="stat-row">
        <dt>Заряды</dt>
        <dd>${escapeHtml(this.charges)}</dd>
      </div>
    `;
  }

  getEditFieldsHtml() {
    return `
      <label>
        Заряды
        <input name="charges" type="number" min="1" step="1" value="${escapeHtml(this.charges)}" required>
      </label>
    `;
  }

  applyTypeUpdates(formData) {
    this.charges = formData.get("charges");
  }

  toJSON() {
    return {
      ...super.toJSON(),
      charges: this.charges
    };
  }

  toHTML(isEditMode = false) {
    return super.toHTML(isEditMode);
  }
}

function createCardFromData(data) {
  const normalized = {
    id: String(data.id),
    name: data.name,
    cost: data.cost,
    description: data.description,
    rarity: data.rarity,
    isPreset: Boolean(data.isPreset)
  };

  switch (data.type) {
    case "attack":
      return new AttackCard({ ...normalized, damage: data.damage });
    case "skill":
      return new SkillCard({ ...normalized, block: data.block });
    case "relic":
      return new RelicCard({ ...normalized, charges: data.charges });
    default:
      throw new Error("Неизвестный тип карты при восстановлении.");
  }
}

function getDefaultDeck() {
  return [
    new AttackCard({
      id: "preset-1",
      name: "Клинок Бури",
      cost: 1,
      description: "Наносит цельный удар молнией.",
      rarity: "common",
      damage: 8,
      isPreset: true
    }),
    new AttackCard({
      id: "preset-2",
      name: "Лезвие Заката",
      cost: 2,
      description: "Сильный удар, усиливающий следующий выпад.",
      rarity: "rare",
      damage: 14,
      isPreset: true
    }),
    new SkillCard({
      id: "preset-3",
      name: "Стойка Защитника",
      cost: 1,
      description: "Поднимает щит и гасит входящую атаку.",
      rarity: "common",
      block: 7,
      isPreset: true
    }),
    new SkillCard({
      id: "preset-4",
      name: "Теневая Вуаль",
      cost: 2,
      description: "Поглощает урон и подготавливает контрудар.",
      rarity: "epic",
      block: 11,
      isPreset: true
    }),
    new RelicCard({
      id: "preset-5",
      name: "Печать Памяти",
      cost: 0,
      description: "В начале боя дает временные заряды энергии.",
      rarity: "rare",
      charges: 3,
      isPreset: true
    }),
    new RelicCard({
      id: "preset-6",
      name: "Осколок Маяка",
      cost: 0,
      description: "Каждый третий ход усиливает случайную карту.",
      rarity: "epic",
      charges: 2,
      isPreset: true
    })
  ];
}

const state = {
  cards: [],
  editMode: false,
  addFormType: "attack"
};

function persistState() {
  const serializableState = {
    editMode: state.editMode,
    addFormType: state.addFormType,
    cards: state.cards.map((card) => card.toJSON())
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.cards = getDefaultDeck();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const restoredCards = Array.isArray(parsed.cards)
      ? parsed.cards.map((cardData) => createCardFromData(cardData))
      : getDefaultDeck();

    state.cards = restoredCards;
    state.editMode = Boolean(parsed.editMode);
    state.addFormType = ["attack", "skill", "relic"].includes(parsed.addFormType)
      ? parsed.addFormType
      : "attack";
  } catch (_error) {
    state.cards = getDefaultDeck();
    state.editMode = false;
    state.addFormType = "attack";
  }
}

function getAddTypeFieldsHtml() {
  if (state.addFormType === "attack") {
    return `
      <label>
        Урон
        <input name="damage" type="number" min="1" step="1" value="8" required>
      </label>
    `;
  }

  if (state.addFormType === "skill") {
    return `
      <label>
        Блок
        <input name="block" type="number" min="1" step="1" value="6" required>
      </label>
    `;
  }

  return `
    <label>
      Заряды
      <input name="charges" type="number" min="1" step="1" value="2" required>
    </label>
  `;
}

function renderApp() {
  const cardsMarkup = state.cards.map((card) => card.toHTML(state.editMode)).join("");

  document.body.innerHTML = `
    <header class="page-header">
      <div class="page-header__inner">
        <h1>Колода «Aether Forge»</h1>
        <p>Лабораторная №5: классы, наследование, полиморфизм, DOM, события и localStorage</p>

        <label class="switcher">
          <input id="edit-mode-toggle" type="checkbox" ${state.editMode ? "checked" : ""}>
          <span>Режим редактирования предзаданных карт</span>
        </label>
      </div>
    </header>

    <main class="layout">
      <section class="cards-section" aria-label="Список карт">
        <h2>Карты колоды</h2>
        <div class="cards-grid">
          ${cardsMarkup}
        </div>
      </section>

      <aside class="panel" aria-label="Панель управления">
        <h2>Управление</h2>
        <p>Добавление и удаление относится к новым картам, редактирование - только к предзаданным.</p>

        <form data-form="add-card" class="add-card-form">
          <fieldset>
            <legend>Добавить новую карту</legend>

            <label>
              Тип карты
              <select name="type" id="new-card-type" required>
                <option value="attack" ${state.addFormType === "attack" ? "selected" : ""}>Атака</option>
                <option value="skill" ${state.addFormType === "skill" ? "selected" : ""}>Навык</option>
                <option value="relic" ${state.addFormType === "relic" ? "selected" : ""}>Реликвия</option>
              </select>
            </label>

            <label>
              Название
              <input name="name" type="text" placeholder="Новая карта" required>
            </label>

            <label>
              Стоимость
              <input name="cost" type="number" min="0" step="1" value="1" required>
            </label>

            <label>
              Редкость
              <select name="rarity" required>
                <option value="common">Обычная</option>
                <option value="rare">Редкая</option>
                <option value="epic">Эпическая</option>
              </select>
            </label>

            ${getAddTypeFieldsHtml()}

            <label>
              Описание
              <textarea name="description" rows="3" placeholder="Краткий эффект карты" required></textarea>
            </label>

            <button type="submit">Добавить карту</button>
          </fieldset>
        </form>
      </aside>
    </main>
  `;

  bindUIHandlers();
}

function bindUIHandlers() {
  const editToggle = document.querySelector("#edit-mode-toggle");
  editToggle?.addEventListener("change", () => {
    state.editMode = editToggle.checked;
    persistState();
    renderApp();
  });

  const typeSelect = document.querySelector("#new-card-type");
  typeSelect?.addEventListener("change", () => {
    state.addFormType = typeSelect.value;
    persistState();
    renderApp();
  });

  document.querySelectorAll('form[data-form="edit-card"]').forEach((form) => {
    form.addEventListener("submit", handleEditCardSubmit);
  });

  const addCardForm = document.querySelector('form[data-form="add-card"]');
  addCardForm?.addEventListener("submit", handleAddCardSubmit);

  document.querySelectorAll('[data-action="delete-card"]').forEach((button) => {
    button.addEventListener("click", handleDeleteCardClick);
  });
}

function handleEditCardSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const cardId = form.getAttribute("data-card-id");
  const card = state.cards.find((item) => item.id === cardId);

  if (!card || !card.isPreset || !state.editMode) {
    return;
  }

  const formData = new FormData(form);

  try {
    card.updateFromFormData(formData);
    persistState();
    renderApp();
  } catch (error) {
    alert(error.message);
  }
}

function createNewCardFromForm(formData) {
  const type = formData.get("type");
  const common = {
    id: String(Date.now()) + String(Math.floor(Math.random() * 1000)),
    name: formData.get("name"),
    cost: formData.get("cost"),
    description: formData.get("description"),
    rarity: formData.get("rarity"),
    isPreset: false
  };

  if (type === "attack") {
    return new AttackCard({ ...common, damage: formData.get("damage") });
  }

  if (type === "skill") {
    return new SkillCard({ ...common, block: formData.get("block") });
  }

  if (type === "relic") {
    return new RelicCard({ ...common, charges: formData.get("charges") });
  }

  throw new Error("Неизвестный тип карты.");
}

function handleAddCardSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  try {
    const newCard = createNewCardFromForm(formData);
    state.cards = [...state.cards, newCard];
    persistState();
    renderApp();
  } catch (error) {
    alert(error.message);
  }
}

function handleDeleteCardClick(event) {
  const button = event.currentTarget;
  const cardId = button.getAttribute("data-card-id");
  const cardToDelete = state.cards.find((card) => card.id === cardId);

  if (!cardToDelete || cardToDelete.isPreset) {
    return;
  }

  state.cards = state.cards.filter((card) => card.id !== cardId);
  persistState();
  renderApp();
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderApp();
});
