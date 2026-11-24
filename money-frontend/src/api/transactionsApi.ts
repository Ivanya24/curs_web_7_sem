import {type CreateTransactionDto, type TransactionDto, type SummaryDto } from "../types/money";

const BASE_URL = "http://localhost:5191/api/transactions";

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

export const transactionsApi = {
    getByAccount: (accountId: number,from?: string,to?: string): Promise<TransactionDto[]> => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);

        const qs = params.toString();
        return request<TransactionDto[]>(
            `${BASE_URL}/account/${accountId}${qs ? `?${qs}` : ''}`
        );
    },

    GetById: (transactionID: number): Promise<TransactionDto> => {
        return request<TransactionDto>(`${BASE_URL}/${transactionID}`)
    },

    Create: (dto: CreateTransactionDto): Promise<TransactionDto> =>
        request<TransactionDto>(BASE_URL, {
            method: "POST",
            body: JSON.stringify(dto),
        }),

    getAll: (from?: string, to?: string): Promise<TransactionDto[]> => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);

        const qs = params.toString();
        return request<TransactionDto[]>(
            `${BASE_URL}${qs ? `?${qs}` : ''}`
        );
    },
    
    Summary: (from?: string, to?: string): Promise<SummaryDto> => {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);

        const qs = params.toString();
        return request<SummaryDto>(
            `${BASE_URL}/summary${qs ? `?${qs}` : ''}`
        );
    },

    Update: (id: number, dto: CreateTransactionDto): Promise<TransactionDto> =>
        request<TransactionDto>(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
    }),

    Delete: (id: number): Promise<void> =>
        request<void>(`${BASE_URL}/${id}`,
        {method:"DELETE"}
        ),
}