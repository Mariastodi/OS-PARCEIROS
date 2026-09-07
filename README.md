# Os Parceiros — O Impostor

Jogo em português para 3–20 pessoas, com dois modos:

- **Jogar com PIN:** cada participante usa o próprio celular e recebe apenas seu papel.
- **Jogar em um celular:** os participantes passam o aparelho para ver os papéis.

Os nomes são automáticos: Jogador 1, Jogador 2 etc. Não há cadastro ou campo de nome.

## Executar localmente

Requisitos: Node.js 22.13 ou superior e npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Abra o endereço informado pelo terminal (normalmente http://localhost:3000).
Para jogar em vários celulares na mesma rede Wi-Fi, abra em todos eles
`http://IP-LOCAL-DO-COMPUTADOR:3000`. Libere a porta no firewall, se necessário.
O computador deve permanecer ligado com o servidor em execução. Redes de convidados
podem bloquear a comunicação entre aparelhos. Fora dessa rede, use uma publicação HTTPS.

## Como jogar com PIN

1. Escolha **Jogar com PIN → Criar sala**. Você será o Jogador 1 e o anfitrião.
2. Os amigos abrem o mesmo site, digitam o PIN de seis números e entram.
3. O anfitrião escolhe a categoria e a quantidade de impostores e sorteia os papéis.
4. Cada pessoa revela seu papel e toca em **Memorizei, estou pronto**.
5. Quando todos confirmam, começa o cronômetro compartilhado de cinco minutos.
6. Dê uma pista por vez. Ao fim do tempo, votem em voz alta. O anfitrião encerra
   para revelar a palavra e os impostores, e pode preparar outra rodada na mesma sala.

A conversa e a votação são presenciais ou por uma chamada de voz externa.
O site não inclui chat ou votação eletrônica.

## Palavras

Banco editorial próprio em `lib/words.ts`, com cerca de 500 palavras e expressões
em português: Comidas, Lugares, Objetos, Animais e Lazer e esportes, além de Misturado.
Não exige API, chave ou assinatura. O sorteio usa números aleatórios criptográficos
com distribuição uniforme. As palavras não se repetem até esgotar a categoria.
O histórico é mantido por sala; no modo de um celular, dura enquanto a página estiver aberta.
Para ampliar, acrescente termos às listas do arquivo. Termos duplicados são eliminados na seleção.

## Funcionamento das salas

- React 19, Vinext/Vite e runtime Cloudflare Workers, preservando a arquitetura original.
- API em `app/api/rooms/route.ts`; regras em `lib/game.ts`.
- Cloudflare D1 armazena as salas. O binding lógico **DB** está em `.openai/hosting.json`
  e em `vite.config.ts`. O banco local é emulado e persistido dentro de `.wrangler`.
- A tabela `rooms` é criada de forma idempotente no primeiro acesso à API.
  Esta versão não requer ferramenta externa de migração. Alterações futuras de esquema
  precisam de migrações próprias; não apague o banco para atualizar uma publicação.
- Atualizações condicionais por revisão evitam perder entradas ou confirmações simultâneas.
- Atualização da tela a cada 1,5 segundo; o relógio usa o horário e prazo do servidor.
- O token aleatório individual vai no cabeçalho Authorization. Não aparece no PIN ou URL.
  A API não entrega tokens de outros jogadores nem a palavra ao impostor durante a rodada.
- Recarregar a mesma aba recupera a sessão pelo sessionStorage. Fechar a aba ou limpar
  o armazenamento pode perder a sessão. Cada jogador deve usar seu próprio aparelho/aba.
- Fechar o navegador não remove automaticamente um jogador: ele pode reconectar.
  O anfitrião pode remover jogadores no lobby. Durante a revelação, alguém que desconectou
  pode voltar; se não voltar, o anfitrião pode cancelar a rodada, remover o jogador e sortear novamente.
- Ao sair, o anfitrião passa o controle ao primeiro participante restante.
  Uma saída durante a rodada cancela o sorteio e volta ao lobby para manter os papéis justos.
- Salas vazias ficam encerradas. Salas expiram 24 horas após a criação;
  registros expirados são limpos na próxima criação de sala.
- O PIN é um convite: qualquer pessoa que o conhecer pode entrar enquanto a sala estiver
  no lobby. Compartilhe somente com os participantes. Não há contas ou moderação pública.

## Hospedagem

Este projeto já está associado a um site no Sites. A publicação deve incluir
`.openai/hosting.json` com `d1: "DB"`, o Worker gerado em `dist/server` e os arquivos estáticos.
O provisionamento do D1 é feito pela plataforma ao publicar com esse binding.
O banco de desenvolvimento não é enviado para produção.

```sh
npm run build
```

Não hospede apenas os arquivos estáticos: as salas precisam da API e do banco D1.
Uma hospedagem alternativa precisa ser compatível com Workers, fornecer um binding D1
chamado `DB` e adaptar a configuração de publicação. `next start` sozinho não fornece esse binding.
Apenas editar os arquivos ou executar o build não atualiza o site publicado.

## Verificação

Com o servidor de desenvolvimento rodando em outro terminal:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Para testar outra instância, use `TEST_URL=http://localhost:3000 npm test`.
Use uma instância de teste: o teste cria uma sala e simula participantes reais.

Os testes de integração verificam entrada simultânea de seis jogadores, nomes automáticos,
restrições do anfitrião, rejeição de sessão inválida, sigilo de papéis, palavra única entre
parceiros, cronômetro compartilhado, novas rodadas sem repetição, transferência do anfitrião,
remoção de jogadores e PIN inválido. Eles encerram as participações criadas ao final.

O modo com um celular compartilha a memória do navegador entre os participantes e foi
feito para pessoas que não inspecionam o código durante a partida. Para papéis isolados
entre aparelhos, use as salas. O acesso inicial ao site precisa de conexão; não há service worker.
