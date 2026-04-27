export type UserDoc = {
  email: string;
  role: Role;
  score: number;
  checkedIn: boolean;
};

export type Role = "participant" | "admin";
