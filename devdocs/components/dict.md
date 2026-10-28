# 字典缓存与业务选项

应用使用上游 `useDictStore`，由 [dict-init.ts](../../apps/web-antd/src/dict-init.ts) 注册 Nexus 读取接口。登录并完成权限路由生成后后台预加载全部启用字典。版本号由后端字典类型、字典数据的数量和更新时间生成；刷新页面后版本一致时复用本地缓存。登出通过 resetAllStores 清空字典状态。

## 使用

- `await store.getDict(code)`：读取下拉选项，同编码请求合并并缓存。
- `store.getDictSync(code)`：响应式读取，用于函数式 componentProps 或 computed；缓存未命中时触发加载。
- `store.getDictLabel(code, value)`：值转标签。
- `CellDict`：表格列使用 `props: { code }`，有颜色时展示 Tag。

见参与类型检查的 [表单和表格示例](../../apps/web-antd/src/documentation/dict.vue)。先在字典管理创建业务所用的类型和字典项。Nexus 字典键值保持字符串，例如 `01`；业务接口要求数值时，在提交映射中明确转换。用户状态等既有固定枚举继续使用原有值类型。

## 接口与权限

| 接口 | 行为 |
| --- | --- |
| `GET /system/dict/options` | 登录用户读取全部启用类型及其启用字典项 |
| `GET /system/dict/options/data/:dictType` | 登录用户按类型读取选项 |
| `GET /system/dict/options/version` | 登录用户读取版本号 |
| 原 `/system/dict/type/*`、`/system/dict/data/*` | 保留管理权限及完整数据 |
| `DELETE /system/dict/cache` | 要求 system:dict:update，刷新服务端管理缓存 |

业务选项返回 `{ label, value, color }`。前端将 primary、danger、info 分别映射为 Ant Design Tag 的 processing、error、default，映射见 [读取 API](../../apps/web-antd/src/api/core/dict.ts)。

## 更新

[管理 API](../../apps/web-antd/src/api/system/dict.ts) 在创建、修改、删除成功后清空前端字典缓存与版本，后续业务读取重新请求。清空全部缓存同时处理字典类型重命名和正在进行的预加载。管理列表仍直接读取完整数据，以便维护停用项。

管理页“刷新缓存”同时清理服务端缓存并重新加载前端选项。其他已打开会话在刷新页面后通过版本校验获取更新。
