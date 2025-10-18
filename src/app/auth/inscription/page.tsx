// src/app/auth/inscription/page.tsx
import PictureList from '@/components/auth/PictureList';
import Tag from '@/components/global/Tag';
import { InscriptionTabs } from '@/components/auth/Inscription/InscriptionTabs';

export default function InscriptionPage() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <PictureList />
        <Tag label="Rejoins +7000 utilisatrices" />
      </div>
       {/* Tabs multi-step */}
      <InscriptionTabs  />
    </div>
  );
}

