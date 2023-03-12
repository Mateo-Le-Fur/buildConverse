import type { UserForm } from "@/shared/interfaces/UserForm";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";

const BASE_URL = "/api/friend";

export async function addFriends(
  friendForm: UserForm
): Promise<FriendsInterface[]> {
  try {
    const response = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      body: JSON.stringify(friendForm),
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
