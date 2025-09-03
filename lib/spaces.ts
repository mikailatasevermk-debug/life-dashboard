// import { SpaceType } from "@prisma/client"

// Temporary SpaceType enum until Prisma is connected
enum SpaceType {
  PROJECTS = "PROJECTS",
  FAMILY = "FAMILY", 
  HOME = "HOME",
  LOVE = "LOVE",
  BUYING = "BUYING",
  CAREER = "CAREER",
  FAITH = "FAITH"
}

export const SPACES = [
  {
    type: SpaceType.PROJECTS,
    name: "Projects / Business",
    color: "#E63946",
    colorName: "mario-red",
    cardClass: "mario-red-card",
    iconName: "briefcase",
    description: "Your creative ventures and business ideas"
  },
  {
    type: SpaceType.FAMILY,
    name: "Family",
    color: "#06D6A0",
    colorName: "luigi-green",
    cardClass: "luigi-green-card",
    iconName: "users",
    description: "Memories and moments with loved ones"
  },
  {
    type: SpaceType.HOME,
    name: "Home / Dreams",
    color: "#118AB2",
    colorName: "sky-blue",
    cardClass: "sky-blue-card",
    iconName: "home",
    description: "Your sanctuary and future aspirations"
  },
  {
    type: SpaceType.LOVE,
    name: "Love with Wife",
    color: "#FF8FA3",
    colorName: "peach-pink",
    cardClass: "peach-pink-card",
    iconName: "heart",
    description: "Cherished moments and expressions of love"
  },
  {
    type: SpaceType.BUYING,
    name: "Conscious Buying",
    color: "#FFD166",
    colorName: "sunshine-yellow",
    cardClass: "sunshine-yellow-card",
    iconName: "shopping-bag",
    description: "Mindful purchases and wishlist"
  },
  {
    type: SpaceType.CAREER,
    name: "Work / Career",
    color: "#5F6C7B",
    colorName: "steel-gray",
    cardClass: "steel-gray-card",
    iconName: "building-2",
    description: "Professional growth and achievements"
  },
  {
    type: SpaceType.FAITH,
    name: "Islamic Faith",
    color: "#10B981",
    colorName: "islamic-green",
    cardClass: "islamic-green-card",
    iconName: "moon",
    description: "Prayer, Quran, Dhikr, and Islamic guidance"
  }
]

export function getSpaceByType(type: SpaceType) {
  return SPACES.find(space => space.type === type)
}