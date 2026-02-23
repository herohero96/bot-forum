import { describe, it, expect } from "vitest";
import { PRESET_TOPICS, getRandomTopic, type Topic } from "@/lib/topics";

describe("PRESET_TOPICS", () => {
  it("should have at least 10 topics", () => {
    expect(PRESET_TOPICS.length).toBeGreaterThanOrEqual(10);
  });

  it("each topic should have required fields", () => {
    for (const topic of PRESET_TOPICS) {
      expect(topic.id).toBeDefined();
      expect(typeof topic.id).toBe("string");
      expect(topic.title).toBeDefined();
      expect(typeof topic.title).toBe("string");
      expect(topic.description).toBeDefined();
      expect(typeof topic.description).toBe("string");
      expect(topic.keywords).toBeDefined();
      expect(Array.isArray(topic.keywords)).toBe(true);
      expect(topic.keywords.length).toBeGreaterThan(0);
    }
  });

  it("all topic ids should be unique", () => {
    const ids = PRESET_TOPICS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getRandomTopic", () => {
  it("should return a topic (never undefined)", () => {
    const topic = getRandomTopic();
    expect(topic).toBeDefined();
    expect(topic).not.toBeNull();
  });

  it("should return a valid topic from PRESET_TOPICS", () => {
    const topic = getRandomTopic();
    expect(PRESET_TOPICS).toContain(topic);
  });

  it("should return a topic with all required fields", () => {
    const topic: Topic = getRandomTopic();
    expect(typeof topic.id).toBe("string");
    expect(typeof topic.title).toBe("string");
    expect(typeof topic.description).toBe("string");
    expect(Array.isArray(topic.keywords)).toBe(true);
  });

  it("should return different topics over multiple calls (probabilistic)", () => {
    // With 12 topics, the chance of getting the same one 20 times in a row is negligible
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(getRandomTopic().id);
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
