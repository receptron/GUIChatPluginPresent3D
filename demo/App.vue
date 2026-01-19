<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-gray-800 mb-8">{{ pluginName }} Demo</h1>

    <!-- JSON Data Input Section -->
    <div class="bg-white rounded-lg p-5 mb-5 shadow-md">
      <h2 class="text-gray-600 text-xl mb-4">JSON Data Input</h2>
      <div v-if="samples.length > 0" class="flex flex-wrap gap-2 mb-3">
        <button
          v-for="(sample, index) in samples"
          :key="index"
          @click="loadSample(sample)"
          class="py-2 px-4 bg-indigo-100 border border-indigo-200 rounded-md cursor-pointer text-sm text-indigo-700 transition-all hover:bg-indigo-200 hover:border-indigo-300"
        >
          {{ sample.name }}
        </button>
      </div>
      <textarea
        v-model="jsonInput"
        class="w-full p-3 font-mono text-sm border border-gray-300 rounded-md resize-y bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10"
        placeholder="Enter JSON data here..."
        rows="10"
      ></textarea>
      <div class="mt-3 flex items-center gap-3">
        <button
          @click="applyJson"
          class="py-2.5 px-6 bg-indigo-600 text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors hover:bg-indigo-700"
        >
          Apply JSON
        </button>
        <span v-if="jsonError" class="text-red-600 text-sm">{{ jsonError }}</span>
      </div>
    </div>

    <!-- View Component -->
    <div v-if="ViewComponent" class="bg-white rounded-lg p-5 mb-5 shadow-md">
      <h2 class="text-gray-600 text-xl mb-4">View Component</h2>
      <div class="border border-gray-200 rounded p-4">
        <component
          :is="ViewComponent"
          :selectedResult="result"
          :sendTextMessage="handleSendTextMessage"
          @updateResult="handleUpdate"
        />
      </div>
      <div v-if="lastSentMessage" class="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
        <strong class="text-emerald-800 block mb-2">Sent Message:</strong>
        <pre class="bg-emerald-100 m-0 whitespace-pre-wrap">{{ lastSentMessage }}</pre>
      </div>
    </div>

    <!-- Preview Component -->
    <div v-if="PreviewComponent" class="bg-white rounded-lg p-5 mb-5 shadow-md">
      <h2 class="text-gray-600 text-xl mb-4">Preview Component</h2>
      <div class="max-w-[200px]">
        <component :is="PreviewComponent" :result="result" />
      </div>
    </div>

    <!-- Current Result Data -->
    <div class="bg-white rounded-lg p-5 mb-5 shadow-md">
      <h2 class="text-gray-600 text-xl mb-4">Current Result Data</h2>
      <pre class="bg-gray-100 p-3 rounded overflow-x-auto text-xs">{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { plugin } from "../src/vue";
import type { ToolResult, ToolSample, ToolPlugin } from "gui-chat-protocol/vue";

// Plugin configuration - cast to base ToolPlugin for generic demo usage
const currentPlugin = plugin as unknown as ToolPlugin;

// Computed properties from plugin
const pluginName = computed(() => currentPlugin.toolDefinition.name);
const toolName = computed(() => currentPlugin.toolDefinition.name);
const samples = computed(() => currentPlugin.samples || []);
const ViewComponent = computed(() => currentPlugin.viewComponent);
const PreviewComponent = computed(() => currentPlugin.previewComponent);

// State
const jsonInput = ref("");
const jsonError = ref("");
const lastSentMessage = ref("");

const result = ref<ToolResult>({
  toolName: toolName.value,
  message: "Ready",
  title: "",
  jsonData: undefined,
});

// Actions
const loadSample = (sample: ToolSample) => {
  jsonInput.value = JSON.stringify(sample.args, null, 2);
  jsonError.value = "";
  applyJson();
};

const applyJson = () => {
  try {
    const data = JSON.parse(jsonInput.value);
    result.value = {
      toolName: toolName.value,
      message: "Data applied",
      title: data.title || "",
      jsonData: data,
    };
    jsonError.value = "";
    lastSentMessage.value = "";
  } catch (e) {
    jsonError.value = e instanceof Error ? e.message : "Invalid JSON";
  }
};

const handleSendTextMessage = (text?: string) => {
  lastSentMessage.value = text || "";
  console.log("sendTextMessage called:", text);
};

const handleUpdate = (updated: ToolResult) => {
  result.value = updated;
  console.log("Result updated:", updated);
};

// Load first sample on mount
onMounted(() => {
  if (samples.value.length > 0) {
    loadSample(samples.value[0]);
  }
});
</script>
