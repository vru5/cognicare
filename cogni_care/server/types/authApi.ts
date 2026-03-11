export interface RegistrationBody {
    role: string;
    name: string;
    emailOrPhone: string;
    patientId?: string;
    familyMemberName?: string;
    familyMemberEmail?: string;
    familyMemberPhone?: string;
    password: string;
}