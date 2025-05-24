import { UserCredentials, RegisterData, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export async function loginUser(credentials: UserCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/login", credentials);
  return response.json();
}

export async function registerUser(data: RegisterData): Promise<User> {
  const response = await apiRequest("POST", "/api/register", data);
  return response.json();
}

export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/logout");
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiRequest("GET", "/api/me");
  return response.json();
}
