# Os Parceiros

Coleção de seis jogos em português para jogar com amigos, em telas de celular ou computador.

| Jogo                  | Como funciona                                                                     |
| --------------------- | --------------------------------------------------------------------------------- |
| O Impostor            | 3 a 20 pessoas, salas com PIN ou um celular; papéis secretos, pistas e resultado. |
| Quem é mais provável? | 2 a 20 pessoas/equipes, 10 perguntas e placar de indicações.                      |
| Desafio Relâmpago     | Missões de 20 segundos, uma vez por pessoa, com confirmação da turma.             |
| Quem sou eu?          | Adivinhação na testa, 30/60/90 segundos, acertos, passes e movimentos opcionais.  |
| Mímica                | Palavras para representar sem falar, com tempo e placar por pessoa/equipe.        |
| 5 Segundos            | Diga três exemplos de um tema antes de o tempo acabar.                            |

**Site:** [os-parceiros.onrender.com](https://os-parceiros.onrender.com)

Nomes de até 24 caracteres, sem repetições na mesma partida. Nas salas, o nome é
opcional ao entrar e pode ser alterado no lobby. Se ficar vazio, usamos Jogador 1 etc.
As comparações ignoram maiúsculas e acentos para evitar nomes visualmente confundíveis.
Os cinco jogos de festa usam o mesmo aparelho; o modo com PIN é exclusivo do Impostor.

## Quem sou eu? e sensores

1. Escolha pessoas/equipes, categoria e tempo.
2. Antes de começar, toque em **Ativar movimentos**, se quiser usar o sensor.
3. Segure o celular na testa, tela voltada para a turma e aproximadamente vertical.
4. Após os três segundos de preparação, incline a tela para o céu para marcar acerto,
   ou para o chão para passar. Volte à vertical antes da próxima ação.
5. Ao fim do tempo, confira respostas e passe para a próxima pessoa.

Os botões funcionam mesmo sem sensores. A permissão é solicitada apenas ao tocar no
botão; navegadores compatíveis exigem HTTPS. A detecção usa a normal da tela, funciona
independentemente de retrato/paisagem e exige posição neutra, movimento sustentado e
intervalo entre ações para evitar pontuação duplicada. Não é necessário sacudir nem
lançar o aparelho. Uma palavra sem resposta ao terminar a vez sai do baralho.

Sensores reais dependem do dispositivo, navegador e permissões. Os testes automatizados
cobrem os cálculos e transições, mas não substituem teste físico em iPhone/Android.

## Organização

- `app/page.tsx`: catálogo e seleção do jogo.
- `app/components/games/`: interfaces do Impostor local e dos jogos de festa.
- `app/components/online.tsx`: entrada, lobby e partida com PIN.
- `app/components/players-editor.tsx`: edição compartilhada dos nomes.
- `app/components/icons.tsx`: ícones Lucide em um único padrão visual.
- `app/hooks/use-tilt.ts`: permissão, leitura e limpeza do sensor.
- `lib/party-engine.ts`: regras determinísticas de rodadas e pontuação.
- `lib/motion.ts`: cálculo da inclinação e bloqueio de acionamentos duplicados.
- `lib/game.ts`, `lib/database.ts`: regras das salas e persistência SQLite.
- `lib/words.ts`, `lib/party.ts`: conteúdo editorial dos jogos.
- `tests/`: testes unitários e integração HTTP; `docs/QA.md`: escopo de verificação.

## Executar localmente

Requisitos: Node.js 22.14 (versão fixada em `.node-version`) e npm.

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo terminal (normalmente http://localhost:3000).
Para jogar em vários celulares na mesma rede Wi-Fi, abra em todos eles
`http://IP-LOCAL-DO-COMPUTADOR:3000`. Libere a porta no firewall, se necessário.
O computador deve permanecer ligado com o servidor em execução. Redes de convidados
podem bloquear a comunicação entre aparelhos. Fora dessa rede, use uma publicação HTTPS.

## Como jogar com PIN

1. Escolha **Jogar com PIN → Criar sala**. Você será o anfitrião. Escolha seu nome antes de criar a sala.
2. Os amigos abrem o mesmo site, digitam o PIN de seis números e entram.
3. O anfitrião escolhe a categoria e a quantidade de impostores e sorteia os papéis.
4. Cada pessoa revela seu papel e toca em **Memorizei, estou pronto**.
5. Quando todos confirmam, começa o cronômetro compartilhado de cinco minutos.
6. Dê uma pista por vez. Ao fim do tempo, votem em voz alta. O anfitrião encerra
   para revelar a palavra e os impostores, e pode preparar outra rodada na mesma sala.

A conversa e a votação são presenciais ou por uma chamada de voz externa.
O site não inclui chat ou votação eletrônica.

## Palavras

O acervo tem **915 palavras e expressões únicas**, entre listas editoriais próprias e
415 termos selecionados do banco aberto `pythonprobr/palavras`. Categorias: Comidas,
Lugares, Objetos, Animais, Lazer e esportes, Desafio extra e Misturado.
A fonte, licença e atualização reproduzível estão em [docs/WORDS.md](docs/WORDS.md).
O jogo não exige chave ou assinatura e não consulta serviços externos durante a partida.

As palavras são sorteadas sem repetição até esgotar a categoria. O histórico fica na
sala; no modo local dura enquanto você permanece no Impostor. Ao voltar ao catálogo
ou atualizar a página, o histórico local é reiniciado.

### Ordem de impostores e de quem começa

`lib/draw.ts` usa sorteio ponderado com aleatoriedade criptográfica. A chance é maior
para quem foi escolhido menos vezes e menor para quem saiu na rodada anterior.
Todos continuam com chance positiva: não há fila obrigatória que permita adivinhar
quem falta. Repetições ainda são possíveis; não há promessa de alternância perfeita.
Impostores e primeiro jogador possuem históricos separados. O histórico do servidor
não é enviado aos celulares. Uma pessoa nunca ocupa dois papéis de impostor na mesma rodada.

O histórico se mantém entre rodadas na mesma sala. Na partida local, editar a lista de
jogadores reinicia o equilíbrio. Novos sorteios, inclusive rodadas canceladas, contam
como escolhas, pois os participantes podem já ter visto seus papéis.

## Funcionamento das salas

- React 19, Next.js 16 e ícones Lucide, com servidor Node.js.
- API em `app/api/rooms/route.ts`; regras em `lib/game.ts`.
- SQLite armazena as salas, usando o módulo nativo `node:sqlite`, sem serviço externo.
  O arquivo padrão é `data/rooms.sqlite`; `DATABASE_PATH` permite escolher outro caminho.
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

## Hospedagem gratuita no Render

Use **New → Web Service** (não Static Site). Conecte este repositório e preencha:

| Campo              | Valor                                   |
| ------------------ | --------------------------------------- |
| Branch             | `main`                                  |
| Language / Runtime | `Node`                                  |
| Root Directory     | Deixar vazio                            |
| Build Command      | `npm ci --include=dev && npm run build` |
| Start Command      | `npm start`                             |
| Instance Type      | `Free`                                  |
| Health Check Path  | `/api/health`                           |

Variáveis: `NODE_VERSION=22.14.0`, `NODE_ENV=production`,
`NEXT_TELEMETRY_DISABLED=1` e `DATABASE_PATH=/tmp/os-parceiros/rooms.sqlite`.
O Render fornece `PORT` automaticamente; o servidor escuta em `0.0.0.0`.
Também é possível usar **New → Blueprint**: `render.yaml` contém essa configuração.
Nenhuma chave de API, banco pago ou cartão é configurado pelo projeto.

**Limites do plano gratuito:** o Render suspende serviços após 15 minutos sem tráfego;
abrir o site novamente pode levar cerca de um minuto. As salas podem desaparecer ao
reiniciar, suspender ou publicar uma versão nova, pois o disco é temporário. Nesse caso,
crie uma sala nova. O jogo detecta sessões expiradas. Não faça deploy durante uma partida.
O contador de 24 horas é o limite máximo da sala, não uma garantia de persistência.

Para manter salas após reiniciar em uma hospedagem com disco persistente, defina
`DATABASE_PATH` para um arquivo nesse disco. No Render, disco persistente exige plano
pago e não faz parte da configuração gratuita. Use uma única instância do servidor:
SQLite local não compartilha salas entre múltiplas instâncias.

Não publique apenas arquivos estáticos: as salas precisam do servidor Node.

Documentação: [Web Services](https://render.com/docs/web-services),
[limites gratuitos](https://render.com/docs/free).

## Verificação

Com o servidor de desenvolvimento rodando em outro terminal:

```sh
npm run typecheck
npm run lint
npm run format:check
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

### Comandos de manutenção

`npm run test:unit` não precisa de servidor. Para a integração, execute `npm run dev`
em outro terminal. `npm run format` aplica o padrão Prettier a todo o código.

O placar dos jogos presenciais fica na memória da página. Atualizar ou sair da partida
zera esse placar; o diálogo de saída protege contra cliques acidentais na navegação.
O tempo não pausa ao trocar de aba. Em desafios de fala e mímica, a turma confirma as
respostas: o site não usa câmera, microfone ou reconhecimento de voz.
