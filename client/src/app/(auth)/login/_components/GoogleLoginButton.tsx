'use client';

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { Loader2 } from "lucide-react"

interface GoogleLoginButtonProps {
    onSuccess: (response: CredentialResponse) => void;
    onError: () => void;
    isLoading: boolean;
}

function GoogleLoginButton({ onSuccess, onError, isLoading }: GoogleLoginButtonProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 h-11 w-full rounded-md border border-slate-200">
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                <span className="text-sm text-slate-600 font-medium">Verifying...</span>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                type="standard"
                theme="outline"
                size="medium"
                text="continue_with"
                shape="pill"
                locale="en"
                useOneTap={false}
                auto_select={false}
                cancel_on_tap_outside={true}
            />
        </div>
    );
}

export default GoogleLoginButton; 