# Chess Backend

Cloudflare Workers backend for a player-vs-bot chess game where:

- the backend is the complete source of truth
- the player is always white
- the bot is always black
- the bot chooses a random legal move after every legal white move

## Architecture

- One public Worker handles HTTP routing.
- One Durable Object instance represents one chess game.
- Each game stores the canonical board state, turn, castling rights, en passant target, move history, and status.

This keeps move validation and bot selection on the server side.

## Endpoints

### `POST /game/start`

Creates a new game and returns the initial snapshot and player token.

Response shape:

```json
{
  "playerToken": "uuid",
  "snapshot": {
    "gameId": "uuid",
    "playerColor": "white",
    "board": { "piece": [] },
    "turn": "white",
    "status": "playing",
    "winner": null,
    "castlingRights": {
      "white": { "kingSide": true, "queenSide": true },
      "black": { "kingSide": true, "queenSide": true }
    },
    "enPassantTarget": null,
    "ply": 0,
    "moveHistory": []
  }
}
```

### `GET /game/:gameId`

Returns the latest canonical game snapshot.

Required header:

```txt
Authorization: Bearer <playerToken>
```

### `POST /game/:gameId/move`

Submits a white move and returns both the accepted player move and the bot reply in a single response.

Required header:

```txt
Authorization: Bearer <playerToken>
```

Request body:

```json
{
  "from": { "x": 6, "y": 4 },
  "to": { "x": 4, "y": 4 },
  "expectedPly": 0
}
```

Promotion example:

```json
{
  "from": { "x": 1, "y": 0 },
  "to": { "x": 0, "y": 0 },
  "promotion": "queen",
  "expectedPly": 12
}
```

## Run Locally

1. Install dependencies in [Backend/package.json](/G:/coding/web-dev/Chess/Backend/package.json).
2. Generate worker types with `npm run typegen`.
3. Start the worker with `npm run dev`.

## Notes

- `expectedPly` is used to reject stale move submissions.
- If the client omits a promotion piece, the backend defaults to queen promotion.
- Responses are returned with `Cache-Control: no-store`.
