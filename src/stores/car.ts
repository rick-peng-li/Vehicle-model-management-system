import { defineStore } from 'pinia'
import axios from 'axios'
import PinyinMatch from 'pinyin-match'
import { useAuthStore } from './auth'

export const useCarStore = defineStore('car', {
  state: () => ({
    cars: [] as any[],
    total: 0,
    loading: false,
    searchHistory: JSON.parse(localStorage.getItem('carSearchHistory') || '[]') as string[],
    brands: [] as string[],
    series: [] as string[],
    years: [] as string[]
  }),
  actions: {
    addToHistory(keyword: string) {
      if (!keyword) return
      const index = this.searchHistory.indexOf(keyword)
      if (index > -1) {
        this.searchHistory.splice(index, 1)
      }
      this.searchHistory.unshift(keyword)
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop()
      }
      localStorage.setItem('carSearchHistory', JSON.stringify(this.searchHistory))
    },
    clearHistory() {
      this.searchHistory = []
      localStorage.removeItem('carSearchHistory')
    },
    async fetchBrands() {
      try {
        const response = await axios.get('/api/car-brands')
        if (response.data && Array.isArray(response.data.data)) {
          this.brands = response.data.data
        } else {
          this.brands = []
        }
      } catch (error) {
        console.error(error)
        this.brands = []
      }
    },
    async addBrand(name: string) {
      await axios.post('/api/car-brands', { name })
      await this.fetchBrands()
    },
    async updateBrand(oldName: string, newName: string) {
      await axios.put('/api/car-brands', { oldName, newName })
      await this.fetchBrands()
    },
    async deleteBrand(name: string) {
      await axios.delete('/api/car-brands', { data: { name } })
      await this.fetchBrands()
    },

    async fetchSeries() {
      try {
        const response = await axios.get('/api/car-series')
        if (response.data && Array.isArray(response.data.data)) {
          this.series = response.data.data
        } else {
          this.series = []
        }
      } catch (error) {
        console.error(error)
        this.series = []
      }
    },
    async addSeries(name: string) {
      await axios.post('/api/car-series', { name })
      await this.fetchSeries()
    },
    async updateSeries(oldName: string, newName: string) {
      await axios.put('/api/car-series', { oldName, newName })
      await this.fetchSeries()
    },
    async deleteSeries(name: string) {
      await axios.delete('/api/car-series', { data: { name } })
      await this.fetchSeries()
    },

    async fetchYears() {
      try {
        const response = await axios.get('/api/car-years')
        if (response.data && Array.isArray(response.data.data)) {
          this.years = response.data.data
        } else {
          this.years = []
        }
      } catch (error) {
        console.error(error)
        this.years = []
      }
    },
    async addYear(name: string) {
      await axios.post('/api/car-years', { name })
      await this.fetchYears()
    },
    async deleteYear(name: string) {
      await axios.delete('/api/car-years', { data: { name } })
      await this.fetchYears()
    },

    async fetchCars(params: any) {
      this.loading = true
      try {
        const response = await axios.get('/api/cars', { params })
        let data = response.data.data
        
        // Data Isolation: Filter by department
        const authStore = useAuthStore()
        if (authStore.user && authStore.user.role !== 'super_admin') {
          data = data.filter((p: any) => p.department === authStore.user.department)
        }

        if (params.search) {
          data = data.filter((p: any) => 
            PinyinMatch.match(p.brand, params.search) || 
            PinyinMatch.match(p.model, params.search) ||
            PinyinMatch.match(p.year, params.search) ||
            PinyinMatch.match(p.id.toString(), params.search)
          )
        }

        this.total = data.length
        
        const start = (params.page - 1) * params.itemsPerPage
        const end = start + params.itemsPerPage
        const pageItems = data.slice(start, end)
        
        if (params.append) {
            if (params.page === 1) {
                this.cars = pageItems
            } else {
                this.cars = [...this.cars, ...pageItems]
            }
        } else {
            this.cars = pageItems
        }
        
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async addCar(car: any) {
      this.loading = true
      try {
        await axios.post('/api/cars', car)
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async updateCar(car: any) {
      this.loading = true
      try {
        await axios.put('/api/cars', car)
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deleteCar(id: number) {
      this.loading = true
      try {
        await axios.delete('/api/cars', { data: { id } })
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    addSearchHistory(keyword: string) {
      if (!this.searchHistory.includes(keyword)) {
        this.searchHistory.unshift(keyword)
        if (this.searchHistory.length > 5) this.searchHistory.pop()
      }
    }
  }
})
