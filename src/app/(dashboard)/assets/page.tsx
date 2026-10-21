import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/permissions';
import { listAssetsAction, listAssetCategoryOptionsAction } from './actions';
import { AssetsTablePage } from './presentation/components/AssetsTablePage';

type Role = Parameters<typeof hasPermission>[0];
type IsActiveParam = 'active' | 'inactive' | 'all';
type AvailabilityParam = 'available' | 'assigned' | 'all';

function parseIsActive(v: string | undefined): IsActiveParam {
  return v === 'all' || v === 'inactive' ? v : 'active';
}

function parseAvailability(v: string | undefined): AvailabilityParam {
  return v === 'available' || v === 'assigned' ? v : 'all';
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    afterCursor?: string;
    beforeCursor?: string;
    pageSize?: string;
    isActive?: string;
    q?: string;
    categoryId?: string;
    generalStatus?: string;
    locationId?: string;
    availability?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role as Role, 'assets', 'read')) {
    redirect('/');
  }

  const sp = await searchParams;
  const pageSize = Math.min(100, Math.max(5, Number(sp.pageSize ?? 20) || 20));
  const afterCursor = sp.afterCursor || undefined;
  const beforeCursor = sp.beforeCursor || undefined;
  const isActive = parseIsActive(sp.isActive);
  const q = sp.q?.trim() ?? '';
  const availability = parseAvailability(sp.availability);

  const [result, categories] = await Promise.all([listAssetsAction({
    pageSize,
    afterCursor,
    beforeCursor,
    isActive,
    q,
    categoryId: sp.categoryId,
    generalStatus: sp.generalStatus,
    locationId: sp.locationId,
    availability: availability === 'all' ? undefined : availability,
  }), listAssetCategoryOptionsAction()]);
  if (!result.ok) redirect('/');

  const canWrite = hasPermission(session.user.role as Role, 'assets', 'create');

  return (
    <AssetsTablePage
      initialRows={result.data.rows}
      rowCount={result.data.rowCount}
      pageInfo={result.data.pageInfo}
      canWrite={canWrite}
      currentPageSize={pageSize}
      currentIsActive={isActive}
      currentQ={q}
      currentAvailability={availability}
      currentCategoryId={sp.categoryId ?? ''}
      categoryOptions={categories.ok ? categories.data : []}
    />
  );
}
