export type ExportStage =
  | 'INIT'
  | 'PAPER'
  | 'EXTENT'
  | 'GRID'
  | 'RENDER_MAP'
  | 'SCALE'
  | 'LEGENDS'
  | 'BUILD';

export class ExportError extends Error {
  constructor(
    public stage: ExportStage,
    message: string,
    public override cause?: unknown // <-- clave
  ) {
    super(`[${stage}] ${message}`);
    this.name = 'ExportError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function fail(
  stage: ExportStage,
  message: string,
  cause?: unknown
): never {
  throw new ExportError(stage, message, cause);
}
