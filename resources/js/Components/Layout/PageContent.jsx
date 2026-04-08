function joinClasses(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function PageContent({
    children,
    className = '',
    width = 'full',
    padded = true,
}) {
    const widthClass =
        width === 'narrow'
            ? 'max-w-3xl'
            : width === 'wide'
              ? 'w-fullx'
              : 'max-w-none';

    return (
        <div className="flex-1 overflow-y-auto">
            <div
                className={joinClasses(
                    'mx-auto w-full',
                    widthClass,
                    padded && 'px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
                    className,
                )}
            >
                {children}
            </div>
        </div>
    );
}
