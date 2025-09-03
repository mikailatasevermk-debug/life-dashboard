export interface ShoppingItem {
  id: string
  item: string
  quantity?: string
  completed: boolean
  addedAt: Date
  priority: 'low' | 'medium' | 'high' | 'vip'
  dueDate?: Date
  category?: string
  spaceType: string
  spaceName: string
  notes?: string
}

export interface ShoppingList {
  spaceType: string
  spaceName: string
  items: ShoppingItem[]
  lastUpdated: Date
}

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  vip: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200'
}

export const PRIORITY_EMOJIS = {
  low: '⚪',
  medium: '🔵', 
  high: '🟠',
  vip: '⭐'
}

// Get all shopping lists from localStorage
export function getAllShoppingLists(): ShoppingList[] {
  const lists: ShoppingList[] = []
  
  // Get all localStorage keys that contain shopping data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('grocery_list_')) {
      const spaceType = key.replace('grocery_list_', '')
      const data = localStorage.getItem(key)
      
      if (data) {
        try {
          const items = JSON.parse(data).map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
            dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            spaceType,
            spaceName: getSpaceName(spaceType),
            priority: item.priority || 'medium'
          }))
          
          lists.push({
            spaceType,
            spaceName: getSpaceName(spaceType),
            items,
            lastUpdated: new Date()
          })
        } catch (error) {
          console.error(`Error parsing shopping list for ${spaceType}:`, error)
        }
      }
    }
  })
  
  return lists
}

// Get VIP and urgent shopping items
export function getVIPShoppingItems(): ShoppingItem[] {
  const allLists = getAllShoppingLists()
  const vipItems: ShoppingItem[] = []
  
  allLists.forEach(list => {
    list.items.forEach(item => {
      if (item.completed) return // Skip completed items
      
      const isVIP = item.priority === 'vip'
      const isHighPriority = item.priority === 'high'
      const isUrgent = item.dueDate && isWithin24Hours(item.dueDate)
      
      if (isVIP || isHighPriority || isUrgent) {
        vipItems.push(item)
      }
    })
  })
  
  // Sort by priority: VIP > High > Urgent by date
  return vipItems.sort((a, b) => {
    if (a.priority === 'vip' && b.priority !== 'vip') return -1
    if (b.priority === 'vip' && a.priority !== 'vip') return 1
    if (a.priority === 'high' && b.priority === 'medium') return -1
    if (b.priority === 'high' && a.priority === 'medium') return 1
    
    // If same priority, sort by due date
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }
    if (a.dueDate && !b.dueDate) return -1
    if (b.dueDate && !a.dueDate) return 1
    
    return b.addedAt.getTime() - a.addedAt.getTime()
  })
}

// Get all shopping items (for Conscious Buying card)
export function getAllShoppingItems(): ShoppingItem[] {
  const allLists = getAllShoppingLists()
  const allItems: ShoppingItem[] = []
  
  allLists.forEach(list => {
    allItems.push(...list.items.filter(item => !item.completed))
  })
  
  return allItems.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
}

// Utility functions
function getSpaceName(spaceType: string): string {
  const spaceNames: Record<string, string> = {
    HEALTH: 'Health & Wellness',
    FAMILY: 'Family & Home', 
    CAREER: 'Career & Growth',
    FINANCE: 'Financial Planning',
    CONSCIOUS_BUYING: 'Conscious Buying',
    FAITH: 'Faith & Spirituality',
    STORYTELLING: 'Stories & Memories',
    PROJECTS: 'Creative Projects',
    LOVE: 'Love & Relationships',
    SPORTS: 'Sports & Fitness'
  }
  
  return spaceNames[spaceType] || spaceType
}

function isWithin24Hours(date: Date): boolean {
  const now = new Date()
  const timeDiff = date.getTime() - now.getTime()
  return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 // 24 hours in milliseconds
}

// Update shopping item
export function updateShoppingItem(item: ShoppingItem): void {
  const key = `grocery_list_${item.spaceType}`
  const data = localStorage.getItem(key)
  
  if (data) {
    try {
      const items = JSON.parse(data)
      const index = items.findIndex((i: any) => i.id === item.id)
      
      if (index !== -1) {
        items[index] = {
          ...item,
          addedAt: item.addedAt.toISOString(),
          dueDate: item.dueDate?.toISOString()
        }
        localStorage.setItem(key, JSON.stringify(items))
      }
    } catch (error) {
      console.error('Error updating shopping item:', error)
    }
  }
}

// Delete shopping item
export function deleteShoppingItem(itemId: string, spaceType: string): void {
  const key = `grocery_list_${spaceType}`
  const data = localStorage.getItem(key)
  
  if (data) {
    try {
      const items = JSON.parse(data)
      const filteredItems = items.filter((i: any) => i.id !== itemId)
      localStorage.setItem(key, JSON.stringify(filteredItems))
    } catch (error) {
      console.error('Error deleting shopping item:', error)
    }
  }
}