import z from "zod";

export const buildSchema = z.object({
  gitURL: z
    .string()
    .includes("github", { message: "Not a valid github URL" })
    .trim()
    .url({ message: "Not a valid URL" }),
  buildScript: z.string().trim().optional(),
  buildFolder: z.string().trim().optional(),
});
