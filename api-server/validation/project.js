import z from "zod";

export const newProjectSchema = z.object({
  gitURL: z
    .string()
    .includes("github", { message: "Not a valid github URL" })
    .trim()
    .url({ message: "Not a valid URL" }),
  buildScript: z.string().trim().optional(),
  buildFolder: z.string().trim().optional(),
  projectId: z.string().trim().optional()
});

export const updateProjectSchema = z.object({
  gitURL: z
    .string()
    .includes("github", { message: "Not a valid github URL" })
    .trim()
    .url({ message: "Not a valid URL" }).optional(),
  buildScript: z.string().trim().optional(),
  buildFolder: z.string().trim().optional(),
  projectId: z.string({required_error: "Project id is invalid"}).trim()
});

export const buildProjectSchema  = z.object({
  projectId: z.string({required_error: "Project id is invalid"}).trim()
});