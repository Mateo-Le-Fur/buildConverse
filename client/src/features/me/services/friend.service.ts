import type { UserForm } from "@/shared/interfaces/UserForm";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";

const BASE_URL = "/api/friend";

export async function getFriends(
  friendForm: UserForm
): Promise<FriendsInterface[]> {
  try {
    const response = await fetch(`${BASE_URL}/add/${friendForm.pseudo}`);

    if (!response.ok) {
      throw await response.json();
    } else {
      return await response.json();
    }
  } catch (e) {
    throw e;
  }
}
