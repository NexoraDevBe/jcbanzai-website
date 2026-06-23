<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: { date: string; count: number }[];
  mode?: "week" | "maand";
}>();

const width = 240;
const height = 120;
const padding = 16;
const topMargin = 16;

function formatLabel(dateKey: string): string {
  const monthMatch = dateKey.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const d = new Date(+year, +month - 1, 1);
    return d.toLocaleDateString("en", { month: "short" });
  }
  const weekMatch = dateKey.match(/^(\d{4})-W(\d{1,2})$/);
  if (weekMatch) {
    return `W${weekMatch[2]}`;
  }
  return dateKey;
}

function getWeekKey(date: Date): string {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
  const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseKeyToDate(key: string, mode?: "week" | "maand"): Date | null {
  if (mode === "week") {
    const match = key.match(/^(\d{4})-W(\d{1,2})$/);
    if (!match) return null;
    const [, year, week] = match;
    const firstDay = new Date(+year, 0, 1);
    return new Date(firstDay.getTime() + (+week - 1) * 7 * 86400000);
  }
  const match = key.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const [, year, month] = match;
  return new Date(+year, +month - 1, 1);
}

// Fills in zero-count entries for any week/month between the first and last
// data point that has no members, so the chart keeps an empty slot for it
// instead of skipping it entirely.
const graphData = computed(() => {
  const sorted = [...props.data].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  const countByKey = new Map(sorted.map((d) => [d.date, d.count]));
  const firstDate = parseKeyToDate(sorted[0].date, props.mode);
  if (!firstDate)
    return sorted.map((d) => ({
      key: d.date,
      label: formatLabel(d.date),
      count: d.count,
    }));

  const lastKey = sorted[sorted.length - 1].date;
  const filled: { key: string; label: string; count: number }[] = [];

  let current = firstDate;
  let safety = 0;
  while (safety < 1000) {
    const key =
      props.mode === "week" ? getWeekKey(current) : getMonthKey(current);
    filled.push({
      key,
      label: formatLabel(key),
      count: countByKey.get(key) ?? 0,
    });
    if (key === lastKey) break;
    current =
      props.mode === "week"
        ? new Date(current.getTime() + 7 * 86400000)
        : new Date(current.getFullYear(), current.getMonth() + 1, 1);
    safety++;
  }

  return filled;
});

const maxCount = computed(() =>
  Math.max(...graphData.value.map((d) => d.count), 1),
);

const chartWidth = width - padding * 2;
const chartHeight = height - padding - topMargin;

const slotWidth = computed(
  () => chartWidth / Math.max(graphData.value.length, 1),
);

const barWidth = computed(() => Math.min(slotWidth.value * 0.6, 26));

const labelStep = computed(() =>
  Math.max(1, Math.ceil(graphData.value.length / 6)),
);

function barX(index: number) {
  return (
    padding + index * slotWidth.value + (slotWidth.value - barWidth.value) / 2
  );
}
function barY(count: number) {
  return height - padding - (count / maxCount.value) * chartHeight;
}
function barHeight(count: number) {
  return (count / maxCount.value) * chartHeight;
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    width="100%"
    style="overflow: visible"
  >
    <text
      v-if="graphData.length === 0"
      :x="width / 2"
      :y="height / 2"
      text-anchor="middle"
      font-size="12"
      fill="currentColor"
      opacity="0.5"
    >
      No data yet
    </text>
    <template v-else>
      <g v-for="(item, index) in graphData" :key="item.key">
        <rect
          :x="barX(index)"
          :y="item.count === 0 ? height - padding - 1 : barY(item.count)"
          :width="barWidth"
          :height="item.count === 0 ? 1 : barHeight(item.count)"
          rx="2"
          :fill="item.count === 0 ? 'currentColor' : 'var(--accent)'"
          :opacity="item.count === 0 ? 0.15 : 1"
        >
          <title>
            {{ item.label }}: {{ item.count }} nieuw{{
              item.count === 1 ? "" : "e"
            }}
            {{ item.count === 1 ? "lid" : "leden" }}
          </title>
        </rect>
        <text
          v-if="index % labelStep === 0"
          :x="barX(index) + barWidth / 2"
          :y="height - padding + 12"
          text-anchor="middle"
          font-size="9"
          fill="currentColor"
          opacity="0.7"
        >
          {{ item.label }}
        </text>
      </g>
    </template>
  </svg>
</template>
