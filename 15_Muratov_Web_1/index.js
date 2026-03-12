function myFunc() {
  alert("Мини-игра: «Замок»");

  if (!confirm("Готов начать игру?")) {
    alert("Игра отменена.");
    return;
  }

  let name = null;
  while (true) {
    name = prompt("Как тебя зовут?");
    if (name === null) {
      alert("Игра отменена.");
      return;
    }
    name = name.trim();
    if (name.length === 0) {
      alert("Пустой ввод. Введите имя.");
      continue;
    }
    break;
  }

  let choice = null;
  while (true) {
    const input = prompt(
      "Выбери ключ:\n1 — Бронзовый\n2 — Серебряный\n3 — Золотой"
    );
    if (input === null) {
      alert("Игра отменена.");
      return;
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      alert("Пустой ввод. Нужно число 1, 2 или 3.");
      continue;
    }
    if (!/^\d+$/.test(trimmed)) {
      alert("Неверный формат. Нужно число 1, 2 или 3.");
      continue;
    }
    const num = Number(trimmed);
    if (num < 1 || num > 3) {
      alert("Число вне диапазона. Нужно 1, 2 или 3.");
      continue;
    }
    choice = num;
    break;
  }

  alert("Отлично, " + name + ". Проверим ключ.");

  let code = null;
  while (true) {
    const input = prompt(
      "Задание: сколько минут в четверти часа? (число)"
    );
    if (input === null) {
      alert("Игра отменена.");
      return;
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      alert("Пустой ввод. Нужно число.");
      continue;
    }
    if (!/^\d+$/.test(trimmed)) {
      alert("Неверный формат. Нужно число.");
      continue;
    }
    code = Number(trimmed);
    break;
  }

  if (code !== 15) {
    alert("Неверный код. Замок не открылся.");
    return;
  }

  if (confirm("Код верный! Открыть замок?")) {
    alert("Замок открыт! Победа.");
  } else {
    alert("Ты отказался открывать замок.");
  }
}
