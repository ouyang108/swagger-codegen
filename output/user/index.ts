/*
 * @Author       : Cheng Chao(2205593667@qq.com)
 * @Version      : V1.0
 * @Date         : 2026-05-05 11:25:20
 * @Description  :
 */
import request from '@/request/index';

export const createUsersWithListInput = async (data: Array<{ id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number }>): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<void>('/user/createWithList', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const getUserByName = async (data: any): Promise<{ promise: Promise<{ id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number }>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<{ id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number }>('/user/{username}', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const updateUser = async (data: { id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number }): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.put<void>('/user/{username}', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const deleteUser = async (data: any): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.delete<void>('/user/{username}', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const loginUser = async (data: { username: string; password: string }): Promise<{ promise: Promise<string>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<string>('/user/login', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const logoutUser = async (data: any): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.get<void>('/user/logout', { params: data, signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const createUsersWithArrayInput = async (data: Array<{ id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number }>): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<void>('/user/createWithArray', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};

export const createUser = async (data: { id?: number; username?: string; firstName?: string; lastName?: string; email?: string; password?: string; phone?: string; userStatus?: number }): Promise<{ promise: Promise<void>; cancel: () => void }> => {
  const controller = new AbortController();

  const requestPromise = request.post<void>('/user', data, { signal: controller.signal });

  return {
    promise: requestPromise,
    cancel: () => controller.abort(),
  };
};
