export function getUserAvatar(id: number): string {
  const avatarURL = import.meta.env.VITE_AVATAR;
  return `${avatarURL}/user/${id}/${Date.now()}/avatar`;
}
