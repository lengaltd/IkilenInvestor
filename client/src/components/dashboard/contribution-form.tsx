import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const contributionFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  paymentMethod: z.string({
    required_error: "Please select a payment method",
  }),
  note: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionFormSchema>;

export function ContributionForm() {
  const { toast } = useToast();

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "Bank Transfer",
      note: "",
    },
  });

  const contributionMutation = useMutation({
    mutationFn: async (values: ContributionFormValues) => {
      return apiRequest("POST", "/api/transactions", {
        amount: parseFloat(values.amount),
        type: "contribution",
        paymentMethod: values.paymentMethod,
        note: values.note || "Monthly Contribution",
      });
    },
    onSuccess: () => {
      toast({
        title: "Contribution submitted",
        description: "Your contribution has been recorded successfully.",
      });
      form.reset();
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description:
          "There was an error submitting your contribution. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ContributionFormValues) {
    contributionMutation.mutate(values);
  }

  return (
    <Card id="contribute-section">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg">Make a Contribution</CardTitle>
        <CardDescription>Submit your investment contribution</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <Input
                            placeholder="0.00"
                            className="pl-7 pr-12"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              USD
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="Credit Card">
                            Credit Card
                          </SelectItem>
                          <SelectItem value="Mobile Money">
                            Mobile Money
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={contributionMutation.isPending}>
                {contributionMutation.isPending
                  ? "Submitting..."
                  : "Submit Contribution"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
