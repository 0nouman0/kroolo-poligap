export interface JwtHeaders {
  alg: string;
  typ: string;
}

export interface JwtPayload {
  exp: number;
  sub: string;
}

export const jwtDecode = (token: string) => {
  const [headers, payload, signature] = token.split(".");

  const parsedHeaders = JSON.parse(atob(headers ?? "{}")) as JwtHeaders;
  const parsedPayload = JSON.parse(atob(payload ?? "{}")) as JwtPayload;

  const isExpired = parsedPayload.exp <= Math.floor(Date.now() / 1000);

  return {
    headers: parsedHeaders,
    body: parsedPayload,
    signature,
    isExpired,
  };
};
