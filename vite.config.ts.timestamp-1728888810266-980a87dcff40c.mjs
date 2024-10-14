// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///home/project_workspace/fjcpc-transfer-qb-v3/node_modules/vite/dist/node/index.js";
import vue from "file:///home/project_workspace/fjcpc-transfer-qb-v3/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///home/project_workspace/fjcpc-transfer-qb-v3/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import VueDevTools from "file:///home/project_workspace/fjcpc-transfer-qb-v3/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///home/project_workspace/fjcpc-transfer-qb-v3/vite.config.ts";
var vite_config_default = defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  plugins: [vue(), vueJsx(), VueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0X3dvcmtzcGFjZS9mamNwYy10cmFuc2Zlci1xYi12M1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdF93b3Jrc3BhY2UvZmpjcGMtdHJhbnNmZXItcWItdjMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdF93b3Jrc3BhY2UvZmpjcGMtdHJhbnNmZXItcWItdjMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAgICcvYXBpJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFt2dWUoKSwgdnVlSnN4KCksIFZ1ZURldlRvb2xzKCldLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICAgIH1cbiAgICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVCxTQUFTLGVBQWUsV0FBVztBQUV6VixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8saUJBQWlCO0FBTHdLLElBQU0sMkNBQTJDO0FBT2pQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFFBQVE7QUFBQSxJQUNKLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNsQjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUN4QyxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
