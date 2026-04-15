import { z } from "zod";

// ---------------------------------------------------------------------------
// Create team
// ---------------------------------------------------------------------------

export const createTeamSchema = z.object({
    name: z.string().trim().min(1, "Team name is required").max(100),
    slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .max(60)
        .regex(
            /^[a-z0-9-]+$/,
            "Slug may only contain lowercase letters, numbers, and hyphens",
        ),
    visibility: z.enum(["shared", "private"]).default("shared"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// ---------------------------------------------------------------------------
// Team response DTO
// ---------------------------------------------------------------------------

export interface TeamDto {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    visibility: "shared" | "private";
}
