import Mock from 'mockjs'

// Delay to simulate network latency
Mock.setup({
  timeout: '200-600'
})

// Define Category and Product Structure
const beautyData = [
  {
    name: '护肤',
    id: 1,
    children: [
      { name: '洁面', id: 11, items: ['氨基酸温和洁面乳', '深层清洁泥膜', '泡沫洁面慕斯'] },
      { name: '爽肤水', id: 12, items: ['玻尿酸保湿爽肤水', '玫瑰纯露喷雾', '金盏花舒缓水'] },
      { name: '精华', id: 13, items: ['烟酰胺美白精华液', '小棕瓶修护精华', '维C抗氧化精华'] },
      { name: '面霜', id: 14, items: ['多肽抗皱面霜', '清爽保湿凝露', '视黄醇晚霜'] },
      { name: '眼霜', id: 15, items: ['咖啡因消肿眼霜', '抗皱紧致眼霜'] },
      { name: '防晒', id: 16, items: ['清透隔离防晒霜', '水润防晒喷雾'] }
    ]
  },
  {
    name: '彩妆',
    id: 2,
    children: [
      { name: '底妆', id: 21, items: ['持妆粉底液', '气垫BB霜', '遮瑕液', '定妆散粉'] },
      { name: '唇妆', id: 22, items: ['丝绒哑光口红', '镜面唇釉', '润唇膏'] },
      { name: '眼妆', id: 23, items: ['大地色眼影盘', '浓密卷翘睫毛膏', '极细眉笔', '眼线胶笔'] },
      { name: '修容', id: 24, items: ['高光修容盘', '单色腮红'] }
    ]
  },
  {
    name: '个护',
    id: 3,
    children: [
      { name: '洗护', id: 31, items: ['生姜防脱洗发水', '柔顺亮泽护发素', '免洗发膜'] },
      { name: '身体护理', id: 32, items: ['香氛沐浴露', '果酸身体乳', '磨砂膏'] },
      { name: '手足护理', id: 33, items: ['滋润护手霜', '修护足膜'] },
      { name: '口腔护理', id: 34, items: ['清凉薄荷牙膏', '美白牙贴', '漱口水'] }
    ]
  },
  {
    name: '香氛',
    id: 4,
    children: [
      { name: '香水', id: 41, items: ['清新花果香水', '木质调淡香水', '古龙水'] },
      { name: '家居香氛', id: 42, items: ['无火香薰精油', '香氛蜡烛', '衣物留香珠'] }
    ]
  }
]

const categoryImageMap: Record<string, string> = {
  '护肤': 'Skincare', '彩妆': 'Makeup', '个护': 'Personal Care', '香氛': 'Fragrance'
}

const generateProducts = () => {
  const products = []
  // Flatten the structure to easily pick items
  const allVariants: any[] = []
  
  beautyData.forEach(parent => {
    parent.children.forEach(child => {
      child.items.forEach((itemName) => {
        allVariants.push({
          parentName: parent.name,
          categoryName: child.name, // The actual category assigned to product
          name: itemName,
          imageText: categoryImageMap[parent.name]
        })
      })
    })
  })

  for (let i = 1; i <= 100; i++) {
    // Deterministically pick a variant
    const variantIndex = (i - 1) % allVariants.length
    const variant = allVariants[variantIndex]
    
    // Add version number to name if we cycle through
    const cycle = Math.floor((i - 1) / allVariants.length)
    const nameSuffix = cycle > 0 ? ` ${cycle + 1}号` : ''
    
    const price = 50 + (i * 7) % 950
    const stock = (i * 13) % 1000
    // Randomly assign department
    const departments = ['区域一', '区域二', '区域三']
    const department = departments[i % 3]
    
    products.push({
      id: i,
      name: `${variant.name}${nameSuffix}`,
      category: variant.categoryName, // Use sub-category for better filtering
      parentCategory: variant.parentName, // Keep track if needed, but UI uses category string
      department, // Add department field
      price: price,
      stock: stock,
      image: `https://placehold.co/400x400/ffebee/e91e63?text=${encodeURIComponent(variant.imageText)}+${i}`,
      description: `【${variant.parentName}系列】${variant.name}，专为东方肤质设计。采用珍贵植萃成分，温和有效。ID:${i}`
    })
  }
  return products
}

