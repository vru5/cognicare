import { z } from "zod";

const emailOrPhoneSchema = z
  .string()
  .min(1, "Email or phone is required")
  .refine(
    (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
      /^\+?[\d\s\-()]{7,15}$/.test(val),
    { message: "Enter a valid email address or phone number" }
  );

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, "Must contain a special character");

export const registrationSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    emailOrPhone: emailOrPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["PATIENT", "CARER"], {
      message: "Please select a role",
    }),
    // CARER-only
    patientId: z.string().optional(),
    // PATIENT-only (all optional, but validated if entered)
    familyMemberName: z.string().optional(),
    familyMemberEmail: z.string().optional().refine(
      (val) => !val || val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Invalid family email" }
    ),
    familyMemberPhone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.role !== "CARER" || (data.patientId && data.patientId.trim().length > 0),
    {
      message: "Patient ID is required for carers",
      path: ["patientId"],
    }
  );

export type RegistrationFormData = z.infer<typeof registrationSchema>;
