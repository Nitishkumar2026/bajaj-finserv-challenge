import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          description: "Expected array, received string",
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

  return (
    <div className="space-y-6">
      {/* API Input Section */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">API Input</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={processMutation.isPending}
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>

      {response && (
        <>
          {/* Multi Filter Section */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Multi Filter</div>
            <Select
              value={selectedFilters.join(",")}
              onValueChange={(value) => {
                setSelectedFilters(value === "" ? [] : value.split(","));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select options..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numbers">Numbers</SelectItem>
                <SelectItem value="alphabets">Alphabets</SelectItem>
                <SelectItem value="highest">Highest Alphabet</SelectItem>
                <SelectItem value="numbers,highest">Numbers & Highest Alphabet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtered Response Section */}
          {selectedFilters.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Filtered Response</div>
              <div className="space-y-1">
                {selectedFilters.includes("numbers") && (
                  <div>Numbers: {response.numbers.join(",")}</div>
                )}
                {selectedFilters.includes("alphabets") && (
                  <div>Alphabets: {response.alphabets.join(",")}</div>
                )}
                {selectedFilters.includes("highest") && (
                  <div>Highest Alphabet: {response.highest_alphabet}</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}