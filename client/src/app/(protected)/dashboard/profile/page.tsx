'use client';

import { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { getOwnProfile, updateOwnProfile } from '@/lib/mentorApi';
import { MentorResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Building2, GraduationCap, BookOpen, Globe2, PencilLine } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

interface ProfileFieldProps {
  icon: React.ElementType;
  label: string;
  value: string | string[];
  isLoading?: boolean;
}

const ProfileField = memo(({ icon: Icon, label, value, isLoading }: ProfileFieldProps) => {
  const displayValue = useMemo(() =>
    Array.isArray(value) ? value.join(', ') : value
    , [value]);

  if (isLoading) {
    return (
      <div className="flex items-start gap-2 py-2">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 py-2">
      <Icon className="h-5 w-5 text-muted-foreground mt-1" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{displayValue}</p>
      </div>
    </div>
  );
});
ProfileField.displayName = 'ProfileField';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  institution: z.string().min(2, 'Institution is required'),
  department: z.string().min(2, 'Department is required'),
  degrees: z.string().min(2, 'At least one degree is required'),
  research_interests: z.string().min(2, 'At least one research interest is required'),
  continent: z.string().min(2, 'Continent is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UpdateProfileData extends Omit<ProfileFormValues, 'degrees' | 'research_interests'> {
  degrees: string[];
  research_interests: string[];
}

const EditProfileDialog = memo(({ profile, onUpdate }: {
  profile: MentorResponse | null;
  onUpdate: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(() => ({
    full_name: profile?.full_name || '',
    institution: profile?.institution || '',
    department: profile?.department || '',
    degrees: profile?.degrees?.join(', ') || '',
    research_interests: profile?.research_interests?.join(', ') || '',
    continent: profile?.continent || '',
    country: profile?.country || '',
    city: profile?.city || '',
  }), [profile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  // Reset form when dialog opens/closes or profile changes
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, form, defaultValues]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const updateData: UpdateProfileData = {
        ...values,
        degrees: values.degrees.split(',').map(s => s.trim()).filter(Boolean),
        research_interests: values.research_interests.split(',').map(s => s.trim()).filter(Boolean),
      };
      await updateOwnProfile(updateData);
      toast.success('Profile updated successfully');
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset(defaultValues);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <PencilLine className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update your mentor profile information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="degrees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degrees (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ph.D., M.Sc., B.Sc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="research_interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Interests (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Machine Learning, Data Science, AI" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="continent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Continent</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
EditProfileDialog.displayName = 'EditProfileDialog';

const ProfileHeader = memo(({ profile, onUpdate }: { profile: MentorResponse | null; onUpdate: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold tracking-tight">Profile</h2>
      <p className="text-sm text-muted-foreground">
        View and manage your mentor profile information
      </p>
    </div>
    <EditProfileDialog profile={profile} onUpdate={onUpdate} />
  </div>
));
ProfileHeader.displayName = 'ProfileHeader';

const PersonalInfoCard = memo(({ profile, isLoading }: { profile: MentorResponse | null; isLoading: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle>Personal Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <ProfileField
        icon={Mail}
        label="Email"
        value={profile?.email || ''}
        isLoading={isLoading}
      />
      <ProfileField
        icon={Building2}
        label="Institution"
        value={profile?.institution || ''}
        isLoading={isLoading}
      />
      <ProfileField
        icon={GraduationCap}
        label="Department"
        value={profile?.department || ''}
        isLoading={isLoading}
      />
      <ProfileField
        icon={GraduationCap}
        label="Degrees"
        value={profile?.degrees || []}
        isLoading={isLoading}
      />
    </CardContent>
  </Card>
));
PersonalInfoCard.displayName = 'PersonalInfoCard';

const ResearchLocationCard = memo(({ profile, isLoading }: { profile: MentorResponse | null; isLoading: boolean }) => {
  const locationValue = useMemo(() => {
    if (!profile?.city && !profile?.country) return '';
    return [profile.city, profile.country].filter(Boolean).join(', ');
  }, [profile?.city, profile?.country]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research & Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileField
          icon={BookOpen}
          label="Research Interests"
          value={profile?.research_interests || []}
          isLoading={isLoading}
        />
        <ProfileField
          icon={Globe2}
          label="Continent"
          value={profile?.continent || ''}
          isLoading={isLoading}
        />
        <ProfileField
          icon={MapPin}
          label="Location"
          value={locationValue}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
});
ResearchLocationCard.displayName = 'ResearchLocationCard';

const ErrorAlert = memo(({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {error.message || 'Failed to load profile. Please try again later.'}
    </AlertDescription>
  </Alert>
));
ErrorAlert.displayName = 'ErrorAlert';

const ProfilePage = () => {
  const [profile, setProfile] = useState<MentorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getOwnProfile();
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} onUpdate={fetchProfile} />
      <div className="grid gap-6 md:grid-cols-2">
        <PersonalInfoCard profile={profile} isLoading={isLoading} />
        <ResearchLocationCard profile={profile} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ProfilePage;