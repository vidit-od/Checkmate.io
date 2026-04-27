declare module "cloudflare:workers" {
  export class DurableObject {
    protected readonly ctx: DurableObjectState;

    constructor(ctx: DurableObjectState, env: unknown);
  }
}

interface DurableObjectStorage {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}

interface DurableObjectState {
  readonly storage: DurableObjectStorage;
}

interface DurableObjectNamespace<T = unknown> {
  getByName(name: string): T;
}
