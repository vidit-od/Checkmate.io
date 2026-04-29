export interface RpcSuccess<T> {
  ok: true;
  data: T;
}

export interface RpcFailure {
  ok: false;
  error: {
    status: number;
    code: string;
    message: string;
  };
}

export class GameError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const toRpcFailure = (error: unknown): RpcFailure => {
  if (error instanceof GameError) {
    return {
      ok: false,
      error: {
        status: error.status,
        code: error.code,
        message: error.message,
      },
    };
  }

  return {
    ok: false,
    error: {
      status: 500,
      code: "internal_error",
      message: "An unexpected error occurred.",
    },
  };
};

export const toRpcSuccess = <T>(data : T) : RpcSuccess<T> =>{
    return {
        ok : true,
        data : data
    }
}
