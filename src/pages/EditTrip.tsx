import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TripForm, formSchema } from "@/components/TripForm";

const EditTrip = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("events")
          .select("title, location, date, end_date")
          .eq("id", id)
          .single();

        if (error) throw error;

        form.reset({
          title: data.title,
          location: data.location,
          startDate: new Date(data.date),
          endDate: new Date(data.end_date),
        });
      } catch (error: any) {
        showError("Failed to load trip data.");
        navigate(`/trip/${id}`);
      }
    };
    fetchTrip();
  }, [id, form, navigate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: values.title,
          location: values.location,
          date: values.startDate.toISOString(),
          end_date: values.endDate.toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      showSuccess("Trip updated successfully!");
      navigate(`/trip/${id}`);
    } catch (error: any) {
      showError(error.message || "Failed to update trip.");
    }
  }

  if (!form.formState.isDirty) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <TripForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={form.formState.isSubmitting}
            buttonText="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTrip;