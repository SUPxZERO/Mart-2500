import AppShell from '@/Components/Layout/AppShell';
import PageContent from '@/Components/Layout/PageContent';
import PageHeader from '@/Components/Layout/PageHeader';
import { t } from '@/i18n';
import {
    LayoutDashboard,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Users,
    Tags,
} from 'lucide-react';

export default function POSLayout({
    children,
    title,
    description,
    eyebrow = t('app.brand'),
    icon,
    actions,
    header,
    contentClassName = '',
    contentWidth = 'wide',
    contentPadded = true,
}) {
    const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';

    const navigation = [
        {
            href: '/pos',
            icon: ShoppingCart,
            label: t('nav.checkout'),
            description: t('nav.checkout_description'),
            active: pathname.startsWith('/pos'),
        },
        {
            href: '/items',
            icon: Package,
            label: 'Items',
            description: 'Manage product catalog',
            active: pathname.startsWith('/items'),
        },
        {
            href: '/categories',
            icon: Tags,
            label: 'Categories',
            description: 'Manage item categories',
            active: pathname.startsWith('/categories'),
        },
        {
            href: '/invoices',
            icon: Receipt,
            label: t('nav.invoices'),
            description: t('nav.invoices_description'),
            active: pathname.startsWith('/invoices'),
        },
        {
            href: '/customers',
            icon: Users,
            label: t('nav.customers'),
            description: t('nav.customers_description'),
            active: pathname.startsWith('/customers'),
        },
        {
            href: '/dashboard',
            icon: LayoutDashboard,
            label: t('nav.dashboard'),
            description: t('nav.dashboard_description'),
            active: pathname.startsWith('/dashboard'),
        },
        {
            href: '/settings',
            icon: Settings,
            label: t('nav.settings'),
            description: t('nav.settings_description'),
            active: pathname.startsWith('/settings'),
        },
    ];

    return (
        <AppShell brand={t('app.brand')} navigation={navigation}>
            {(title || header) && (
                <PageHeader
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    icon={icon}
                    actions={actions}
                >
                    {header}
                </PageHeader>
            )}

            <PageContent
                className={contentClassName}
                width={contentWidth}
                padded={contentPadded}
            >
                {children}
            </PageContent>
        </AppShell>
    );
}
