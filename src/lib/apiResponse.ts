type ApiResponseOptions<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
};

export function createApiResponse<T>({
  success,
  data = undefined,
  error = "",
  status = 200,
}: ApiResponseOptions<T>): Response {
  return new Response(
    JSON.stringify({
      success,
      ...(success ? { data } : { error }),
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
