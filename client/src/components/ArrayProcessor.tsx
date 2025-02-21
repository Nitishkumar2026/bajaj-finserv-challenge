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

type FormData = {
  input: string;
};

export default function ArrayProcessor() {
  const { toast } = useToast();
  const [response, setResponse] = useState<ArrayResponse | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      input: '{ "data": ["M","1","334","4","B"] }',
    },
  });

  const processMutation = useMutation({
    mutationFn: async (data: { data: string[] }) => {
      const res = await apiRequest("POST", "/bfhl", data);
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
      const parsedInput = JSON.parse(formData.input);
      const { success } = arrayInputSchema.safeParse(parsedInput);

      if (!success) {
        toast({
          title: "Error",
          description: 'Invalid JSON format. Expected format: { "data": ["M","1","334","4","B"] }',
          variant: "destructive",
        });
        return;
      }

      processMutation.mutate(parsedInput);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  const getFilteredResponse = () => {
    if (!response) return null;

    const filteredData: Record<string, any> = {};

    if (selectedFilters.includes("numbers")) {
      filteredData.numbers = response.numbers;
    }
    if (selectedFilters.includes("alphabets")) {
      filteredData.alphabets = response.alphabets;
    }
    if (selectedFilters.includes("highest")) {
      filteredData.highest_alphabet = response.highest_alphabet;
    }

    return filteredData;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder='{ "data": ["M","1","334","4","B"] }'
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
            Submit
          </Button>
        </form>
      </Form>

      {response && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedFilters.includes("numbers") ? "default" : "outline"}
              onClick={() => setSelectedFilters(prev => 
                prev.includes("numbers") 
                  ? prev.filter(f => f !== "numbers")
                  : [...prev, "numbers"]
              )}
            >
              Numbers
            </Button>
            <Button
              variant={selectedFilters.includes("alphabets") ? "default" : "outline"}
              onClick={() => setSelectedFilters(prev => 
                prev.includes("alphabets") 
                  ? prev.filter(f => f !== "alphabets")
                  : [...prev, "alphabets"]
              )}
            >
              Alphabets
            </Button>
            <Button
              variant={selectedFilters.includes("highest") ? "default" : "outline"}
              onClick={() => setSelectedFilters(prev => 
                prev.includes("highest") 
                  ? prev.filter(f => f !== "highest")
                  : [...prev, "highest"]
              )}
            >
              Highest Alphabet
            </Button>
          </div>

          {selectedFilters.length > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <div className="font-medium mb-2">Filtered Response</div>
              {Object.entries(getFilteredResponse() || {}).map(([key, value]) => (
                <div key={key} className="mb-1">
                  {key}: {Array.isArray(value) ? value.join(", ") : value}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}