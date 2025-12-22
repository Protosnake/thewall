import { z } from "zod";

export const AuthSchema = {
  login: {
    path: "/login",
    GET: {},
    POST: {
      body: z.object({
        email: z.email("Please enter a valid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    },
  },
  signup: {
    path: "/signup",
    GET: {},
    POST: {
      body: z
        .object({
          email: z.email("Invalid email format"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          repeatPassword: z.string(),
        })
        .refine((data) => data.password === data.repeatPassword, {
          message: "Passwords do not match",
          path: ["repeatPassword"],
        }),
    },
  },
  logout: {
    path: "/logout",
    GET: {}, // Simple redirect action
  },
} as const;

// Helper types derived from the schema
export type LoginBody = z.infer<typeof AuthSchema.login.POST.body>;
export type SignupBody = z.infer<typeof AuthSchema.signup.POST.body>;
