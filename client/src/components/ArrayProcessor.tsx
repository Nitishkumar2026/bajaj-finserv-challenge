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
  input: string;
};

export default function ArrayProcessor() {
  const { toast } = useToast();
  const [response, setResponse] = useState<ArrayResponse | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      input: '{ "data": ["1","2","a","b"] }',
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
          description: "Invalid JSON format. Expected format: { \"data\": [\"1\",\"2\",\"a\",\"b\"] }",
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

    const filteredResponse: Partial<ArrayResponse> = {
      is_success: response.is_success,
      user_id: response.user_id,
      email: response.email,
      roll_number: response.roll_number,
    };

    if (selectedFilters.includes("numbers")) {
      filteredResponse.numbers = response.numbers;
    }
    if (selectedFilters.includes("alphabets")) {
      filteredResponse.alphabets = response.alphabets;
    }
    if (selectedFilters.includes("highest")) {
      filteredResponse.highest_alphabet = response.highest_alphabet;
    }

    return filteredResponse;
  };

  const toggleFilter = (value: string) => {
    setSelectedFilters(prev => 
      prev.includes(value) 
        ? prev.filter(f => f !== value)
        : [...prev, value]
    );
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
                    placeholder='{ "data": ["1","2","a","b"] }'
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
            Process Array
          </Button>
        </form>
      </Form>

      {response && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedFilters.includes("numbers") ? "default" : "outline"}
              onClick={() => toggleFilter("numbers")}
            >
              Numbers
            </Button>
            <Button
              variant={selectedFilters.includes("alphabets") ? "default" : "outline"}
              onClick={() => toggleFilter("alphabets")}
            >
              Alphabets
            </Button>
            <Button
              variant={selectedFilters.includes("highest") ? "default" : "outline"}
              onClick={() => toggleFilter("highest")}
            >
              Highest Alphabet
            </Button>
          </div>

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