let productsList = generateProducts()

// Generate Category Tree for API
const categoryTree = beautyData.map(c => ({
  id: c.id,
  name: c.name,
  children: c.children.map(child => ({
    id: child.id,
    name: child.name
  }))
}))

Mock.mock(/\/api\/categories/, 'get', {
  code: 200,
  data: categoryTree
})

Mock.mock(/\/api\/categories/, 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const newCategory = {
    id: Math.floor(Math.random() * 10000),
    name: body.name,
    children: []
  }
  
  if (body.parentId) {
    // Search deep
    for (const cat of categoryTree) {
      if (cat.id === body.parentId) {
        if (!cat.children) cat.children = []
        cat.children.push(newCategory)
        return { code: 200, data: newCategory, message: 'Category added' }
      }
    }
  } else {
    categoryTree.push(newCategory)
  }
  
  return {
    code: 200,
    data: newCategory,
    message: 'Category added successfully'
  }
})

Mock.mock(/\/api\/categories/, 'put', (options: any) => {
  const body = JSON.parse(options.body)
  let found = false
  
  const updateNode = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.id === body.id) {
        node.name = body.name
        found = true
        return
      }
      if (node.children) {
        updateNode(node.children)
        if (found) return
      }
    }
  }
  updateNode(categoryTree)
  
  return {
    code: found ? 200 : 404,
    message: found ? 'Category updated' : 'Category not found'
  }
})

Mock.mock(/\/api\/categories/, 'delete', (options: any) => {
  const body = JSON.parse(options.body)
  let found = false
  let categoryName = ''

  // Find category name first
  const findCategory = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.id === body.id) {
        categoryName = node.name
        return true
      }
      if (node.children) {
        if (findCategory(node.children)) return true
      }
    }
    return false
  }
  
  if (findCategory(categoryTree)) {
    // Check if any product uses this category
    const isInUse = productsList.some(p => p.category === categoryName)
    if (isInUse) {
      return {
        code: 400,
        message: 'Category is in use by products'
      }
    }
  }
  
  const deleteNode = (nodes: any[]) => {
    const index = nodes.findIndex(n => n.id === body.id)
    if (index !== -1) {
      nodes.splice(index, 1)
      found = true
      return
    }
    for (const node of nodes) {
      if (node.children) {
        deleteNode(node.children)
        if (found) return
      }
    }
  }
  deleteNode(categoryTree)
  
  return {
    code: found ? 200 : 404,
    message: found ? 'Category deleted' : 'Category not found'
  }
})

Mock.mock(/\/api\/products/, 'get', () => {
  // Return sorted by ID descending (newest first)
  const sortedList = [...productsList].sort((a, b) => b.id - a.id)
  return {
    code: 200,
    data: sortedList,
    total: productsList.length
  }
})

Mock.mock(/\/api\/products/, 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const maxId = productsList.length > 0 ? Math.max(...productsList.map(p => p.id)) : 0
  const newProduct = {
    id: maxId + 1,
    ...body,
    image: body.image || 'https://placehold.co/400x400/ffebee/e91e63?text=New+Product'
  }
  productsList.push(newProduct)
  return {
    code: 200,
    data: newProduct,
    message: 'Product added successfully'
  }
})

Mock.mock(/\/api\/products/, 'put', (options: any) => {
  const body = JSON.parse(options.body)
  const index = productsList.findIndex((p: any) => p.id === body.id)
  if (index !== -1) {
    productsList[index] = { ...productsList[index], ...body }
    return {
      code: 200,
      data: productsList[index],
      message: 'Product updated successfully'
    }
  }
  return {
    code: 404,
    message: 'Product not found'
  }
})

