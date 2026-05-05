/*
 * @Author       : Cheng Chao(2205593667@qq.com)
 * @Version      : V1.0
 * @Date         : 2026-05-05 11:25:20
 * @Description  :
 */
import request from '@/request/index';

export const getInventory = async (data: any): Promise<{ promise: Promise<Record<string, any>>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<Record<string, any>>('/store/inventory', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const placeOrder = async (data: { id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean }): Promise<{ promise: Promise<{ id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean }>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<{ id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean }>('/store/order', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const getOrderById = async (data: any): Promise<{ promise: Promise<{ id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean }>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<{ id?: number; petId?: number; quantity?: number; shipDate?: string; status?: "placed" | "approved" | "delivered"; complete?: boolean }>('/store/order/{orderId}', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const deleteOrder = async (data: any): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.delete<void>('/store/order/{orderId}', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};
