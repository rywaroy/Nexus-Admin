import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { describe, expect, it } from "vitest";

describe("system user list dept filter", () => {
  it("provides dept tree select in grid form schema", () => {
    const dataFile = readFileSync(
      join(process.cwd(), "apps/web-antd/src/views/system/user/data.ts"),
      "utf8",
    );
    const gridFormSection = dataFile.slice(
      dataFile.indexOf("export const useGridFormSchema"),
      dataFile.indexOf("/**\n * 用户表单 Schema"),
    );

    expect(gridFormSection).toContain('component: "TreeSelect"');
    expect(gridFormSection).toContain('fieldName: "deptId"');
    expect(gridFormSection).toContain("treeData: options.deptTree.value");
    expect(gridFormSection).toContain("treeDefaultExpandAll: true");
  });

  it("uses the grid form tree select instead of the left tree panel", () => {
    const listView = readFileSync(
      join(process.cwd(), "apps/web-antd/src/views/system/user/list.vue"),
      "utf8",
    );

    expect(listView).toContain("schema: useGridFormSchema({ deptTree })");
    expect(listView).not.toContain("Spin, Tree");
    expect(listView).not.toContain("<Tree");
    expect(listView).not.toContain('$t("system.user.deptTree")');
  });
});