Mock.mock(/\/api\/products/, 'delete', (options: any) => {
  const body = JSON.parse(options.body)
  const index = productsList.findIndex((p: any) => p.id === body.id)
  if (index !== -1) {
    productsList.splice(index, 1)
    return {
      code: 200,
      message: 'Product deleted successfully'
    }
  }
  return {
    code: 404,
    message: 'Product not found'
  }
})

// Car Data Generation
let carBrands = ['奥迪', '宝马', '奔驰', '大众', '丰田', '本田']
let carSeries = ['轿车', 'SUV', 'MPV', '跑车', '皮卡']
let carYears = ['2020', '2021', '2022', '2023', '2024', '2025']

const carModels: Record<string, string[]> = {
  '奥迪': ['A4L', 'A6L', 'A8L', 'Q3', 'Q5L', 'Q7'],
  '宝马': ['3系', '5系', '7系', 'X1', 'X3', 'X5'],
  '奔驰': ['C级', 'E级', 'S级', 'GLC', 'GLE'],
  '大众': ['迈腾', '帕萨特', '途观L', '途昂'],
  '丰田': ['凯美瑞', '亚洲龙', '汉兰达', 'RAV4'],
  '本田': ['雅阁', '思域', 'CR-V', '皓影']
}
const carChannels = ['国产', '进口']
const carPowerTypes = ['汽油', '柴油', '混动', '纯电', '插电混动']
const carEmissions = ['国五', '国六a', '国六b', '欧五', '欧六']
const carTransmissions = ['手动', '自动', '双离合', 'CVT']
const carDriveTypes = ['前驱', '后驱', '四驱']
const carStatuses = ['在售', '停产', '即将上市']
const carDisplacements = ['1.5L', '2.0L', '2.0T', '3.0T', '4.0T']

const generateCars = () => {
  const cars = []
  for (let i = 1; i <= 50; i++) {
    const brand = carBrands[Math.floor(Math.random() * carBrands.length)] as string
    const models = carModels[brand] || [brand + '车型']
    const model = models[Math.floor(Math.random() * models.length)]
    
    // Randomly assign department
    const departments = ['区域一', '区域二', '区域三']
    const department = departments[i % 3]

    cars.push({
      id: i,
      brand: brand,
      model: model,
      department, // Add department field
      type: '燃油', // Broad type
      channel: carChannels[Math.floor(Math.random() * carChannels.length)],
      year: carYears[Math.floor(Math.random() * carYears.length)],
      productionDate: `202${Math.floor(Math.random() * 4)}-0${Math.floor(Math.random() * 9) + 1}`,
      discontinuedDate: '',
      powerType: carPowerTypes[Math.floor(Math.random() * carPowerTypes.length)],
      emission: carEmissions[Math.floor(Math.random() * carEmissions.length)],
      series: carSeries[Math.floor(Math.random() * carSeries.length)],
      displacement: carDisplacements[Math.floor(Math.random() * carDisplacements.length)],
      transmission: carTransmissions[Math.floor(Math.random() * carTransmissions.length)],
      driveType: carDriveTypes[Math.floor(Math.random() * carDriveTypes.length)],
      status: carStatuses[Math.floor(Math.random() * carStatuses.length)]
    })
  }
  return cars
}

const carsList = generateCars()

// Brand Management APIs
Mock.mock(/\/api\/car-brands/, 'get', () => ({
  code: 200,
  data: carBrands
}))

Mock.mock(/\/api\/car-brands/, 'post', (options: any) => {
  const { name } = JSON.parse(options.body)
  if (!carBrands.includes(name)) carBrands.push(name)
  return { code: 200, message: 'Brand added' }
})

