# Relatório de verificação

Verificação local realizada em 8 de setembro de 2026, com build de produção em Node 22.

## Testes automatizados

- 11 testes unitários: nomes, distribuição ponderada dos papéis, seleção sem duplicatas, temporizador, pontuação, fim de rodada e interpretação dos movimentos do aparelho.
- Integração das salas: entradas simultâneas, limite de 20 participantes, autenticação, permissões do anfitrião, privacidade dos papéis, palavra compartilhada, início e encerramento sincronizados, cancelamento, transferência de anfitrião, saída e expulsão.
- Validação: nomes duplicados e inválidos, alteração do próprio nome, configurações inválidas, sala fechada, origem da requisição, JSON inválido e limite do corpo da requisição.
- Compilação de produção, TypeScript, ESLint e formatação.

## Verificação no navegador

- Catálogo com seis jogos e ícones; telas em dimensões de celular e paisagem sem transbordamento horizontal.
- Impostor local: edição dos participantes, revelação individual, cronômetro e resultado com palavra e impostor.
- Sala online: criação com nome, restauração da sessão após atualizar a página e bloqueio do início sem participantes suficientes. Os fluxos com vários participantes também foram exercitados pelos testes de integração.
- Quem sou eu e Mímica: preparação, acerto, passagem, término, troca de jogador e placar. Palavras exibidas ao encerrar são consumidas e registradas como sem resposta.
- Quem é mais provável: dez perguntas, voto, empate e placar final.
- Cinco segundos: expiração do tempo, avaliação da resposta e placar.
- Desafio relâmpago: início, expiração e avaliação; diálogo de saída e retorno com Escape.
- Nenhum erro ou aviso registrado no console durante a última inspeção do build de produção.

## Limites da verificação

Os cálculos dos gestos foram testados automaticamente. O sensor físico e as permissões em aparelhos iPhone e Android ainda precisam de teste em dispositivos reais. Os botões permitem jogar mesmo sem sensor.

O sorteio ponderado favorece quem saiu menos e reduz a chance de repetição imediata, mas não garante alternância. Isso preserva a imprevisibilidade dos papéis.

No plano gratuito do Render, o serviço pode demorar para responder após inatividade. As salas usam armazenamento temporário e podem ser perdidas em reinícios e novas publicações.

Este relatório descreve os cenários executados; não representa uma garantia de ausência de todo erro possível.
