import type { CreateAccountDto, AccountDto, AccountsSummaryDto } from "../types/money";

const BASE_URL = "http://localhost:5191/api/accounts";

async function request<T>(url:string , options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("token");
    
    const response = await fetch(url, {
        headers: { 
            "Content-Type": "application/json",
            ...(token? {Authorization : `Bearer ${token}`} : {}),
            
        },
        ...options
    });

    if (response.status === 401){
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Не авторизован");
    }

    if (!response.ok){
        const text = await response.text();
        throw new Error(text || `Ошибка ${response.status}`);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0"){
        return undefined as T;
    }

    return response.json();
}

export const accountsApi = {
    GetAll: (): Promise<AccountsSummaryDto> => request<AccountsSummaryDto>(BASE_URL),

    GetMy: (): Promise<AccountsSummaryDto> => request<AccountsSummaryDto>(`${BASE_URL}/my`),

    Create: (dto: CreateAccountDto): Promise<AccountDto> =>
        request<AccountDto>(BASE_URL, {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    Delete: (id: number): Promise<void> =>
        request<void>(`${BASE_URL}/${id}`,
            {method:"DELETE"}
        ),
}
