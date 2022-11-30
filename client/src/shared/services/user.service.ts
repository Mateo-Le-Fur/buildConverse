const BASE_URL = "/api/user";

export async function deleteUser(id: number | undefined) {
  await fetch(`${BASE_URL}/delete/${id}`, {
    method: "DELETE",
  });
}
