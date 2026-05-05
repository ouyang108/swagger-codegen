/*
 * @Author       : Cheng Chao(2205593667@qq.com)
 * @Version      : V1.0
 * @Date         : 2026-05-05 11:25:20
 * @Description  :
 */
import request from '@/request/index';

export const uploadFile = async (data: any): Promise<{ promise: Promise<{ code?: number; type?: string; message?: string }>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<{ code?: number; type?: string; message?: string }>('/pet/{petId}/uploadImage', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const addPet = async (data: { id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<void>('/pet', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const updatePet = async (data: { id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.put<void>('/pet', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const findPetsByStatus = async (data: { status: Array<any> }): Promise<{ promise: Promise<Array<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<Array<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>>('/pet/findByStatus', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const findPetsByTags = async (data: { tags: Array<any> }): Promise<{ promise: Promise<Array<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<Array<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>>('/pet/findByTags', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const getPetById = async (data: any): Promise<{ promise: Promise<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<{ id?: number; category?: { id?: number; name?: string }; name: string; photoUrls: Array<string>; tags?: Array<{ id?: number; name?: string }>; status?: "available" | "pending" | "sold" }>('/pet/{petId}', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const updatePetWithForm = async (data: any): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<void>('/pet/{petId}', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const deletePet = async (data: any): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.delete<void>('/pet/{petId}', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};
