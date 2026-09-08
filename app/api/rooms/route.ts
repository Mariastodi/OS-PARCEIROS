import { database } from "@/lib/database";
import type { DatabaseSync } from "node:sqlite";
export const runtime = "nodejs";
import {
  change,
  GameError,
  member,
  addMember,
  newRoom,
  type Room,
  view,
} from "@/lib/game";
import { randomInt } from "@/lib/words";

const headers = { "Cache-Control": "no-store, private" };
function auth(request: Request) {
  return request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
}
async function read(db: DatabaseSync, pin: string) {
  if (!/^\d{6}$/.test(pin)) throw new GameError("Digite um PIN de 6 números.");
  const row = (await db
    .prepare("SELECT body, revision FROM rooms WHERE pin = ? AND expires > ?")
    .get(pin, Date.now())) as { body: string; revision: number } | undefined;
  if (!row) throw new GameError("Sala não encontrada ou expirada.", 404);
  const room = JSON.parse(row.body) as Room;
  if (!room.players.length) throw new GameError("A sala foi encerrada.", 404);
  return { room, revision: row.revision };
}
function failure(error: unknown) {
  if (error instanceof GameError)
    return Response.json(
      { error: error.message },
      { status: error.status, headers },
    );
  console.error("Room request failed", error);
  return Response.json(
    { error: "Não foi possível conectar à sala. Tente novamente." },
    { status: 500, headers },
  );
}
export async function GET(request: Request) {
  try {
    const { room } = await read(
      await database(),
      new URL(request.url).searchParams.get("pin") ?? "",
    );
    return Response.json(view(room, auth(request)), { headers });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (
      origin &&
      new URL(origin).host !==
        (request.headers.get("host") ?? new URL(request.url).host)
    )
      throw new GameError("Origem não permitida.", 403);
    const raw = await request.text();
    if (raw.length > 2048) throw new GameError("Pedido muito grande.", 413);
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new GameError("Pedido inválido.");
    }
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new GameError("Pedido inválido.");
    const db = await database();
    if (data.action === "create") {
      await db.prepare("DELETE FROM rooms WHERE expires <= ?").run(Date.now());
      for (let attempt = 0; attempt < 10; attempt++) {
        const room = newRoom(
          String(100000 + randomInt(900000)),
          data.name,
          data.game,
        );
        const result = await db
          .prepare(
            "INSERT OR IGNORE INTO rooms (pin, body, expires) VALUES (?, ?, ?)",
          )
          .run(room.pin, JSON.stringify(room), room.expires);
        if (result.changes)
          return Response.json(
            {
              token: room.players[0].token,
              room: view(room, room.players[0].token),
            },
            { headers },
          );
      }
      throw new GameError("Tente criar a sala novamente.", 503);
    }
    for (let attempt = 0; attempt < 8; attempt++) {
      const { room, revision } = await read(db, String(data.pin ?? ""));
      let token = auth(request);
      if (data.action === "join") {
        const player = addMember(room, data.name);
        token = player.token;
      } else {
        member(room, token);
        change(room, token, String(data.action), data);
      }
      const result = await db
        .prepare(
          "UPDATE rooms SET body = ?, revision = revision + 1 WHERE pin = ? AND revision = ?",
        )
        .run(JSON.stringify(room), room.pin, revision);
      if (result.changes)
        return Response.json(
          data.action === "leave"
            ? { left: true }
            : { token, room: view(room, token) },
          { headers },
        );
    }
    throw new GameError(
      "A sala recebeu várias ações juntas. Tente novamente.",
      409,
    );
  } catch (error) {
    return failure(error);
  }
}
