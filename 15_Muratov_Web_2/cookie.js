function setCookie(name, value, days) {
  var expires = "";
  if (typeof days === "number") {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var parts = document.cookie.split(";");
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

function deleteCookie(name) {
  setCookie(name, "", -1);
}
