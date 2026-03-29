import { describe, expect, it } from "vitest";
import { rewriteXDefaultAlternateLinkHeader } from "./alternate-links";

describe("rewriteXDefaultAlternateLinkHeader", () => {
  it("rewrites root x-default to the default locale path", () => {
    const header = [
      '<https://cryptorebate.app/en>; rel="alternate"; hreflang="en"',
      '<https://cryptorebate.app/zh>; rel="alternate"; hreflang="zh"',
      '<https://cryptorebate.app/>; rel="alternate"; hreflang="x-default"',
    ].join(", ");

    expect(rewriteXDefaultAlternateLinkHeader(header, "en")).toContain(
      '<https://cryptorebate.app/en>; rel="alternate"; hreflang="x-default"'
    );
  });

  it("rewrites nested x-default paths to the default locale namespace", () => {
    const header = [
      '<https://cryptorebate.app/en/about>; rel="alternate"; hreflang="en"',
      '<https://cryptorebate.app/zh/about>; rel="alternate"; hreflang="zh"',
      '<https://cryptorebate.app/about>; rel="alternate"; hreflang="x-default"',
    ].join(", ");

    expect(rewriteXDefaultAlternateLinkHeader(header, "en")).toContain(
      '<https://cryptorebate.app/en/about>; rel="alternate"; hreflang="x-default"'
    );
  });

  it("leaves unrelated alternate entries untouched", () => {
    const header = [
      '<https://cryptorebate.app/en/exchanges>; rel="alternate"; hreflang="en"',
      '<https://cryptorebate.app/zh/exchanges>; rel="alternate"; hreflang="zh"',
    ].join(", ");

    expect(rewriteXDefaultAlternateLinkHeader(header, "en")).toBe(header);
  });
});
