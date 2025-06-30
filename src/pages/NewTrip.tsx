import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";
import { TripForm, formSchema } from "@/components/TripForm";

const NewTrip = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase.from("events").insert([
        {
          title: values.title,
          location: values.location,
          date: values.startDate.toISOString(),
          end_date: values.endDate.toISOString(),
        },
      ]);

      if (error) throw error;

      showSuccess("Trip created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      showError(error.message || "Failed to create trip.");
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <TripForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={form.formState.isSubmitting}
            buttonText="Create Trip"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTrip;