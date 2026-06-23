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
    try {
      const count = await getNewMembersCountSince();
      console.log(count);
      newMembersCount.value = count;
    } catch (error) {
      console.error("Failed to fetch new members count:", error);
    }
  }

  return {
    newMembersCount,
    fetchNewMembersCount,
  };
});
