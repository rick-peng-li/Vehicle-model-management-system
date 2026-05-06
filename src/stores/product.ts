import { defineStore } from 'pinia'
import axios from 'axios'
import PinyinMatch from 'pinyin-match'
import { useAuthStore } from './auth'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as any[],
    total: 0,
    categories: [] as any[],
    loading: false,
    searchHistory: JSON.parse(localStorage.getItem('productSearchHistory') || '[]') as string[],
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
      localStorage.setItem('productSearchHistory', JSON.stringify(this.searchHistory))
    },
    clearHistory() {
      this.searchHistory = []
      localStorage.removeItem('productSearchHistory')
    },
    async fetchCategories() {
      try {
        const response = await axios.get('/api/categories')
        this.categories = response.data.data
      } catch (error) {
        console.error(error)
      }
    },
    async addCategory(name: string, parentId?: number) {
      try {
        await axios.post('/api/categories', { name, parentId })
        await this.fetchCategories()
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    async updateCategory(id: number, name: string) {
      try {
        await axios.put('/api/categories', { id, name })
        await this.fetchCategories()
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    async deleteCategory(id: number) {
      try {
        await axios.delete('/api/categories', { data: { id } })
        await this.fetchCategories()
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    async fetchProducts(params: any) {
      this.loading = true
      try {
        const response = await axios.get('/api/products', { params })
        let data = response.data.data
        
        // Data Isolation: Filter by department
        const authStore = useAuthStore()
        if (authStore.user && authStore.user.role !== 'super_admin') {
          data = data.filter((p: any) => p.department === authStore.user.department)
        }

        if (params.search) {
          data = data.filter((p: any) => 
            PinyinMatch.match(p.name, params.search) || 
            PinyinMatch.match(p.id.toString(), params.search) ||
            PinyinMatch.match(p.category, params.search)
          )
        }

        if (params.category && params.category !== '全部') {
             // Check if it's a parent category (like '保养类') or a child category
            const categoryStore = this.categories.find((c: any) => c.name === params.category);
            if (categoryStore && categoryStore.children) {
                // If it's a parent category, include items from all its children
                const childNames = categoryStore.children.map((c: any) => c.name);
                data = data.filter((p: any) => childNames.includes(p.category) || p.category === params.category);
            } else {
                // Exact match
                data = data.filter((p: any) => p.category === params.category);
            }
        }

        this.total = data.length
        
        // Pagination logic
        if (params.page && params.itemsPerPage) {
            const start = (params.page - 1) * params.itemsPerPage
            const end = start + params.itemsPerPage
            const pageItems = data.slice(start, end)
            
            if (params.append) {
                if (params.page === 1) {
                    this.products = pageItems
                } else {
                    this.products = [...this.products, ...pageItems]
                }
            } else {
                this.products = pageItems
            }
        } else {
            this.products = data
        }
        
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async addProduct(product: any) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const productWithDept = {
          ...product,
          department: authStore.user?.department || '总部'
        }
        await axios.post('/api/products', productWithDept)
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async updateProduct(product: any) {
      this.loading = true
      try {
        await axios.put('/api/products', product)
      } catch (error) {
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async deleteProduct(id: number) {
      this.loading = true
      try {
        await axios.delete('/api/products', { data: { id } })
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
