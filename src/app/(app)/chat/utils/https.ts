import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

import { jwtDecode } from "./jwt";

export * from "./jwt";

export const __LOGIN_SESSION__ = "__LOGIN_SESSION__";

export interface IUserSession {
  AccessToken: string;
  RefreshToken: string;
}

export const getTokens = () => {
  const userSession = localStorage.getItem(__LOGIN_SESSION__);

  return JSON.parse(userSession ?? "{}") as IUserSession;
};

export interface AuthResponse {
  AuthenticationResult?: IUserSession;
}

export const refreshTokenAPI = async (
  refreshToken: string
): Promise<
  { data: null; success: false } | { data: AuthResponse; success: true }
> => {
  try {
    const { data } = await axios.post<AuthResponse>(
      `${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/users/refresh`,
      {
        refreshToken,
      }
    );

    return { data, success: true };
  } catch (err) {
    const error = err as AxiosError<{ reason: string }>;

    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.reason === "NOT_AUTHORIZED"
    ) {
      localStorage.clear();
      window.location.href = "/signin";
    }

    return { data: null, success: false };
  }
};

export const getAuthHeader = async () => {
  const { AccessToken, RefreshToken } = getTokens();
  if (!AccessToken && !RefreshToken) return null;

  const access = AccessToken ? jwtDecode(AccessToken) : { isExpired: true };

  if (access.isExpired) {
    const { data, success } = await refreshTokenAPI(RefreshToken);

    if (!success) return `Bearer ${AccessToken}`;

    const userSession = JSON.parse(
      localStorage.getItem(__LOGIN_SESSION__) ?? "{}"
    ) as IUserSession;

    const updatedSession = JSON.stringify({
      ...userSession,
      ...data.AuthenticationResult,
    });

    localStorage.setItem(__LOGIN_SESSION__, updatedSession);

    return `Bearer ${data.AuthenticationResult?.AccessToken}`;
  }

  return `Bearer ${AccessToken}`;
};

export const assignHeader = async (request: InternalAxiosRequestConfig) => {
  Object.assign(request.headers, {
    Authorization: localStorage.getItem(__LOGIN_SESSION__),
  });

  return request;
};

export const krooloHttpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REACT_APP_API_URL,
});
export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REACT_APP_API_URL!.replace("/v1", ""),
});

krooloHttpClient.interceptors.request.use(assignHeader);
httpClient.interceptors.request.use(assignHeader);
