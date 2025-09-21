// API client skeleton
export interface ApiClientOptions {
  baseUrl?: string;
}

export function createApiClient(opts: ApiClientOptions = {}) {
  const baseUrl = opts.baseUrl || process.env.BACKEND_URL || '';
  return {
    get: async (_path: string) => { void _path; return { baseUrl }; },
    post: async (_path: string, _body?: unknown) => { void _path; void _body; return { baseUrl }; },
  };
}
