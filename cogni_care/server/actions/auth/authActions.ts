/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegistrationBody } from "server/types/authApi.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";

export const registerUser = async (body: RegistrationBody) => {
  console.log("!!! COGNICARE NEW AUTH LOGIC STARTING !!!");
  const {
    role,
    name,
    emailOrPhone,
    patientId,
    familyMemberName,
    familyMemberEmail,
    familyMemberPhone,
    password,
  } = body;

  if (!role || !name || !emailOrPhone) {
    throw new Error("Missing required fields");
  }
  if (!password) {
    throw new Error("Password is required");
  }

  const isEmail = emailOrPhone.includes("@");
  const email = isEmail ? emailOrPhone : null;
  const phone = !isEmail ? emailOrPhone : null;

  // Use transaction to ensure atomic creation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (prisma as any).$transaction(async (tx: any) => {
    // 1. Check if user already exists
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      throw new Error("A user with this email or phone already exists");
    }

    // 2. Create User (with hashed password)
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone,
        role,
        password: hashedPassword,
      },
    });

    if (role === "PATIENT") {
      // 3. Create Patient Profile with Date-now ID
      const patientProfileId = `PAT-${Date.now()}`;
      const patientProfile = await tx.profilePatient.create({
        data: {
          id: patientProfileId,
          userId: user.id,
        },
      });

      // 4. Create Family Member if details provided
      if (familyMemberName) {
        await tx.familyMember.create({
          data: {
            name: familyMemberName,
            email: familyMemberEmail || null,
            phone: familyMemberPhone || "",
            patientId: patientProfile.id,
          },
        });
      }

      return {
        message: "Registration successful",
        userId: user.id,
        profileId: patientProfile.id,
      };
    } else if (role === "CARER") {
      // 3. Create Carer Profile with Date-now ID
      const carerProfileId = `CAR-${Date.now()}`;
      const carerProfile = await tx.profileCarer.create({
        data: {
          id: carerProfileId,
          userId: user.id,
        },
      });

      // 4. Link to Patient if ID provided
      if (patientId) {
        // VALIDATE Patient ID exists first to avoid foreign key crash
        const patientExists = await tx.profilePatient.findUnique({
          where: { id: patientId },
        });

        if (!patientExists) {
          throw new Error(
            `Patient ID "${patientId}" not found. Please check the ID and try again.`,
          );
        }

        await tx.carersOnPatients.create({
          data: {
            carerId: carerProfile.id,
            patientId: patientId,
          },
        });
      }

      return {
        message: "Registration successful",
        userId: user.id,
        profileId: carerProfile.id,
      };
    }

    return { message: "Registration successful", userId: user.id };
  });
};

export const getProfileAction = async (userId: string) => {
  try {
    const patient = await (prisma as any).profilePatient.findUnique({
      where: { userId },
    });
    if (patient)
      return { success: true, role: "PATIENT", profileId: patient.id };

    const carer = await (prisma as any).profileCarer.findUnique({
      where: { userId },
    });
    if (carer) return { success: true, role: "CARER", profileId: carer.id };

    return { success: false, error: "Profile not found" };
  } catch (error: unknown) {
    console.error("Failed to get profile:", error);
    return { success: false, error: "Internal server error" };
  }
};

export const loginUser = async (body: { email: string; password: string }) => {
  console.log("LOGIN ATTEMPT START:", body.email);
  const { email, password } = body;

  if (!email || !password) {
    console.log("LOGIN ERROR: Missing email or password");
    throw new Error("Email and password are required");
  }

  const user = await (prisma as any).user.findFirst({
    where: {
      OR: [
        { email: email },
        { phone: email },
      ],
    },
  });
  console.log("LOGIN USER FOUND:", user ? `Yes (${user.id})` : "No");

  if (!user) {
    throw new Error("Invalid email or phone");
  }

  if (!user.password) {
    console.log(
      "LOGIN ERROR: User exists but has no password (legacy account)",
    );
    throw new Error("Invalid email or password");
  }

  const bcrypt = await import("bcryptjs");
  const isValid = await bcrypt.compare(password, user.password);
  console.log("LOGIN BCRYPT MATCH:", isValid);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // Resolve profile ID
  const patient = await (prisma as any).profilePatient.findUnique({
    where: { userId: user.id },
  });
  if (patient) {
    return {
      success: true,
      userId: user.id,
      profileId: patient.id,
      role: "PATIENT",
      name: user.name,
    };
  }

  const carer = await (prisma as any).profileCarer.findUnique({
    where: { userId: user.id },
  });
  if (carer) {
    return {
      success: true,
      userId: user.id,
      profileId: carer.id,
      role: "CARER",
      name: user.name,
    };
  }

  return {
    success: true,
    userId: user.id,
    profileId: null,
    role: user.role,
    name: user.name,
  };
};
