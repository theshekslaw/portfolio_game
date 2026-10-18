export interface SceneState {
  mode: string | null;
  god: boolean;
  page: string | null;
  menu: string | null;
}

export default class SceneEngine {
  constructor(startMode?: string);
  state: SceneState;
  reduced: boolean;
  sync(next: Partial<SceneState>): void;
  attach(el: HTMLCanvasElement | null): void;
  destroy(): void;
  setReduced(reduced: boolean): void;
  renderStill(): void;
  onMove(e: { clientX: number; clientY: number }): void;
  leave(): void;
  tap(e: { clientX: number; clientY: number }): 'strike' | 'hat' | null;
}
