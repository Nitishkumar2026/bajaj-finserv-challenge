import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ArrayProcessor from "@/components/ArrayProcessor";

export default function Home() {
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
