import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    name: "TiptapExample",
    path: "/examples/tiptap",
    component: () => import("#/views/examples/tiptap/index.vue"),
    meta: { icon: "lucide:text-cursor-input", title: "富文本编辑器", order: 1000 },
  },
];

export default routes;
