import { buildTimelineSteps, isReadOnlyStatus, normalizeReviewStage, normalizeStatus, reviewStageIndex } from "@osass/domain/status";
import { classifyPerformance, isInadequateLevel, normalizePerformance, performanceRank } from "@osass/domain/performance";

describe("shared promotion domain", () => {
  it.each([
    ["academic-teaching", 80, 60, 50],
    ["academic-publications", 90, 70, 50],
    ["academic-service", 100, 50, 30],
    ["non-academic-work", 70, 40, 20],
    ["non-academic-knowledge", 90, 70, 50],
    ["non-academic-service", 70, 40, 20],
  ] as const)("matches backend %s total thresholds", (category, high, good, adequate) => {
    expect([high, good, adequate, adequate - 0.1].map(score => classifyPerformance(score, category))).toEqual(["High", "Good", "Adequate", "Inadequate"]);
    expect(classifyPerformance(high + 200, category)).toBe("High");
    expect(classifyPerformance(Number.NaN, category)).toBe("Inadequate");
  });
  it.each(["notgood", "Not Good", "notadequate", "veryhigh", "excellentish"])("does not classify unknown label %s", value => {
    expect(normalizePerformance(value)).toBeNull();
  });
  it.each(["Inadequate", "In Adequate", "in-adequate", "IN_ADEQUATE"])("normalizes %s below adequate", value => {
    expect(normalizePerformance(value)).toBe("Inadequate");
    expect(performanceRank(value)).toBe(0);
    expect(isInadequateLevel(value)).toBe(true);
  });

  it("preserves the known performance ordering and unscored state", () => {
    expect(["High", "Good", "Adequate", "Inadequate"].map(performanceRank)).toEqual([3, 2, 1, 0]);
    expect(normalizePerformance("Excellent")).toBe("High");
    expect(normalizePerformance("Not Started")).toBeNull();
  });

  it("normalizes API status separators and read-only decisions", () => {
    expect(normalizeStatus(" Under Review ")).toBe("under-review");
    expect(normalizeStatus("Not_Approved")).toBe("not-approved");
    expect(isReadOnlyStatus("Under Review")).toBe(true);
    expect(isReadOnlyStatus("Returned")).toBe(false);
    expect(normalizeReviewStage("AAPSC Review")).toBe("aapsc-review");
  });

  it.each([
    ["Department Review", "academic", 1],
    ["Faculty Review", "academic", 2],
    ["External Assessment", "academic", 3],
    ["Council Decision", "academic", 4],
    ["HOU Review", "non-academic", 1],
    ["AAPSC Review", "non-academic", 2],
    ["UAPC Decision", "non-academic", 3],
    ["Council Approved", "non-academic", 4],
  ] as const)("maps %s in the %s track", (stage, track, index) => {
    expect(reviewStageIndex(stage, track)).toBe(index);
    expect(buildTimelineSteps(stage, "Under Review", undefined, track)[index].status).toBe("current");
  });

  it("does not invent progress for returned or unknown review stages", () => {
    expect(reviewStageIndex("Returned For Update")).toBe(-1);
    expect(buildTimelineSteps("Unknown", "Draft").every(step => step.status === "upcoming")).toBe(true);
    expect(buildTimelineSteps("HOU Review", "Approved", undefined, "non-academic").every(step => step.status === "completed")).toBe(true);
  });
});
