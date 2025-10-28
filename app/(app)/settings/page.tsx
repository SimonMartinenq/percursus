// app/settings/page.tsx
import { requireUser } from "@/lib/auth-helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/ProfileSettings";
import { AppPreferences } from "@/components/AppPreferences";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Paramètres</h1>
        <p className="text-muted-foreground text-sm">
          Gérez vos informations de profil et vos préférences d’affichage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="preferences">Préférences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings user={user} />
            </TabsContent>

            <TabsContent value="preferences">
              <AppPreferences />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
