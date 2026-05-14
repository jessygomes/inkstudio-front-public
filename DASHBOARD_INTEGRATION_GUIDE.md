# 🎯 Guide Intégration Dashboard Admin - Analytics

## Pour afficher les stats dans votre dashboard admin/salon

### Étape 1: Créer une nouvelle page dans le dashboard

```typescript
// app/(root)/mon-profil/statistics/page.tsx (ou votre chemin)

'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { SalonAnalyticsDashboard } from '@/components/Dashboard/SalonAnalyticsDashboard';
import Link from 'next/link';

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const [selectedDays, setSelectedDays] = useState(30);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-noir-700 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-noir-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Vous devez être connecté</p>
          <Link href="/login" className="text-tertiary-400 hover:text-tertiary-300">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const salonId = (session.user as any).id;
  const salonName = (session.user as any).salonName || 'Statistiques';

  return (
    <div className="min-h-screen bg-noir-700 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/mon-profil" 
            className="text-tertiary-400 hover:text-tertiary-300 text-sm mb-4 inline-block"
          >
            ← Retour au profil
          </Link>

          <div className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-one text-white">
              📊 Statistiques
            </h1>
            <p className="text-white/60 text-sm mt-2">
              {salonName} • Visites de profil public
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { label: '7 jours', value: 7 },
            { label: '30 jours', value: 30 },
            { label: '90 jours', value: 90 },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedDays(value)}
              className={`px-4 py-2 rounded-xl font-one text-sm transition-all duration-200 ${
                selectedDays === value
                  ? 'bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-noir-900 shadow-lg'
                  : 'bg-noir-600 text-white/80 hover:bg-noir-500 border border-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Dashboard */}
        <div className="mb-8">
          <SalonAnalyticsDashboard salonId={salonId} days={selectedDays} />
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>💡 Conseil 1:</strong> Partagez votre profil sur vos réseaux 
              sociaux pour augmenter le trafic. Les données se mettent à jour 
              automatiquement.
            </p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-emerald-200 text-sm">
              <strong>✨ Conseil 2:</strong> Un profil complet (photos, description, 
              portfolio) encourage les visiteurs à prendre rendez-vous.
            </p>
          </div>

          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
            <p className="text-purple-200 text-sm">
              <strong>📱 Conseil 3:</strong> Mobile représente souvent le plus grand 
              volume. Assurez-vous que votre profil s'affiche bien sur téléphone.
            </p>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
            <p className="text-orange-200 text-sm">
              <strong>🎯 Conseil 4:</strong> Utilisez les stats pour analyser votre 
              croissance et optimiser votre présence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Étape 2: Ajouter un lien dans le menu du dashboard

```typescript
// components/Navigation/SalonNav.tsx ou votre composant de nav

<Link 
  href="/mon-profil/statistics"
  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-noir-600 transition"
>
  <span>📊</span>
  Statistiques
</Link>
```

### Étape 3: Ajouter des badges de visite au profil (optionnel)

```typescript
// Dans votre component de profil salon

'use client';

import { useEffect, useState } from 'react';

interface SalonStats {
  totalViews: number;
  uniqueVisitors: number;
}

export function ProfileVisitsBadge({ salonId }: { salonId: string }) {
  const [stats, setStats] = useState<SalonStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/salon-analytics/${salonId}/stats?days=30`
        );
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalViews: data.totalViews,
            uniqueVisitors: data.uniqueVisitors,
          });
        }
      } catch (err) {
        console.debug('Failed to fetch stats badge');
      }
    };

    fetchStats();
  }, [salonId]);

  if (!stats) return null;

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-1 text-white/70 text-xs">
        <span>👁️</span>
        <span>{stats.totalViews} visites</span>
      </div>
      <div className="flex items-center gap-1 text-white/70 text-xs">
        <span>👤</span>
        <span>{stats.uniqueVisitors} visiteurs</span>
      </div>
    </div>
  );
}
```

### Étape 4: Intégrer dans votre page profile existante

```typescript
// app/(root)/mon-profil/page.tsx

import { ProfileVisitsBadge } from '@/components/Dashboard/ProfileVisitsBadge';

export default function ProfilPage({ user }) {
  return (
    <div>
      {/* Votre contenu existant */}
      
      {/* Ajouter les badges */}
      <ProfileVisitsBadge salonId={user.id} />
      
      {/* Ajouter un lien vers la page stats */}
      <Link href="/mon-profil/statistics" className="btn">
        Voir les statistiques détaillées →
      </Link>
    </div>
  );
}
```

---

## 📍 Architecture Finale

```
Mon Profil (Tab)
├── Infos Générales
├── Portfolio
├── Photos
├── Équipe
└── ⭐ STATISTIQUES (NEW)
    ├── Page: /mon-profil/statistics
    ├── Composant: SalonAnalyticsDashboard
    └── Données: /api/salon-analytics/:salonId/stats
```

---

## 🔌 API Intégration

```typescript
// Pour récupérer les stats dans n'importe quel composant

const fetchStats = async (salonId: string, days: number = 30) => {
  const response = await fetch(
    `/api/salon-analytics/${salonId}/stats?days=${days}`
  );
  return response.json();
};

// Utilisation
useEffect(() => {
  fetchStats(salonId, 30).then(stats => {
    console.log(stats.totalViews);
    console.log(stats.viewsByDeviceType);
  });
}, [salonId]);
```

---

## 🎨 Personnalisation

### Changer les couleurs

Dans `components/Dashboard/SalonAnalyticsDashboard.tsx`:

```typescript
// Remplacer
className="bg-gradient-to-r from-tertiary-400 to-tertiary-500"

// Par
className="bg-gradient-to-r from-blue-400 to-blue-500"
```

### Ajouter des graphiques (Chart.js, Recharts)

```bash
npm install recharts
```

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={Object.entries(stats.viewsByDay).map(([date, views]) => ({
  date,
  views
}))}>
  <XAxis dataKey="date" />
  <YAxis />
  <Line type="monotone" dataKey="views" stroke="#fff" />
</LineChart>
```

### Exporter en PDF

```bash
npm install jspdf html2pdf
```

```typescript
const exportToPDF = async () => {
  const element = document.getElementById('analytics-dashboard');
  const opt = {
    margin: 10,
    filename: 'analytics.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  html2pdf().set(opt).from(element).save();
};
```

---

## ✅ Checklist Finale

- [ ] Résoudre les migrations Prisma (voir DEPLOYMENT_CHECKLIST.md)
- [ ] Installer `ua-parser-js` dans le frontend
- [ ] Créer la page `/mon-profil/statistics`
- [ ] Ajouter le lien dans le menu
- [ ] Tester le tracking (DevTools Network)
- [ ] Tester l'affichage des stats
- [ ] Ajouter le badge (optionnel)
- [ ] Personnaliser les couleurs
- [ ] Déployer en production

---

**Vous êtes prêt! 🚀**

Les visiteurs de votre profil salon seront maintenant trackés automatiquement,
et vous pourrez voir les statistiques dans votre dashboard.
