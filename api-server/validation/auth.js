import z from "zod";

export const loginSchema = z.object({
  username: z.string().trim(),
  password: z.string().min(5, { message: "Password must be of 5 characters" }),
});

export const registerSchema = loginSchema.extend({
  email: z.string().email(),
});