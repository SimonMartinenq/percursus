// components/settings/ProfileSettings.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "@prisma/client";

type Props = {
  user: Pick<User, "name" | "email" | "image" | "createdAt">;
};

export function ProfileSettings({ user }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "Avatar"}
          />
          <AvatarFallback>
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">{user.name ?? "Utilisateur"}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2">
            <Label>Nom</Label>
            <Input value={user.name ?? ""} readOnly />
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={user.email} readOnly />
          </div>

          <div className="grid gap-2">
            <Label>Créé le</Label>
            <Input value={new Date(user.createdAt).toLocaleString()} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
