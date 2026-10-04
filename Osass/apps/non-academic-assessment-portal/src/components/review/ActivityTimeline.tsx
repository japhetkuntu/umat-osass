import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import type { ApplicationReviewContext } from "@/hooks/useApplicationReview";

type Props = Pick<ApplicationReviewContext, 'commentText' | 'setCommentText' | 'commentCategory' | 'setCommentCategory' | 'commentTextId' | 'application' | 'effectiveCommittee' | 'isPending' | 'addCommentMutation'>;

export function ActivityTimeline({
  commentText,
  setCommentText,
  commentCategory,
  setCommentCategory,
  commentTextId,
  application,
  effectiveCommittee,
  isPending,
  addCommentMutation,
}: Props) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activity Timeline
        </CardTitle>
        <CardDescription className="text-xs">
          Complete history of all actions on this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {effectiveCommittee && (
          <div className="mb-4 space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
              <Label htmlFor={commentTextId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Add a comment
              </Label>
            </div>
            <Select value={commentCategory} onValueChange={setCommentCategory}>
              <SelectTrigger className="h-8 w-40 text-xs" aria-label="Comment category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overall">Overall</SelectItem>
                <SelectItem value="Performance">Performance at Work</SelectItem>
                <SelectItem value="Knowledge">Knowledge/Profession</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              id={commentTextId}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share a note visible to other committee members..."
              rows={2}
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => addCommentMutation.mutate()}
                disabled={addCommentMutation.isPending || !commentText.trim()}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        )}
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {application.activityHistory.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No activity recorded yet.
              </p>
            )}
            {application.activityHistory.map((activity, index) => (
              <div key={`${activity.activityType}-${index}`} className="flex gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  activity.activityType === "ScoreSubmitted" ? "bg-green-500" :
                  activity.activityType === "ApplicationAdvanced" ? "bg-blue-500" :
                  activity.activityType === "ApplicationReturned" ? "bg-amber-500" :
                  activity.activityType === "CommentAdded" ? "bg-purple-500" :
                  "bg-primary"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {activity.activityType.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                    {activity.committeeLevel && (
                      <Badge variant="secondary" className="text-xs">{activity.committeeLevel}</Badge>
                    )}
                  </div>
                  <p className="text-sm mt-1">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {activity.performedBy} • {formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
