'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegistrationSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card className="shadow-lg border-2">
                    <CardHeader className="text-center space-y-2 pb-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="flex justify-center"
                        >
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-primary">
                            Registration Successful!
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        <p className="text-muted-foreground text-center">
                            Thank you for joining BAMN as a mentor. We're excited to have you on board!
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="font-semibold">Under Review</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your application is being reviewed by our administrators. This typically takes 1-2 business days.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h3 className="font-semibold">Next Steps</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You'll receive an email notification once your account is approved.
                                        Make sure to check your spam folder.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Link href="/" className="block">
                                <Button className="w-full group" size="lg">
                                    Back to Home
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <p className="text-xs text-center text-muted-foreground">
                                Questions? Contact us at{' '}
                                <a href="mailto:support@bamn.org" className="text-primary hover:underline">
                                    support@bamn.org
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
} 