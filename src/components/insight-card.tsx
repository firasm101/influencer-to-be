"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Clock,
  MessageSquare,
  BarChart3,
  Lightbulb,
} from "lucide-react";

interface InsightCardProps {
  insight: {
    id: string;
    insightType: string;
    insightText: string;
    dataPoints: number;
    generatedAt: string;
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  format: <BarChart3 className="h-5 w-5" />,
  timing: <Clock className="h-5 w-5" />,
  hook: <MessageSquare className="h-5 w-5" />,
  topic: <Lightbulb className="h-5 w-5" />,
  engagement: <TrendingUp className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
  format: "text-blue-600 dark:text-blue-400",
  timing: "text-amber-600 dark:text-amber-400",
  hook: "text-purple-600 dark:text-purple-400",
  topic: "text-green-600 dark:text-green-400",
  engagement: "text-red-600 dark:text-red-400",
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={`mt-0.5 ${typeColors[insight.insightType] || "text-primary"}`}
        >
          {typeIcons[insight.insightType] || <Lightbulb className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{insight.insightText}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {insight.insightType}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Based on {insight.dataPoints} data points
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
