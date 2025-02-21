import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ArrayProcessor from "@/components/ArrayProcessor";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Set document title to roll number
    document.title = "ABCD123";
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              ABCD123 - Array Processing Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ArrayProcessor />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}