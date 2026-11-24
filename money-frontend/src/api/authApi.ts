import type { RegisterDto, LoginDto, AuthResponseDto } from "../types/auth";

const BASE_URL = "http://localhost:5191/api/Auth";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Ошибка ${response.status}`);
  }

  if (response.status == 204) return undefined as T;

  const text = await response.text();
  try{
    return JSON.parse(text);
  }catch{
    return text as unknown as T;
  }
}

export const authApi = {
    register: (dto: RegisterDto): Promise<AuthResponseDto> =>
        request<AuthResponseDto>(`${BASE_URL}/register`,{
            method: "POST",
            body: JSON.stringify(dto),
        }),
    login: (dto: LoginDto): Promise<AuthResponseDto>=>
        request<AuthResponseDto>(`${BASE_URL}/login`,{
            method: "POST",
            body: JSON.stringify(dto),
        }),
};
