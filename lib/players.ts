export const MAX_NAME_LENGTH = 24;
export function playerName(value: unknown, fallback: string): string {
  if (value !== undefined && typeof value !== "string")
    throw new Error("Nome inválido.");
  const name = (typeof value === "string" ? value : "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");
  if (/[\u0000-\u001f\u007f<>]/.test(name))
    throw new Error("Use um nome sem símbolos < ou >.");
  if (name.length > MAX_NAME_LENGTH)
    throw new Error("O nome deve ter até 24 caracteres.");
  return name || fallback;
}
export function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}
export function validPlayers(names: string[], minimum = 2): boolean {
  try {
    const clean = names.map((name) => playerName(name, ""));
    return (
      clean.length >= minimum &&
      clean.length <= 20 &&
      clean.every(Boolean) &&
      new Set(clean.map(nameKey)).size === clean.length
    );
  } catch {
    return false;
  }
}
