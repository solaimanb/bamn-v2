import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Registration Successful!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">
                        Thank you for registering as a mentor with BAMN. Your application has been submitted and is pending review by our administrators.
                    </p>
                    <p className="text-gray-600">
                        You will receive an email notification once your account has been approved.
                    </p>
                    <div className="pt-4">
                        <Link href="/login">
                            <Button className="w-full">
                                Go to Login
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 