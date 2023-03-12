import crypto from "crypto";

export function generateInviteCode(): string {
  const values: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let inviteCode: string = "";
  for (let i = 0; i < 8; i++) {
    const random = crypto.randomInt(values.length - 1);
    inviteCode += values[random];
  }

  return inviteCode
}