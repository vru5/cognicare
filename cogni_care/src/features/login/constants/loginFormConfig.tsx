import { Eye, EyeOff } from "lucide-react";
import { EMAIL_OR_PHONE_TEXT, EMAIL_PLACEHOLDER, PASSWORD } from "@/constants/registrationPage";
import { LoginFormConfigProps, LoginFieldConfig } from "../types/loginForm";
import { HIDE_PASSWORD, LOGIN_PASSWORD_PLACEHOLDER, SHOW_PASSWORD } from "@/constants/loginPage";

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
            placeholder: LOGIN_PASSWORD_PLACEHOLDER,
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
                    aria-label={showPassword ? `${HIDE_PASSWORD}` : `${SHOW_PASSWORD}`}
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
