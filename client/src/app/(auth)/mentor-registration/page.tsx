import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorRegistrationForm } from "./_components/MentorRegistrationForm";

export default function MentorRegistrationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Join BAMN as a Mentor</CardTitle>
        </CardHeader>
        <CardContent>
          <MentorRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
} 