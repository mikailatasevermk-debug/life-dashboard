"use client"

import { useState } from "react"
import { notesService } from "@/lib/notes-service"

export default function TestDatabase() {
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState<any[]>([])
  
  const testDatabase = async () => {
    setStatus("Testing database connection...")
    
    try {
      // Try to fetch notes
      const fetchedNotes = await notesService.getNotes("PROJECTS")
      setNotes(fetchedNotes)
      setStatus(`✅ Success! Found ${fetchedNotes.length} notes in database`)
      
      // Check if we got the sample note
      const welcomeNote = fetchedNotes.find(n => 
        n.title?.includes("Welcome to Database Integration")
      )
      
      if (welcomeNote) {
        setStatus(prev => prev + "\n✅ Database note found: " + welcomeNote.title)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`)
    }
  }
  
  const createTestNote = async () => {
    setStatus("Creating test note...")
    
    try {
      const newNote = await notesService.saveNote({
        spaceType: "PROJECTS",
        title: "Test Note from UI",
        content: { text: "Created at " + new Date().toISOString() },
        isPinned: false
      })
      
      setStatus(`✅ Note created! ID: ${newNote.id}`)
      testDatabase() // Refresh
    } catch (error) {
      setStatus(`❌ Error creating note: ${error}`)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Integration Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm mb-2">Environment:</p>
          <code className="text-xs">
            DEMO_MODE: {process.env.NEXT_PUBLIC_DEMO_MODE || "false"}
          </code>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testDatabase}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Database Read
          </button>
          
          <button
            onClick={createTestNote}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Test Note
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-semibold mb-2">Status:</p>
          <pre className="whitespace-pre-wrap text-sm">{status}</pre>
        </div>
        
        {notes.length > 0 && (
          <div className="bg-white p-4 rounded border">
            <p className="font-semibold mb-2">Notes in Database:</p>
            <ul className="space-y-2">
              {notes.map((note, i) => (
                <li key={i} className="text-sm">
                  • {note.title || "Untitled"} 
                  {note.isPinned && " 📌"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}