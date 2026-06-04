import { defineStore } from "pinia";
import { ref } from "vue";
import { getNewMembersCountSince } from "~/utils/supabase";
import {
  saveToSessionStorage,
  loadFromSessionStorage,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "~/utils/storage";

export const useOverviewStore = defineStore("overview", () => {
  const newMembersCount = ref<number>(0);

  async function fetchNewMembersCount() {
    let lastFetchAt =
      loadFromSessionStorage("lastFetchAt") ??
      loadFromLocalStorage("lastFetchAt");

    // First-ever visit
    if (!lastFetchAt) {
      lastFetchAt = new Date().toISOString();
    }

    try {
      const count = await getNewMembersCountSince(lastFetchAt);

      newMembersCount.value = count;

      // Only update after successful fetch
      const currentFetchAt = new Date().toISOString();

      saveToSessionStorage("lastFetchAt", currentFetchAt);
      saveToLocalStorage("lastFetchAt", currentFetchAt);
    } catch (error) {
      console.error("Failed to fetch new members count:", error);
    }
  }

  return {
    newMembersCount,
    fetchNewMembersCount,
  };
});
