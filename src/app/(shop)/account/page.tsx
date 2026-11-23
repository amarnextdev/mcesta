import { redirect } from "next/navigation"

/** /account opens the orders page (the account home). */
export default function AccountPage() {
  redirect("/account/orders")
}
