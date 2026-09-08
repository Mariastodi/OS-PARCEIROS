# Banco de palavras e atribuição

O acervo combina listas editoriais próprias com uma seleção de termos do projeto
[pythonprobr/palavras](https://github.com/pythonprobr/palavras), derivado do dicionário
português brasileiro do LibreOffice. A fonte consultada possui 318.644 entradas;
a documentação do projeto descreve o banco como contendo mais de 320 mil palavras.
Esse total **não** é a quantidade de palavras jogáveis neste site.

A seleção externa está em `lib/data/extra-words.json`, sob **MPL-2.0**.
A licença original está em `licenses/palavras-MPL-2.0.txt` e a origem e SHA-256 do
arquivo consultado acompanham o JSON. O arquivo derivado e o filtro estão disponíveis
no código-fonte público deste repositório. A licença do dicionário não muda a licença
dos demais arquivos independentes do projeto.

## Atualização reproduzível

```sh
node scripts/import-words.mjs
```

O comando consulta a fonte pública, intersecta com `scripts/word-candidates.txt`,
normaliza e remove duplicações. O filtro editorial não acrescenta automaticamente
palavras desconhecidas do dicionário. A seleção fica embarcada no site; falhas da
fonte externa não interrompem partidas nem builds. O comando só roda manualmente.

Para trabalhar com uma cópia já baixada:

```sh
node scripts/import-words.mjs /caminho/palavras.txt
```

Após atualizar, execute os testes e revise os termos antes de publicar.
A categoria **Desafio extra** também participa de **Misturado**. O histórico de
palavras é compartilhado entre categorias da mesma sala e evita repetição até
esgotar as opções da categoria selecionada.

A API [papalavras-server](https://github.com/viniciusmesquitac/papalavras-server)
também foi pesquisada; optamos pelo banco versionado para evitar depender de
um serviço externo durante cada sorteio.
