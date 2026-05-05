/*
 * @Author       : Cheng Chao(2205593667@qq.com)
 * @Version      : V1.0
 * @Date         : 2026-05-05 11:25:20
 * @Description  : Auto-generated types from Swagger/OpenAPI document
 */

export interface ApiResponse {
  code?: number;
  type?: string;
  message?: string;
}

export interface Category {
  id?: number;
  name?: string;
}

export interface Pet {
  id?: number;
  category?: { id?: number; name?: string };
  name: string;
  photoUrls: Array<string>;
  tags?: Array<{ id?: number; name?: string }>;
  status?: "available" | "pending" | "sold";
}

export interface Tag {
  id?: number;
  name?: string;
}

export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  status?: "placed" | "approved" | "delivered";
  complete?: boolean;
}

export interface User {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  userStatus?: number;
}
