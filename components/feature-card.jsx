import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function FeatureCard({ title = "", description = "" }) {
  return (
    <Card className="group relative overflow-hidden transition-colors hover:border-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}
