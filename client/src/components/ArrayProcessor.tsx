import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { arrayInputSchema, type ArrayResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FormData = {
  input: string;
};

export default function ArrayProcessor() {
  const { toast } = useToast();
  const [response, setResponse] = useState<ArrayResponse | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

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

  const toggleFilter = (value: string) => {
    setSelectedFilters(prev => 
      prev.includes(value) 
        ? prev.filter(f => f !== value)
        : [...prev, value]
    );
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedFilters.length > 0 
                    ? `${selectedFilters.length} selected`
                    : "Select options..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandGroup>
                    <CommandItem onSelect={() => toggleFilter("numbers")}>
                      <div className="flex items-center">
                        <span>Numbers</span>
                        {selectedFilters.includes("numbers") && (
                          <span className="ml-auto">✓</span>
                        )}
                      </div>
                    </CommandItem>
                    <CommandItem onSelect={() => toggleFilter("alphabets")}>
                      <div className="flex items-center">
                        <span>Alphabets</span>
                        {selectedFilters.includes("alphabets") && (
                          <span className="ml-auto">✓</span>
                        )}
                      </div>
                    </CommandItem>
                    <CommandItem onSelect={() => toggleFilter("highest")}>
                      <div className="flex items-center">
                        <span>Highest Alphabet</span>
                        {selectedFilters.includes("highest") && (
                          <span className="ml-auto">✓</span>
                        )}
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Filters */}
            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFilters.map(filter => (
                  <div
                    key={filter}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    <span className="capitalize">
                      {filter === "highest" ? "Highest Alphabet" : filter}
                    </span>
                    <button
                      onClick={() => toggleFilter(filter)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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