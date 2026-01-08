import { format, isWeekend, addDays } from 'date-fns';

interface HolidayData {
  date: string;
  isHoliday: boolean;
  isWorkday: boolean;
  name?: string;
}

class HolidayService {
  private cache: Map<string, HolidayData> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存

  async getHolidayInfo(date: Date): Promise<HolidayData> {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (this.isCacheValid(dateStr)) {
      return this.cache.get(dateStr)!;
    }

    try {
      const info = await this.fetchHolidayInfo(date);
      this.cache.set(dateStr, info);
      this.cacheExpiry.set(dateStr, Date.now() + this.CACHE_DURATION);
      return info;
    } catch (error) {
      console.error('获取节假日信息失败:', error);
      return this.getDefaultInfo(date);
    }
  }

  private isCacheValid(dateStr: string): boolean {
    const expiry = this.cacheExpiry.get(dateStr);
    return expiry ? Date.now() < expiry : false;
  }

  private async fetchHolidayInfo(date: Date): Promise<HolidayData> {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    try {
      const response = await fetch(`https://timor.tech/api/holiday/info/${dateStr}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 0) {
        return {
          date: dateStr,
          isHoliday: data.holiday?.holiday === true,
          isWorkday: data.holiday?.work === true,
          name: data.holiday?.name
        };
      }
      
      return this.getDefaultInfo(date);
    } catch (error) {
      console.error('节假日API请求失败:', error);
      return this.getDefaultInfo(date);
    }
  }

  private getDefaultInfo(date: Date): HolidayData {
    return {
      date: format(date, 'yyyy-MM-dd'),
      isHoliday: false,
      isWorkday: false
    };
  }

  async isHoliday(date: Date): Promise<boolean> {
    const info = await this.getHolidayInfo(date);
    return info.isHoliday;
  }

  async isWorkday(date: Date): Promise<boolean> {
    const info = await this.getHolidayInfo(date);
    return info.isWorkday;
  }

  async isBusinessDay(date: Date): Promise<boolean> {
    if (isWeekend(date)) {
      const info = await this.getHolidayInfo(date);
      return info.isWorkday;
    }
    const info = await this.getHolidayInfo(date);
    return !info.isHoliday;
  }

  async addBusinessDays(startDate: Date, days: number): Promise<Date> {
    let currentDate = startDate;
    let businessDaysAdded = 0;

    while (businessDaysAdded < days) {
      currentDate = addDays(currentDate, 1);
      if (await this.isBusinessDay(currentDate)) {
        businessDaysAdded++;
      }
    }

    return currentDate;
  }

  async countBusinessDaysBetween(startDate: Date, endDate: Date): Promise<number> {
    let count = 0;
    let currentDate = startDate;

    while (currentDate < endDate) {
      currentDate = addDays(currentDate, 1);
      if (await this.isBusinessDay(currentDate)) {
        count++;
      }
    }

    return count;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const holidayService = new HolidayService();
