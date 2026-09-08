// Atualização editorial explícita; nunca executado durante uma partida ou build.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const source =
  "https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt";
const raw = process.argv[2]
  ? await readFile(process.argv[2], "utf8")
  : await (async () => {
      const response = await fetch(source, {
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        throw new Error(`Dicionário indisponível: ${response.status}`);
      return response.text();
    })();
const dictionary = new Set(
  raw
    .split(/\r?\n/)
    .map((word) => word.normalize("NFC").trim().toLocaleLowerCase("pt-BR")),
);
const candidates = (
  await readFile(new URL("./word-candidates.txt", import.meta.url), "utf8")
)
  .split(",")
  .map((word) => word.trim().normalize("NFC"))
  .filter(Boolean);
const words = [...new Set(candidates)].filter(
  (word) =>
    dictionary.has(word.toLocaleLowerCase("pt-BR")) && word.length <= 24,
);
if (words.length < 200)
  throw new Error("Fonte mudou: revise o dicionário antes de atualizar.");
await writeFile(
  new URL("../lib/data/extra-words.json", import.meta.url),
  JSON.stringify(
    {
      source,
      sourceSha256: createHash("sha256").update(raw).digest("hex"),
      license: "MPL-2.0",
      words,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Banco atualizado: ${words.length} termos revisados de ${dictionary.size} entradas. ${candidates.length - words.length} candidatos ignorados.`,
);
