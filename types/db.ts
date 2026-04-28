export type UserDoc = {
  name: string;
  email: string;
  role: Role;
  score: number;
  checkedIn: boolean;
  qrCode: string;
};

export type Role = "participant" | "admin";
