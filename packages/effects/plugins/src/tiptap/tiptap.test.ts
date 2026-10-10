import type { VueWrapper } from "@vue/test-utils";

import { flushPromises, mount } from "@vue/test-utils";

import { EditorContent } from "@tiptap/vue-3";
import { afterEach, describe, expect, it } from "vitest";

import Tiptap from "./tiptap.vue";

const wrappers: VueWrapper[] = [];
const mountEditor = async (content: string) => {
  const wrapper = mount(Tiptap, {
    props: { modelValue: content, previewable: false },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  await flushPromises();
  return wrapper;
};

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.innerHTML = "";
});

describe("VbenTiptap component", () => {
  it.each(["img", "video"])(
    "applies the entered width and height to a selected %s and updates v-model",
    async (tag) => {
      const wrapper = await mountEditor(
        `<${tag} src="https://example.com/media" width="320" height="180"></${tag}>`,
      );
      const editor = wrapper.findComponent(EditorContent).props("editor")!;
      editor.commands.setNodeSelection(0);
      await flushPromises();
      const inputs = wrapper.findAll('input[type="number"]');
      expect(inputs).toHaveLength(2);
      await inputs[0]!.setValue("240");
      await inputs[1]!.setValue("240");
      const apply = wrapper
        .findAll("button")
        .find((button) => button.element.parentElement?.querySelector('input[type="number"]'))!;
      await apply.trigger("click");
      const html = wrapper.emitted<[string]>("update:modelValue")!.at(-1)![0];
      expect(html).toContain('width="240"');
      expect(html).toContain('height="240"');
      expect((wrapper.element as HTMLElement).querySelector<HTMLElement>(tag)!.style.height).toBe(
        "240px",
      );
      expect(wrapper.findAll("form")).toHaveLength(0);
    },
  );

  it("replaces the content when its parent updates v-model", async () => {
    const wrapper = await mountEditor("<p>Initial content</p>");
    await wrapper.setProps({ modelValue: "<p>Loaded content</p>" });
    expect(wrapper.find(".tiptap").text()).toBe("Loaded content");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("hides the sizing controls and disables editing when editable becomes false", async () => {
    const wrapper = await mountEditor('<video src="https://example.com/video.mp4"></video>');
    wrapper.findComponent(EditorContent).props("editor")!.commands.setNodeSelection(0);
    await flushPromises();
    expect(wrapper.findAll('input[type="number"]')).toHaveLength(2);
    await wrapper.setProps({ editable: false });
    expect(wrapper.findAll('input[type="number"]')).toHaveLength(0);
    expect(wrapper.find(".tiptap").attributes("contenteditable")).toBe("false");
  });
});
