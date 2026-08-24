import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getNewMembersCountSince } from '~/utils/supabase';

interface History {
  date: string;
}

type MonthlyCount = {
  date: string;
  count: number;
};

export const useOverviewStore = defineStore('overview', () => {
  const newMembersCount = ref<number>(0);
  const membersHistory = ref<History[]>([]);

  async function fetchNewMembersCount() {
    try {
      const count = await getNewMembersCountSince();
      newMembersCount.value = count;
    } catch (error) {
      console.error('Failed to fetch new members count:', error);
    }
  }

  async function fetchMembersHistory() {
    try {
      const data = await getMembersHistory();
      membersHistory.value = data.map(
        (item) => ({
          date: formatDate(item.created_at),
        }),
        console.log('membersHistory:', membersHistory.value),
      );
    } catch (error) {
      console.error('Failed to fetch members history:', error);
    }
  }

  function groupByMonth(members: History[]): MonthlyCount[] {
    const counts: Record<string, number> = {};
    for (const member of members) {
      const [, month, year] = member.date.split('/');
      const key = `${year}-${month}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const keys = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    if (keys.length === 0) return [];

    const [firstYear, firstMonth] = keys[0]?.split('-').map(Number) ?? [];
    const [lastYear, lastMonth] = keys[keys.length - 1]?.split('-').map(Number) ?? [];

    const result: MonthlyCount[] = [];
    let year = firstYear ?? 0;
    let month = firstMonth ?? 0;

    while (year < lastYear || (year === lastYear && month <= lastMonth)) {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      result.push({ date: key, count: counts[key] ?? 0 });

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return result;
  }

  function groupByWeek(members: History[]): MonthlyCount[] {
    const counts: Record<string, number> = {};
    for (const member of members) {
      const [day, month, year] = member.date.split('/');
      const date = new Date(+year!, +month! - 1, +day!);
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
      const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
      const key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const keys = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    if (keys.length === 0) return [];

    function parseWeekKey(key: string): Date {
      const match = key.match(/^(\d{4})-W(\d{1,2})$/)!;
      const [, year, week] = match;
      const firstDay = new Date(+year, 0, 1);
      return new Date(firstDay.getTime() + (+week - 1) * 7 * 86400000);
    }

    function getWeekKey(date: Date): string {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
      const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
      return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }

    const lastKey = keys[keys.length - 1];
    const result: MonthlyCount[] = [];

    let current = parseWeekKey(keys[0]);
    let safety = 0;

    while (safety < 1000) {
      const key = getWeekKey(current);
      result.push({ date: key, count: counts[key] ?? 0 });
      if (key === lastKey) break;
      current = new Date(current.getTime() + 7 * 86400000);
      safety++;
    }

    return result;
  }

  return {
    newMembersCount,
    membersHistory,
    fetchNewMembersCount,
    fetchMembersHistory,
    groupByMonth,
    groupByWeek,
  };
});
