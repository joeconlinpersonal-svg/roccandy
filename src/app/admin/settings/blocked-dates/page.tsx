import { redirect } from "next/navigation";

export default function SettingsBlockedDatesRedirect() {
  redirect("/admin/settings/production");
}
