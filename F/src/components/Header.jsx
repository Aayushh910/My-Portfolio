export default function Header({ title, subtitle }) {
    return (
        <header className="site-header">
            <div className="site-header-bg" aria-hidden="true" />
            <div className="section-container">
                {title && (
                    <h1 className="site-header-title">
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="site-header-subtitle">{subtitle}</p>
                )}
            </div>
        </header>
    )
}
