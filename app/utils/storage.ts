export function saveToLocalStorage(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromLocalStorage(key: string): any {
  return JSON.parse(localStorage.getItem(key) || "null");
}

export function saveToSessionStorage(key: string, value: any): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function loadFromSessionStorage(key: string): any {
  return JSON.parse(sessionStorage.getItem(key) || "null");
}
