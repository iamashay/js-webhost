import z from "zod";

export const ProjectSchema = z.object({
  buildScript: z.string().trim().refine(value => {
    // Ensure the string contains only one word (no spaces)
    return /^\w+$/.test(value);
  }, {
      message: 'Invalid input for build script, provide only script name',
  }).optional(),
  buildFolder: z.string().trim().refine(value => {
    // Ensure the string contains only one word (no spaces)
    return /^\w+$/.test(value);
  }, {
      message: 'Invalid location provided for build folder. Use only name, no slashes',
  }).optional(),
  projectType: z.string().trim().optional()
})

export const newProjectSchema = ProjectSchema.extend({
  gitURL: z
    .string()
    .includes("github", { message: "Not a valid github URL" })
    .trim()
    .url({ message: "Not a valid URL" }),
  projectId: z.string().trim().optional()
});

export const updateProjectSchema = ProjectSchema.extend({
  gitURL: z
    .string()
    .includes("github", { message: "Not a valid github URL" })
    .trim()
    .url({ message: "Not a valid URL" }).optional(),
  projectId: z.string({required_error: "Project id is invalid"}).trim()
});

export const buildProjectSchema  = z.object({
  projectId: z.string({required_error: "Project id is invalid"}).trim()
});