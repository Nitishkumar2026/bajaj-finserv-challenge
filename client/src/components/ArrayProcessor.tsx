import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { arrayInputSchema, type ArrayResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  data: string;
};

export default function ArrayProcessor() {
  const { toast } = useToast();
  const [response, setResponse] = useState<ArrayResponse | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const form = useForm<FormData>({
    resolver: zodResolver(
      arrayInputSchema.transform((data) => ({
        data: JSON.stringify(data.data),
      }))
    ),
  });

  const processMutation = useMutation({
    mutationFn: async (data: string[]) => {
      const res = await apiRequest("POST", "/api/bfhl", { data });
      return res.json();
    },
    onSuccess: (data: ArrayResponse) => {
      setResponse(data);
      toast({
        title: "Success",
        description: "Array processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (formData: FormData) => {
    try {
      const array = JSON.parse(formData.data);
      if (!Array.isArray(array)) {
        throw new Error("Input must be an array");
      }
      processMutation.mutate(array);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON array format",
        variant: "destructive",
      });
    }
  };

  const getFilteredResponse = () => {
    if (!response) return null;

    switch (filter) {
      case "numbers":
        return { numbers: response.numbers };
      case "alphabets":
        return { alphabets: response.alphabets };
      case "highest":
        return { highest_alphabet: response.highest_alphabet };
      default:
        return response;
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder='Enter JSON array (e.g. ["1","2","a","b"])'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={processMutation.isPending}
          >
            {processMutation.isPending ? "Processing..." : "Process Array"}
          </Button>
        </form>
      </Form>

      {response && (
        <div className="space-y-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="numbers">Numbers</SelectItem>
              <SelectItem value="alphabets">Alphabets</SelectItem>
              <SelectItem value="highest">Highest Alphabet</SelectItem>
            </SelectContent>
          </Select>

          <div className="rounded-lg bg-muted p-4">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(getFilteredResponse(), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
