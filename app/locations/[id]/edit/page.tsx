export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EditLocationForm from './edit-form';
import { requireSession } from '@/lib/auth';

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;
  const locationId = Number(id);

  if (isNaN(locationId)) {
    notFound();
  }

  const location = await prisma.warehouseLocation.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    notFound();
  }

  return (
    <EditLocationForm
      location={{
        id: location.id,
        code: location.code,
        name: location.name,
        xPercent: location.xPercent,
        yPercent: location.yPercent,
        isActive: location.isActive,
      }}
    />
  );
}
