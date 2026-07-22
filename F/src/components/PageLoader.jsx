import { useState, useEffect } from 'react'

export default function PageLoader({ children }) {
    const [show, setShow] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setShow(false), 1000)
        return () => clearTimeout(t)
    }, [])

    if (show) {
        return (
            <div className="page-loader" aria-label="Loading">
                <div className="page-spinner" />
            </div>
        )
    }

    return children
}
