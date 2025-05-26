
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Investment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Plus } from "lucide-react";

const investmentSchema = z.object({
  name: z.string().min(1, "Investment name is required"),
  description: z.string().optional(),
  totalAmount: z
    .string()
    .min(1, "Total amount is required")
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  returnRate: z
    .string()
    .min(1, "Return rate is required")
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number")
    .refine((val) => parseFloat(val) >= 0 && parseFloat(val) <= 100, "Return rate must be between 0 and 100"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

type InvestmentFormValues = z.infer<typeof investmentSchema>;

export default function Investments() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: investments, isLoading, error } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: "",
      description: "",
      totalAmount: "",
      returnRate: "",
      startDate: "",
      endDate: "",
    },
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (values: InvestmentFormValues) => {
      return apiRequest("POST", "/api/investments", {
        name: values.name,
        description: values.description || "",
        totalAmount: parseFloat(values.totalAmount),
        returnRate: parseFloat(values.returnRate),
        startDate: new Date(values.startDate),
        endDate: values.endDate ? new Date(values.endDate) : null,
        active: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Investment created",
        description: "Your investment has been added successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error?.message || "There was an error creating the investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: InvestmentFormValues) {
    createInvestmentMutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-5 sm:px-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="px-4 sm:px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !investments) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800">Error loading investments</h2>
            <p className="mt-2 text-red-700">
              {error instanceof Error ? error.message : "Could not load investment data. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Investments</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and manage the group's investments
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
              <DialogDescription>
                Create a new investment opportunity for the group.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Real Estate Fund" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the investment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="7.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInvestmentMutation.isPending}>
                    {createInvestmentMutation.isPending ? "Creating..." : "Create Investment"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {investments.length === 0 ? (
        <div className="px-4 sm:px-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No investments found</p>
              <p className="text-sm text-gray-400 mt-2">Click "Add Investment" to create the first one</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="px-4 sm:px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <Card key={investment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{investment.name}</CardTitle>
                  <Badge variant={investment.active ? "default" : "outline"}>
                    {investment.active ? "Active" : "Closed"}
                  </Badge>
                </div>
                <CardDescription>{investment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Amount:</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(investment.totalAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Return Rate:</dt>
                    <dd className="text-sm font-medium text-green-600">{investment.returnRate}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Start Date:</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatDate(new Date(investment.startDate))}</dd>
                  </div>
                  {investment.endDate && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">End Date:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(new Date(investment.endDate))}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="w-full text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Projected Annual Return:</span>
                    <span className="font-medium text-green-600">{formatCurrency(investment.totalAmount * (investment.returnRate / 100))}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
