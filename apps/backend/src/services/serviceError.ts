// Expected service failures; the HTTP layer preserves their public response shape.
export class ServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error: string } | { message: string } | string,
  ) {
    super(
      typeof body === 'string'
        ? body
        : 'error' in body
          ? body.error
          : body.message,
    );
    this.name = 'ServiceError';
  }
}
