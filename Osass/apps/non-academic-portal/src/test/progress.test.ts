import { buildTimelineSteps } from "@/lib/status";

describe("non-academic review timeline", () => {
  it.each(["HOU Review", "AAPSC Review", "UAPC Decision"])("matches the %s API stage", stage => {
    const timeline = buildTimelineSteps(stage, "Under Review");
    expect(timeline.find(step => step.id === stage)?.status).toBe("current");
    expect(timeline.filter(step => step.status === "current")).toHaveLength(1);
  });

  it("completes the timeline for an approved application", () => {
    expect(buildTimelineSteps("Council Approved", "Approved").every(step => step.status === "completed")).toBe(true);
  });
});
