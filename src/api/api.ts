// src/api/api.ts

import axios from 'axios'
import type { AxiosResponse } from 'axios' // 使用类型-only 导入

// 定义请求参数的类型
interface Params {
    [key: string]: any
}

// 定义请求数据的类型
interface Data {
    [key: string]: any
}

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: import.meta.env.VUE_APP_BASE_API,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 定义泛型类型的 API 响应
type ApiResponse<T> = Promise<AxiosResponse<T>>

/**
 * 发送 GET 请求
 * @param url - 请求的 URL
 * @param params - 查询参数
 * @returns 服务器响应的 Promise 对象
 */
export const get = <T>(url: string, params?: Params): ApiResponse<T> => {
    return apiClient.get<T>(url, { params })
}

/**
 * 发送 POST 请求
 * @param url - 请求的 URL
 * @param data - 请求体数据
 * @returns 服务器响应的 Promise 对象
 */
export const post = <T>(url: string, data: Data): ApiResponse<T> => {
    return apiClient.post<T>(url, data)
}

/**
 * 发送 PUT 请求
 * @param url - 请求的 URL
 * @param data - 请求体数据
 * @returns 服务器响应的 Promise 对象
 */
export const put = <T>(url: string, data: Data): ApiResponse<T> => {
    return apiClient.put<T>(url, data)
}

/**
 * 发送 DELETE 请求
 * @param url - 请求的 URL
 * @param params - 查询参数
 * @returns 服务器响应的 Promise 对象
 */
export const del = <T>(url: string, params?: Params): ApiResponse<T> => {
    return apiClient.delete<T>(url, { params })
}

/**
 * 异步获取公钥，并通过回调函数返回公钥。
 * 
 * @param {Function} callback - 一个回调函数，接收公钥作为参数。
 * @throws {Error} 如果请求失败，则抛出错误。
 * 
 * @example
 * getPublicKey((publicKey) => {
 *     console.log('Received public key:', publicKey);
 * }).catch(error => {
 *     console.error('Error:', error);
 * });
 */
export const getPublicKey = async (callback: (publicKey: string) => void) => {
    try {
        const keyResponse = await get<{ data: Object; public_key: string }>('/auth/login')
        const publicKey = keyResponse.data.public_key
        callback(publicKey)
    } catch (err) {
        throw new Error((err as Error).message)
    }
}
