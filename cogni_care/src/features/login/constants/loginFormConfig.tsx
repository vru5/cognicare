import { Eye, EyeOff } from "lucide-react";
import { EMAIL_OR_PHONE_TEXT, EMAIL_PLACEHOLDER, PASSWORD, PASSWORD_PLACEHOLDER } from "@/constants/registerationPage";
import { LoginFormConfigProps, LoginFieldConfig } from "../types/loginForm";

export const getLoginFields = ({
    emailOrPhone,
    setEmailOrPhone,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    setError,
    error,
}: LoginFormConfigProps): LoginFieldConfig[] => {
    return [
        {
            id: "email",
            name: "emailOrPhone",
            text: EMAIL_OR_PHONE_TEXT,
            placeholder: EMAIL_PLACEHOLDER,
            type: "text",
            autoComplete: "username",
            value: emailOrPhone,
            required: true,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setEmailOrPhone(e.target.value);
                setError(null);
            },
        },
        {
            id: "password",
            name: "password",
            text: PASSWORD,
            placeholder: PASSWORD_PLACEHOLDER,
            type: showPassword ? "text" : "password",
            autoComplete: "current-password",
            value: password,
            required: true,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setError(null);
            },
            suffix: (
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            ),
        },
    ];
};
