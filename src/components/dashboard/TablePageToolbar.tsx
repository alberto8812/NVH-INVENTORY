'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterBar, type FilterBarToggle } from '@/components/dashboard/FilterBar';
import { ExcelExportDropdown, type ExportOption } from '@/shared/ui/components/ExcelExportDropdown';
import { cn } from '@/lib/utils';

export interface ToolbarAction {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  disabled?: boolean;
  onClick: () => void | Promise<void>;
}

export interface ToolbarSelect {
  /** Accessible name of the select */
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export interface TablePageToolbarConfig {
  search?: {
    value: string;
    onChange: (q: string) => void;
    placeholder?: string;
  };
  toggles?: FilterBarToggle[];
  selects?: ToolbarSelect[];
  exports?: ExportOption[];
  actions?: ToolbarAction[];
}

interface TablePageToolbarProps {
  config: TablePageToolbarConfig;
}

export function TablePageToolbar({ config }: TablePageToolbarProps) {
  const hasLeft = config.search !== undefined || (config.toggles?.length ?? 0) > 0;
  const hasSelects = (config.selects?.length ?? 0) > 0;
  const hasRight = (config.exports?.length ?? 0) > 0 || (config.actions?.length ?? 0) > 0;

  if (!hasLeft && !hasSelects && !hasRight) return null;

  const renderActions = (className: string) => (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {config.exports && config.exports.length > 0 && (
        <ExcelExportDropdown options={config.exports} />
      )}
      {config.actions?.map((action, i) => (
        <Button
          key={i}
          size="sm"
          variant={action.variant ?? 'default'}
          className="h-9 gap-1.5 text-xs"
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );

  // With selects: search + actions on top, every filter grouped on a second row
  if (hasSelects) {
    const hasToggles = (config.toggles?.length ?? 0) > 0;
    return (
      <div className="flex flex-col gap-3">
        {(config.search !== undefined || hasRight) && (
          <div className="flex flex-wrap items-center gap-3">
            {config.search !== undefined && (
              <FilterBar
                searchValue={config.search.value}
                onSearchChange={config.search.onChange}
                searchPlaceholder={config.search.placeholder}
                className="min-w-0 flex-1 basis-64"
              />
            )}
            {hasRight && renderActions('sm:ml-auto')}
          </div>
        )}

        <div
          role="group"
          aria-label="Filtros de la tabla"
          className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2 sm:flex-row sm:flex-wrap sm:items-center"
        >
          {hasToggles && (
            <FilterBar
              searchValue=""
              onSearchChange={() => {}}
              showSearch={false}
              toggles={config.toggles}
              className="justify-start"
            />
          )}
          {config.selects!.map((sel) => (
            <Select
              key={sel.label}
              value={sel.value}
              items={sel.options}
              onValueChange={(v) => sel.onChange(v as string)}
            >
              <SelectTrigger aria-label={sel.label} className="h-9 w-full bg-background text-xs sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sel.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasLeft && (
        <FilterBar
          searchValue={config.search?.value ?? ''}
          onSearchChange={config.search?.onChange ?? (() => {})}
          searchPlaceholder={config.search?.placeholder}
          showSearch={config.search !== undefined}
          toggles={config.toggles}
          className={hasRight ? 'flex-1 min-w-[280px]' : 'w-full'}
        />
      )}

      {hasRight && renderActions(cn('shrink-0 flex-nowrap', !hasLeft && 'ml-auto'))}
    </div>
  );
}