Mock.mock(/\/api\/car-brands/, 'put', (options: any) => {
  const { oldName, newName } = JSON.parse(options.body)
  const index = carBrands.indexOf(oldName)
  if (index !== -1) carBrands[index] = newName
  return { code: 200, message: 'Brand updated' }
})

Mock.mock(/\/api\/car-brands/, 'delete', (options: any) => {
  const { name } = JSON.parse(options.body)
  carBrands = carBrands.filter(b => b !== name)
  return { code: 200, message: 'Brand deleted' }
})

// Series Management APIs
Mock.mock(/\/api\/car-series/, 'get', () => ({
  code: 200,
  data: carSeries
}))

Mock.mock(/\/api\/car-series/, 'post', (options: any) => {
  const { name } = JSON.parse(options.body)
  if (!carSeries.includes(name)) carSeries.push(name)
  return { code: 200, message: 'Series added' }
})

Mock.mock(/\/api\/car-series/, 'put', (options: any) => {
  const { oldName, newName } = JSON.parse(options.body)
  const index = carSeries.indexOf(oldName)
  if (index !== -1) carSeries[index] = newName
  return { code: 200, message: 'Series updated' }
})

Mock.mock(/\/api\/car-series/, 'delete', (options: any) => {
  const { name } = JSON.parse(options.body)
  carSeries = carSeries.filter(s => s !== name)
  return { code: 200, message: 'Series deleted' }
})

// Year Management APIs
Mock.mock(/\/api\/car-years/, 'get', () => ({
  code: 200,
  data: carYears
}))

Mock.mock(/\/api\/car-years/, 'post', (options: any) => {
  const { name } = JSON.parse(options.body)
  if (!carYears.includes(name)) {
    carYears.push(name)
    carYears.sort().reverse()
  }
  return { code: 200, message: 'Year added' }
})

Mock.mock(/\/api\/car-years/, 'delete', (options: any) => {
  const { name } = JSON.parse(options.body)
  carYears = carYears.filter(y => y !== name)
  return { code: 200, message: 'Year deleted' }
})

Mock.mock(/\/api\/cars/, 'get', () => {
  const sortedList = [...carsList].sort((a, b) => b.id - a.id)
  return {
    code: 200,
    data: sortedList,
    total: carsList.length
  }
})

Mock.mock(/\/api\/cars/, 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const maxId = carsList.length > 0 ? Math.max(...carsList.map(c => c.id)) : 0
  const newCar = {
    id: maxId + 1,
    ...body
  }
  carsList.push(newCar)
  return {
    code: 200,
    data: newCar,
    message: 'Car added successfully'
  }
})

Mock.mock(/\/api\/cars/, 'put', (options: any) => {
  const body = JSON.parse(options.body)
  const index = carsList.findIndex(c => c.id === body.id)
  if (index !== -1) {
    carsList[index] = { ...carsList[index], ...body }
    return {
      code: 200,
      data: carsList[index],
      message: 'Car updated successfully'
    }
  }
  return { code: 404, message: 'Car not found' }
})

Mock.mock(/\/api\/cars/, 'delete', (options: any) => {
  const body = JSON.parse(options.body)
  const index = carsList.findIndex(c => c.id === body.id)
  if (index !== -1) {
    carsList.splice(index, 1)
    return {
      code: 200,
      message: 'Car deleted successfully'
    }
  }
  return { code: 404, message: 'Car not found' }
})

// Mock User
Mock.mock(/\/api\/login/, 'post', (options: any) => {
  const { username, password } = JSON.parse(options.body)
  if (username === 'admin' && password === '123456') {
    return {
      code: 200,
      data: {
        token: 'admin-token',
        user: {
          id: 1,
          name: 'Admin',
          role: 'admin',
          avatar: 'https://i.pravatar.cc/150?u=admin'
        }
      }
    }
  }
  return {
    code: 401,
    message: 'Invalid credentials'
  }
})

export default Mock