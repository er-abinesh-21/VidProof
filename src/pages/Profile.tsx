import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showSuccess, showError } from "@/utils/toast";
import ProfileFormSkeleton from "@/components/ProfileFormSkeleton";

const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { session, supabase } = useAuth();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: session?.user?.email || "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
            throw error;
          }

          if (data) {
            form.reset({
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              email: session.user.email,
            });
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
          showError("Could not load your profile.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (session?.user) {
      fetchProfile();
    } else if (!session) {
      setLoading(false);
    }
  }, [session, supabase, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          first_name: values.first_name,
          last_name: values.last_name,
        })
        .select()
        .single();

      if (error) throw error;

      showSuccess("Profile updated successfully!");
      form.reset(values);
    } catch (error: any) {
      showError(`Failed to update profile: ${error.message}`);
    }
  };

  if (loading) {
    return <ProfileFormSkeleton />;
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20 shadow-neon-sm transition-all hover:shadow-neon">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Manage your account details here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="cursor-not-allowed" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;