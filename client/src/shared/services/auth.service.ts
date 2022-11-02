import type { UserForm } from "@/shared/interfaces/UserForm";
import type { LoginForm } from "@/shared/interfaces/LoginForm";
import type { User } from "@/shared/interfaces/User";

const BASE_URL = "/api/auth";

export async function createUser(userForm: UserForm): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/signin`, {
      method: "POST",
      body: JSON.stringify(userForm),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw await response.json();
    } else {
      return await response.json();
    }
  } catch (e) {
    throw e;
  }
}

export async function login(loginForm: LoginForm): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify(loginForm),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw await response.json();
    } else {
      return await response.json();
    }
  } catch (e) {
    throw e;
  }
}

export async function logout() {
  await fetch(`${BASE_URL}/logout`, {
    method: "DELETE",
  });
}

export async function fetchCurrentUser(): Promise<User | null> {
  return await (await fetch(`${BASE_URL}/current`)).json();
}
