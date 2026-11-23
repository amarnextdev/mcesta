import {
  BookOpenIcon,
  ChefHatIcon,
  DumbbellIcon,
  GiftIcon,
  HeadphonesIcon,
  LifeBuoyIcon,
  LampIcon,
  PawPrintIcon,
  ShirtIcon,
  ShoppingBagIcon,
  SofaIcon,
  SparklesIcon,
  TruckIcon,
  type LucideIcon,
} from "lucide-react"

import type { CategoryIcon } from "@/lib/config/navigation"

export const categoryIcons: Record<CategoryIcon, LucideIcon> = {
  "for-you": ShoppingBagIcon,
  gifts: GiftIcon,
  decor: LampIcon,
  furniture: SofaIcon,
  kitchen: ChefHatIcon,
  electronics: HeadphonesIcon,
  fashion: ShirtIcon,
  beauty: SparklesIcon,
  sports: DumbbellIcon,
  pets: PawPrintIcon,
  books: BookOpenIcon,
  track: TruckIcon,
  help: LifeBuoyIcon,
}
