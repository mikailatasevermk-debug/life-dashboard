// import { SpaceType } from "@prisma/client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Pin, Save } from "lucide-react"
import { SPACES } from "@/lib/spaces"
import { TipTapEditor } from "@/components/editor/TipTapEditor"

export default function SpacePage({
  params
}: {
  params: { type: string }
}) {
  const spaceType = params.type.toUpperCase() as string
  const space = SPACES.find(s => s.type === spaceType)

  if (!space) {
    notFound()
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 bg-white/60 backdrop-blur-xl rounded-lg hover:bg-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div 
                className="p-2 rounded-lg bg-white/60 backdrop-blur-xl"
                style={{ color: space.color }}
              >
                <space.icon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{space.name}</h1>
                <p className="text-sm text-gray-600">{space.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-lg hover:bg-white/80 transition-colors">
                <Pin className="w-4 h-4" />
                <span className="text-sm font-medium">Pin</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-lg hover:bg-white/80 transition-colors">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Add Event</span>
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white"
                style={{ backgroundColor: space.color }}
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>
          </div>
        </header>

        <div className={cn(space.cardClass, "p-6")}>
          <TipTapEditor 
            placeholder={`Start writing in your ${space.name.toLowerCase()} space...`}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/60 backdrop-blur-xl rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Notes</h3>
            <p className="text-sm text-gray-500">No notes yet</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-xl rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Pinned Items</h3>
            <p className="text-sm text-gray-500">Pin important notes here</p>
          </div>
          <div className="p-4 bg-white/60 backdrop-blur-xl rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-gray-600 hover:text-gray-800">
                → Add mood check-in
              </button>
              <button className="w-full text-left text-sm text-gray-600 hover:text-gray-800">
                → Create vision board
              </button>
              <button className="w-full text-left text-sm text-gray-600 hover:text-gray-800">
                → Weekly reflection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}