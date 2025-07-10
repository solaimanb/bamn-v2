import { MentorRegistrationForm } from "./_components/MentorRegistrationForm";

export default function MentorRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4 bg-muted/50">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Join BAMN as a Mentor</h1>
          <p className="text-muted-foreground">
            Share your expertise and help shape the future of Bangladeshi academics
          </p>
        </div>

        <MentorRegistrationForm />

        <p className="text-center text-sm text-muted-foreground">
          By registering, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
} 