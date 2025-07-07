'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { register } from '@/lib/authApi';
import { LocationMap } from './LocationMap';
import { ApiError } from '@/types/api';

const mentorRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  current_role: z.string().min(2, 'Current role is required'),
  institution: z.string().min(2, 'Institution is required'),
  department: z.string().min(2, 'Department is required'),
  degrees: z.string()
    .min(2, 'Degrees are required')
    .refine(
      (val) => val.split(',').every(d => d.trim().length >= 2),
      'Each degree must be at least 2 characters'
    )
    .refine(
      (val) => val.split(',').filter(d => d.trim().length > 0).length > 0,
      'At least one degree is required'
    ),
  research_interests: z.string()
    .min(2, 'Research interests are required')
    .refine(
      (val) => val.split(',').every(i => i.trim().length >= 2),
      'Each research interest must be at least 2 characters'
    )
    .refine(
      (val) => val.split(',').filter(i => i.trim().length > 0).length > 0,
      'At least one research interest is required'
    ),
  continent: z.string().min(2, 'Continent is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

type MentorRegistrationData = z.infer<typeof mentorRegistrationSchema>;

export function MentorRegistrationForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<MentorRegistrationData>({
    resolver: zodResolver(mentorRegistrationSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      current_role: '',
      institution: '',
      department: '',
      degrees: '',
      research_interests: '',
      continent: '',
      country: '',
      city: '',
      latitude: 0,
      longitude: 0,
      linkedin_url: '',
    },
  });

  async function onSubmit(data: MentorRegistrationData) {
    try {
      setError(null);
      const transformedData = {
        ...data,
        degrees: data.degrees.split(',').map(d => d.trim()).filter(d => d.length > 0),
        research_interests: data.research_interests.split(',').map(i => i.trim()).filter(i => i.length > 0),
      };
      await register(transformedData);
      router.push('/registration-success');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to register');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Academic Information</h3>
          <FormField
            control={form.control}
            name="current_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Role</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Associate Professor, Research Scientist" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your current institution" {...field} />
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
                  <Input placeholder="Enter your department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="degrees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degrees</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ph.D. in Physics, MIT, 2020 (comma-separated)" {...field} />
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
                <FormLabel>Research Interests</FormLabel>
                <FormControl>
                  <Input placeholder="Enter research interests (comma-separated)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location Information</h3>
          <LocationMap 
            latitude={form.watch('latitude')}
            longitude={form.watch('longitude')}
            onLocationSelect={(details) => {
              form.setValue('latitude', details.latitude);
              form.setValue('longitude', details.longitude);
              form.setValue('continent', details.continent);
              form.setValue('country', details.country);
              form.setValue('city', details.city);
            }}
          />
          <FormField
            control={form.control}
            name="continent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Continent</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your continent" {...field} />
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
                  <Input placeholder="Enter your country" {...field} />
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
                  <Input placeholder="Enter your city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.linkedin.com/in/your-profile" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registering...' : 'Register as Mentor'}
        </Button>
      </form>
    </Form>
  );
} 