// Hybrid notes service - Database with localStorage fallback

interface Note {
  id: string
  userId?: string
  spaceType: string
  title?: string
  content: any
  isPinned: boolean
  createdAt: string | Date
  updatedAt: string | Date
  tags?: any[]
  assets?: any[]
}

class NotesService {
  private useDatabase: boolean = false
  
  constructor() {
    // Check if we should use database (when DEMO_MODE is false)
    if (typeof window !== 'undefined') {
      this.useDatabase = process.env.NEXT_PUBLIC_DEMO_MODE !== 'true'
    }
  }

  // Fetch notes - tries database first, falls back to localStorage
  async getNotes(spaceType?: string): Promise<Note[]> {
    // Try database first if enabled
    if (this.useDatabase) {
      try {
        const url = `/api/notes/db${spaceType ? `?spaceType=${spaceType}` : ''}`
        const response = await fetch(url, {
          headers: {
            'x-user-id': this.getCurrentUserId()
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.notes && !data.error) {
            console.log('Notes loaded from database')
            return data.notes
          }
        }
      } catch (error) {
        console.warn('Database unavailable, falling back to localStorage', error)
      }
    }
    
    // Fallback to localStorage
    return this.getNotesFromLocalStorage(spaceType)
  }

  // Save note - saves to both database and localStorage
  async saveNote(note: Partial<Note>): Promise<Note> {
    const savedNote = { ...note } as Note
    
    // Save to database if enabled
    if (this.useDatabase) {
      try {
        const response = await fetch('/api/notes/db', {
          method: note.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': this.getCurrentUserId()
          },
          body: JSON.stringify(note)
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.note) {
            console.log('Note saved to database')
            Object.assign(savedNote, data.note)
          }
        }
      } catch (error) {
        console.warn('Failed to save to database', error)
      }
    }
    
    // Always save to localStorage as backup
    this.saveNoteToLocalStorage(savedNote)
    return savedNote
  }

  // Delete note - removes from both database and localStorage
  async deleteNote(id: string): Promise<boolean> {
    let success = false
    
    // Delete from database if enabled
    if (this.useDatabase) {
      try {
        const response = await fetch(`/api/notes/db?id=${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': this.getCurrentUserId()
          }
        })
        
        if (response.ok) {
          console.log('Note deleted from database')
          success = true
        }
      } catch (error) {
        console.warn('Failed to delete from database', error)
      }
    }
    
    // Always delete from localStorage
    this.deleteNoteFromLocalStorage(id)
    return success || true
  }

  // Private helper methods for localStorage operations
  private getNotesFromLocalStorage(spaceType?: string): Note[] {
    if (typeof window === 'undefined') return []
    
    const key = spaceType ? `notes_${spaceType}` : 'notes'
    const stored = localStorage.getItem(key)
    
    if (!stored) return []
    
    try {
      const notes = JSON.parse(stored)
      return Array.isArray(notes) ? notes : []
    } catch {
      return []
    }
  }

  private saveNoteToLocalStorage(note: Note): void {
    if (typeof window === 'undefined') return
    
    const key = `notes_${note.spaceType}`
    const notes = this.getNotesFromLocalStorage(note.spaceType)
    
    // Add or update note
    const index = notes.findIndex(n => n.id === note.id)
    if (index >= 0) {
      notes[index] = note
    } else {
      notes.push(note)
    }
    
    localStorage.setItem(key, JSON.stringify(notes))
  }

  private deleteNoteFromLocalStorage(id: string): void {
    if (typeof window === 'undefined') return
    
    // Check all space types
    const spaceTypes = ['PROJECTS', 'FAMILY', 'HOME', 'LOVE', 'BUYING', 'CAREER', 'FAITH']
    
    for (const spaceType of spaceTypes) {
      const key = `notes_${spaceType}`
      const notes = this.getNotesFromLocalStorage(spaceType)
      const filtered = notes.filter(n => n.id !== id)
      
      if (filtered.length < notes.length) {
        localStorage.setItem(key, JSON.stringify(filtered))
        break
      }
    }
  }

  private getCurrentUserId(): string {
    if (typeof window === 'undefined') return 'demo-user'
    
    const user = localStorage.getItem('current_user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        return parsed.id || 'demo-user'
      } catch {
        return 'demo-user'
      }
    }
    return 'demo-user'
  }

  // Migration helper - copies localStorage notes to database
  async migrateNotesToDatabase(): Promise<void> {
    if (!this.useDatabase) return
    
    console.log('Starting notes migration to database...')
    const spaceTypes = ['PROJECTS', 'FAMILY', 'HOME', 'LOVE', 'BUYING', 'CAREER', 'FAITH']
    
    for (const spaceType of spaceTypes) {
      const notes = this.getNotesFromLocalStorage(spaceType)
      
      for (const note of notes) {
        try {
          await this.saveNote({
            ...note,
            spaceType
          })
          console.log(`Migrated note: ${note.title || 'Untitled'}`)
        } catch (error) {
          console.error('Failed to migrate note:', error)
        }
      }
    }
    
    console.log('Notes migration completed!')
  }
}

// Export singleton instance
export const notesService = new NotesService()