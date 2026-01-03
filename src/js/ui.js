import template from "../template.html?raw";

export function initUI() {
  const root = document.getElementById("app");
  if (root) {
    root.innerHTML = template;
  }
}
