// Shapes shared by the server routes and the browser UI. Nothing here is secret.

export type RunResult = {
  ok: boolean;
  /** Harmless, human-readable result. Never contains a credential. */
  message: string;
  /** HTTP status the mock provider answered with (0 = unreachable). */
  upstreamStatus: number;
  /** Provider's reason code when rejected: missing_key | invalid_key | revoked_key | insufficient_scope. */
  reason?: string;
  /** Which labelled key the provider says it saw (e.g. "Demo key A"). A label, not the key. */
  providerKeyLabel?: string;
  /** Label of the key this app is currently configured with (derived server-side from its env var). */
  configuredKeyLabel: string;
};

export type DemoState = {
  provider: { activeKeyLabel: string; revokedKeyLabels: string[] } | null;
  app: { configuredKeyLabel: string };
};
