import { describe, test } from "vitest";
import { IANAZone } from "../../src/luxon.ts";

describe("instanceof Zone works across JS realms", () => {
  test("basic", () => {
    const outerZone = IANAZone.create("Europe/Berlin");

  });
})